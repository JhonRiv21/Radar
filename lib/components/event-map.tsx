"use client";

import { useEffect, useRef } from "react";
import {
  Map as MlMap,
  NavigationControl,
  Popup,
  setWorkerUrl,
  type GeoJSONSource,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { hotspotsToGeoJson, graticule } from "@/lib/utils/geo";
import { useMapFocus } from "@/lib/components/map-focus";
import type { CountryHotspot } from "@/lib/types/event";
setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

const MIN_ZOOM = 1.6;
const DEFAULT_ZOOM = 2.3;
const MAX_ZOOM = 5.5;
const FOCUS_ZOOM = 4;
const PING_LAYERS = [
  "hotspots-ping-a",
  "hotspots-ping-b",
  "hotspots-ping-c",
  "hotspots-ping-d",
] as const;
const PING_CYCLE_MS = 3200;

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

export function EventMap({ hotspots }: { hotspots: CountryHotspot[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const dataRef = useRef(hotspots);
  const flyToRef = useRef<((lat: number, lng: number) => void) | null>(null);
  const { focus } = useMapFocus();

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
        data: hotspotsToGeoJson(dataRef.current),
      });
      map.addLayer({
        id: "hotspots-glow",
        type: "circle",
        source: "hotspots",
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "count"],
            1,
            14,
            100,
            56,
          ],
          "circle-color": "#ff2e88",
          "circle-opacity": 0.28,
          "circle-blur": 1,
        },
      });
      for (const id of PING_LAYERS) {
        map.addLayer({
          id,
          type: "circle",
          source: "hotspots",
          paint: {
            "circle-radius": 1,
            "circle-color": "transparent",
            "circle-opacity": 0,
            "circle-stroke-color": "#ff2e88",
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
            ["get", "count"],
            1,
            3,
            100,
            14,
          ],
          "circle-color": "#ff2e88",
          "circle-opacity": 0.95,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1,
          "circle-stroke-opacity": 0.8,
        },
      });

      map.on("click", "hotspots-core", (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const { country, count } = feature.properties as {
          country: string;
          count: number;
        };
        new Popup({ closeButton: false, offset: 10 })
          .setLngLat(e.lngLat)
          .setHTML(
            `<strong>${country}</strong><br/><span class="popup-count">${count}</span> eventos`,
          )
          .addTo(map);
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
        const elapsed = lastFrame ? (now - lastFrame) / 1000 : 0;
        lastFrame = now;

        if (spinning && !map.isMoving()) {
          const center = map.getCenter();
          center.lng -= DEGREES_PER_SECOND * elapsed;
          map.jumpTo({ center });
        }

        PING_LAYERS.forEach((id, index) => {
          if (!map.getLayer(id)) return;
          const phase =
            (now / PING_CYCLE_MS + index / PING_LAYERS.length) % 1;
          map.setPaintProperty(id, "circle-radius", [
            "interpolate",
            ["linear"],
            ["get", "count"],
            1,
            4 + phase * 26,
            100,
            14 + phase * 60,
          ]);
          map.setPaintProperty(
            id,
            "circle-stroke-opacity",
            0.6 * (1 - phase) ** 1.4,
          );
        });

        frameId = requestAnimationFrame(step);
      };
      frameId = requestAnimationFrame(step);
    };

    const applyPadding = () => {
      const wide = window.matchMedia("(min-width: 64rem)").matches;
      map.setPadding({
        left: wide ? container.clientWidth * 0.4 : 0,
        top: container.clientHeight * 0.12,
        right: 0,
        bottom: 0,
      });
    };
    map.once("load", applyPadding);
    window.addEventListener("resize", applyPadding);

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
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (focus) flyToRef.current?.(focus.lat, focus.lng);
  }, [focus]);

  useEffect(() => {
    dataRef.current = hotspots;
    const source = mapRef.current?.getSource("hotspots") as
      | GeoJSONSource
      | undefined;
    if (source) source.setData(hotspotsToGeoJson(hotspots));
  }, [hotspots]);

  return <div ref={containerRef} className="h-full w-full" />;
}
