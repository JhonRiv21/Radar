"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Map as MlMap,
  NavigationControl,
  LngLatBounds,
  setWorkerUrl,
  type GeoJSONSource,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { hazardsToGeoJson, graticule } from "@/lib/utils/geo";
import { useMapFocus } from "@/lib/components/map-focus";
import { MapDetail } from "@/lib/components/map-detail";
import { useHazardFilter } from "@/lib/components/hazard-filter";
import type { HazardPoint } from "@/lib/types/hazard";
setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

const MIN_ZOOM = 1.6;
const DEFAULT_ZOOM = 2.3;
const MAX_ZOOM = 7.5;
const FOCUS_ZOOM = 6;
const COUNTRY_MAX_ZOOM = 5.5;
const PING_LAYERS = [
  "hotspots-ping-a",
  "hotspots-ping-b",
  "hotspots-ping-c",
  "hotspots-ping-d",
] as const;
const PING_CYCLE_MS = 3200;
const PING_MIN_WEIGHT = 5;
// El bucle de medición de error del globo (MapLibre) corre en cada render.
// A 60fps satura la consola con warnings de readback; 20fps basta para esta rotación lenta.
const FRAME_MS = 1000 / 20;

const SATELLITE_TILES =
  "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg";

const DEGREES_PER_SECOND = 2.4;
const RESUME_DELAY_MS = 4000;

const BASE_STYLE: StyleSpecification = {
  version: 8,
  projection: { type: "globe" },
  sources: {},
  sky: {
    "sky-color": "#4aa3df",
    "horizon-color": "#8ec9ef",
    "fog-color": "#0a0e1a",
    "sky-horizon-blend": 0.7,
    "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 5, 0.4, 7, 0],
  },
  layers: [
    { id: "ocean", type: "background", paint: { "background-color": "#0b2138" } },
  ],
};

export function EventMap({ points }: { points: HazardPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const dataRef = useRef(points);
  const flyToRef = useRef<((lat: number, lng: number) => void) | null>(null);
  const fitRef = useRef<((coords: [number, number][]) => void) | null>(null);
  const { focus, focusOn, clearFocus } = useMapFocus();
  const { isVisible, country } = useHazardFilter();
  const [autoSpin, setAutoSpin] = useState(true);
  const autoSpinRef = useRef(true);
  const focusOnRef = useRef(focusOn);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = new MlMap({
      container,
      style: BASE_STYLE,
      center: [-20, 20],
      zoom: DEFAULT_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      attributionControl: false,
    });
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    let spinning = true;
    let resumeTimer: ReturnType<typeof setTimeout> | undefined;

    const pause = () => {
      spinning = false;
      clearTimeout(resumeTimer);
    };

    const resume = () => {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        spinning = true;
      }, RESUME_DELAY_MS);
    };

    map.on("load", () => {
      map.addSource("world", { type: "geojson", data: "/world-countries.geojson" });
      map.addLayer({
        id: "land",
        type: "fill",
        source: "world",
        paint: { "fill-color": "#26332b" },
      });

      map.addSource("satellite", {
        type: "raster",
        tiles: [SATELLITE_TILES],
        tileSize: 256,
        maxzoom: 8,
        attribution: "Imágenes: NASA EOSDIS GIBS",
      });
      map.addLayer({ id: "satellite", type: "raster", source: "satellite" });

      map.addLayer({
        id: "borders",
        type: "line",
        source: "world",
        paint: {
          "line-color": "#ffffff",
          "line-width": 0.5,
          "line-opacity": 0.25,
          "line-dasharray": [2, 2],
        },
      });

      map.addSource("graticule", { type: "geojson", data: graticule() });
      map.addLayer({
        id: "graticule",
        type: "line",
        source: "graticule",
        paint: {
          "line-color": "#7dd3fc",
          "line-width": 0.5,
          "line-opacity": 0.16,
        },
      });

      map.addSource("hotspots", {
        type: "geojson",
        data: hazardsToGeoJson(dataRef.current),
      });
      map.addLayer({
        id: "hotspots-glow",
        type: "circle",
        source: "hotspots",
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "weight"],
            3,
            8,
            8,
            34,
          ],
          "circle-color": ["get", "color"],
          "circle-opacity": 0.25,
          "circle-blur": 1,
        },
      });
      for (const id of PING_LAYERS) {
        map.addLayer({
          id,
          type: "circle",
          source: "hotspots",
          // Solo pulsan los eventos notables: menos ruido visual y mucho menos trabajo por frame.
          filter: [">=", ["get", "weight"], PING_MIN_WEIGHT],
          paint: {
            "circle-radius": 1,
            "circle-color": "transparent",
            "circle-opacity": 0,
            "circle-stroke-color": ["get", "color"],
            "circle-stroke-width": 1.5,
            "circle-stroke-opacity": 0,
          },
        });
      }
      map.addLayer({
        id: "hotspots-core",
        type: "circle",
        source: "hotspots",
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "weight"],
            3,
            3,
            8,
            12,
          ],
          "circle-color": ["get", "color"],
          "circle-opacity": 0.95,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1,
          "circle-stroke-opacity": 0.8,
        },
      });

      map.on("click", "hotspots-core", (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const { id } = feature.properties as { id: string };
        const point = dataRef.current.find((p) => p.id === id);
        if (!point) return;
        focusOnRef.current({
          lat: point.lat,
          lng: point.lng,
          country: point.country,
          eventId: point.id,
        });
      });
      map.on("mouseenter", "hotspots-core", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "hotspots-core", () => {
        map.getCanvas().style.cursor = "";
      });

      startLoop();
    });

    let frameId = 0;
    let lastFrame = 0;
    const startLoop = () => {
      const step = (now: number) => {
        frameId = requestAnimationFrame(step);

        // Un solo acelerador para todo: menos renders = menos readbacks del globo.
        if (now - lastFrame < FRAME_MS) return;
        const elapsed = lastFrame ? (now - lastFrame) / 1000 : 0;
        lastFrame = now;

        // En pausa o pestaña oculta no se toca el mapa: sin renders, sin lecturas de GPU.
        if (document.hidden || !autoSpinRef.current) return;

        if (spinning && !map.isMoving()) {
          const center = map.getCenter();
          center.lng -= DEGREES_PER_SECOND * elapsed;
          map.jumpTo({ center });
        }

        PING_LAYERS.forEach((id, index) => {
          if (!map.getLayer(id)) return;
          const phase =
            (now / PING_CYCLE_MS + index / PING_LAYERS.length) % 1;
          map.setPaintProperty(id, "circle-radius", 6 + phase * 34);
          map.setPaintProperty(
            id,
            "circle-stroke-opacity",
            0.6 * (1 - phase) ** 1.4,
          );
        });
      };
      frameId = requestAnimationFrame(step);
    };

    // Centra el globo en el área libre: la píldora de arriba y la tira de abajo lo recortan.
    const applyPadding = () => {
      const wide = window.matchMedia("(min-width: 64rem)").matches;
      map.setPadding({
        left: wide ? container.clientWidth * 0.4 : 0,
        top: container.clientHeight * 0.06,
        right: 0,
        bottom: container.clientHeight * 0.06,
      });
    };
    map.once("load", applyPadding);
    window.addEventListener("resize", applyPadding);

    fitRef.current = (coords) => {
      if (!coords.length) return;
      pause();
      const bounds = coords.reduce(
        (acc, c) => acc.extend(c),
        new LngLatBounds(coords[0], coords[0]),
      );
      map.fitBounds(bounds, {
        padding: 80,
        maxZoom: COUNTRY_MAX_ZOOM,
        duration: 1600,
      });
      resume();
    };

    flyToRef.current = (lat, lng) => {
      pause();
      map.flyTo({ center: [lng, lat], zoom: FOCUS_ZOOM, duration: 1600 });
      resume();
    };

    map.on("mousedown", pause);
    map.on("touchstart", pause);
    map.on("wheel", pause);
    map.on("mouseup", resume);
    map.on("touchend", resume);

    return () => {
      clearTimeout(resumeTimer);
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", applyPadding);
      flyToRef.current = null;
      fitRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const visible = useMemo(
    () =>
      points.filter((p) =>
        isVisible({ kind: p.kind, country: p.country, occurredAt: p.occurredAt }),
      ),
    [points, isVisible],
  );

  useEffect(() => {
    if (focus) flyToRef.current?.(focus.lat, focus.lng);
  }, [focus]);

  // Al elegir país se encuadra a sus eventos, no a un centroide fijo.
  useEffect(() => {
    if (country === "all") return;
    const coords = points
      .filter((p) => p.country === country)
      .map((p) => [p.lng, p.lat] as [number, number]);
    fitRef.current?.(coords);
  }, [country, points]);

  useEffect(() => {
    const filtered = visible;
    dataRef.current = filtered;
    const source = mapRef.current?.getSource("hotspots") as
      | GeoJSONSource
      | undefined;
    if (source) source.setData(hazardsToGeoJson(filtered));
  }, [visible]);

  useEffect(() => {
    focusOnRef.current = focusOn;
  }, [focusOn]);

  const selectedPoint = focus
    ? (points.find((p) => p.id === focus.eventId) ?? null)
    : null;

  const toggleSpin = () => {
    const next = !autoSpin;
    autoSpinRef.current = next;
    setAutoSpin(next);
  };

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {selectedPoint && (
        <MapDetail point={selectedPoint} onClose={() => clearFocus()} />
      )}

      <button
        type="button"
        onClick={toggleSpin}
        title={autoSpin ? "Pausar animación" : "Reanudar animación"}
        aria-label={autoSpin ? "Pausar animación" : "Reanudar animación"}
        className="glass-soft absolute right-2.5 top-44 flex h-7 w-7 items-center justify-center rounded text-sm text-muted transition-colors hover:text-foreground"
      >
        {autoSpin ? "❚❚" : "▶"}
      </button>
    </div>
  );
}
