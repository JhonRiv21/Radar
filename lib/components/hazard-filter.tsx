"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { HAZARD_KINDS, KIND_ORDER } from "@/lib/assets/hazard-kinds";
import type { HazardKind } from "@/lib/types/hazard";

export type RangeDays = 1 | 15 | 30;

export const RANGE_OPTIONS: { value: RangeDays; label: string }[] = [
  { value: 1, label: "Hoy" },
  { value: 15, label: "15 días" },
  { value: 30, label: "30 días" },
];

const ALL_COUNTRIES = "all";

type Filterable = {
  kind: string;
  country: string | null;
  occurredAt: Date | string;
};

type ContextValue = {
  kinds: Set<HazardKind>;
  toggleKind: (kind: HazardKind) => void;
  range: RangeDays;
  setRange: (days: RangeDays) => void;
  country: string;
  setCountry: (country: string) => void;
  isVisible: (item: Filterable) => boolean;
  matchesKind: (kind: HazardKind) => boolean;
  matchesScope: (item: Filterable) => boolean;
};

const HazardFilterContext = createContext<ContextValue | null>(null);

export function HazardFilterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [kinds, setKinds] = useState<Set<HazardKind>>(new Set());
  const [range, setRange] = useState<RangeDays>(30);
  const [country, setCountry] = useState(ALL_COUNTRIES);

  const toggleKind = useCallback((kind: HazardKind) => {
    setKinds((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  }, []);

  const matchesKind = useCallback(
    (kind: HazardKind) => kinds.size === 0 || kinds.has(kind),
    [kinds],
  );

  const matchesScope = useCallback(
    (item: Filterable) => {
      if (country !== ALL_COUNTRIES && item.country !== country) return false;
      const cutoff = Date.now() - range * 24 * 60 * 60 * 1000;
      return new Date(item.occurredAt).getTime() >= cutoff;
    },
    [country, range],
  );

  const isVisible = useCallback(
    (item: Filterable) =>
      matchesKind(item.kind as HazardKind) && matchesScope(item),
    [matchesKind, matchesScope],
  );

  const value = useMemo(
    () => ({
      kinds,
      toggleKind,
      range,
      setRange,
      country,
      setCountry,
      isVisible,
      matchesKind,
      matchesScope,
    }),
    [kinds, toggleKind, range, country, isVisible, matchesKind, matchesScope],
  );

  return (
    <HazardFilterContext.Provider value={value}>
      {children}
    </HazardFilterContext.Provider>
  );
}

export function useHazardFilter() {
  const ctx = useContext(HazardFilterContext);
  if (!ctx) throw new Error("useHazardFilter fuera de HazardFilterProvider");
  return ctx;
}

export function RangeSelector() {
  const { range, setRange } = useHazardFilter();

  return (
    <div className="glass-soft flex overflow-hidden rounded-md text-xs">
      {RANGE_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setRange(option.value)}
          className={
            range === option.value
              ? "bg-accent/15 px-2.5 py-1 text-accent"
              : "px-2.5 py-1 text-muted transition-colors hover:text-foreground"
          }
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function KindChips() {
  const { kinds, toggleKind } = useHazardFilter();

  return (
    <div className="flex flex-wrap gap-1.5">
      {KIND_ORDER.map((kind) => {
        const meta = HAZARD_KINDS[kind];
        const on = kinds.has(kind);
        return (
          <button
            key={kind}
            type="button"
            onClick={() => toggleKind(kind)}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${
              on
                ? "border-white/30 bg-white/10 text-foreground"
                : "border-white/10 text-muted hover:text-foreground"
            }`}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: meta.color }}
            />
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}
