"use client";

import { useEffect, useRef, useState } from "react";
import {
  Map as MlMap,
  AttributionControl,
  NavigationControl,
  Popup,
  setWorkerUrl,
  type GeoJSONSource,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { hotspotsToGeoJson } from "@/lib/utils/geo";
import type { CountryHotspot } from "@/lib/types/event";

// Turbopack no resuelve el worker de MapLibre v6; se sirve desde /public (ver script copy:maplibre).
setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

type Projection = "globe" | "mercator";

const SATELLITE_TILES =
  "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg";

const DEGREES_PER_STEP = 3;
const STEP_MS = 1200;
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
    // En proyección de globo el background pinta la superficie del planeta: océano.
    // Tono cercano al satelital para que no se note mientras cargan los tiles.
    { id: "ocean", type: "background", paint: { "background-color": "#0b2138" } },
  ],
};

export function EventMap({ hotspots }: { hotspots: CountryHotspot[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const dataRef = useRef(hotspots);
  const [projection, setProjection] = useState<Projection>("globe");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = new MlMap({
      container,
      style: BASE_STYLE,
      center: [-20, 20],
      zoom: 1.6,
      attributionControl: false,
    });
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new AttributionControl({ compact: true }));
    mapRef.current = map;

    let spinning = true;
    let resumeTimer: ReturnType<typeof setTimeout> | undefined;

    const spin = () => {
      if (!spinning) return;
      const center = map.getCenter();
      center.lng -= DEGREES_PER_STEP;
      map.easeTo({ center, duration: STEP_MS, easing: (n) => n });
    };

    const pause = () => {
      spinning = false;
      clearTimeout(resumeTimer);
    };

    const resume = () => {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        spinning = true;
        spin();
      }, RESUME_DELAY_MS);
    };

    map.on("load", () => {
      // Mapa base best-effort: si el GeoJSON no carga, las burbujas igual se dibujan.
      map.addSource("world", { type: "geojson", data: "/world-countries.geojson" });
      map.addLayer({
        id: "land",
        type: "fill",
        source: "world",
        paint: { "fill-color": "#26332b" },
      });

      // Satelital real (NASA, dominio público, sin API key). Va encima del respaldo vectorial.
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
            8,
            100,
            42,
          ],
          "circle-color": "#ff2e88",
          "circle-opacity": 0.22,
          "circle-blur": 0.6,
        },
      });
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

      spin();
    });

    map.on("moveend", spin);
    map.on("mousedown", pause);
    map.on("touchstart", pause);
    map.on("wheel", pause);
    map.on("mouseup", resume);
    map.on("touchend", resume);

    return () => {
      clearTimeout(resumeTimer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    dataRef.current = hotspots;
    const source = mapRef.current?.getSource("hotspots") as
      | GeoJSONSource
      | undefined;
    if (source) source.setData(hotspotsToGeoJson(hotspots));
  }, [hotspots]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => map.setProjection({ type: projection });
    if (map.isStyleLoaded()) {
      apply();
      return;
    }
    map.once("load", apply);
    return () => {
      map.off("load", apply);
    };
  }, [projection]);

  return (
    <div className="relative">
      <div ref={containerRef} className="h-[440px] w-full" />
      <div className="absolute left-3 top-3 flex overflow-hidden rounded-md border border-border bg-panel/90 text-xs backdrop-blur">
        {(["globe", "mercator"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setProjection(type)}
            className={
              projection === type
                ? "bg-accent/15 px-3 py-1.5 text-accent"
                : "px-3 py-1.5 text-muted transition-colors hover:text-foreground"
            }
          >
            {type === "globe" ? "Globo" : "Plano"}
          </button>
        ))}
      </div>
    </div>
  );
}
