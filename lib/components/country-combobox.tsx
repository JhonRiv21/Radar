"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, COUNTRY_BY_NAME } from "@/lib/assets/countries";
import { useHazardFilter } from "@/lib/components/hazard-filter";
import { useI18n } from "@/lib/components/i18n";

const ALL = "all";
const MENU_WIDTH = 256; // w-64
const EDGE_GAP = 16;

export function countryFlag(name: string | null): string {
  if (!name) return "";
  const code = COUNTRY_BY_NAME[name];
  return code ? COUNTRIES[code].flag : "";
}

export function CountryCombobox({ countries }: { countries: string[] }) {
  const { country, setCountry } = useHazardFilter();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(true);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter((name) => name.toLowerCase().includes(q));
  }, [countries, query]);

  // Anclado a la derecha el menú crece hacia la izquierda; si no cabe, se voltea.
  const toggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    const rect = rootRef.current?.getBoundingClientRect();
    setAlignRight(!rect || rect.right >= MENU_WIDTH + EDGE_GAP);
    setOpen(true);
  };

  const select = (value: string) => {
    setCountry(value);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        className="glass-soft flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-muted transition-colors hover:text-foreground"
      >
        {country === ALL ? (
          t("country.all")
        ) : (
          <>
            <span aria-hidden="true">{countryFlag(country)}</span>
            <span className="max-w-32 truncate">{country}</span>
          </>
        )}
        <span className="opacity-60">▾</span>
      </button>

      {open && (
        <div
          className={`glass absolute z-20 mt-1 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg ${
            alignRight ? "right-0" : "left-0"
          }`}
        >
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("country.search")}
            className="w-full border-b border-white/10 bg-transparent px-3 py-2 text-xs outline-none placeholder:text-muted"
          />
          <ul className="max-h-64 overflow-y-auto py-1">
            <li>
              <button
                type="button"
                onClick={() => select(ALL)}
                className={`w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-white/10 ${
                  country === ALL ? "text-accent" : "text-muted"
                }`}
              >
                {t("country.all")}
              </button>
            </li>
            {filtered.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => select(name)}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-white/10 ${
                    country === name ? "text-accent" : ""
                  }`}
                >
                  <span aria-hidden="true">{countryFlag(name)}</span>
                  <span className="truncate">{name}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-xs text-muted">{t("country.noResults")}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
