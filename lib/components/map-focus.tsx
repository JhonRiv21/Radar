"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type MapFocus = {
  lat: number;
  lng: number;
  country: string | null;
  eventId: string;
  token: number;
};

type ContextValue = {
  focus: MapFocus | null;
  focusOn: (target: Omit<MapFocus, "token">) => void;
};

const MapFocusContext = createContext<ContextValue>({
  focus: null,
  focusOn: () => {},
});

export function MapFocusProvider({ children }: { children: React.ReactNode }) {
  const [focus, setFocus] = useState<MapFocus | null>(null);

  const focusOn = useCallback((target: Omit<MapFocus, "token">) => {
    setFocus({ ...target, token: Date.now() });
  }, []);

  const value = useMemo(() => ({ focus, focusOn }), [focus, focusOn]);

  return (
    <MapFocusContext.Provider value={value}>{children}</MapFocusContext.Provider>
  );
}

export function useMapFocus() {
  return useContext(MapFocusContext);
}
