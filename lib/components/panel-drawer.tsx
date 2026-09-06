"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useI18n } from "@/lib/components/i18n";

const PanelContext = createContext<{ open: boolean; toggle: () => void }>({
  open: false,
  toggle: () => {},
});

export function PanelProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const value = useMemo(() => ({ open, toggle }), [open, toggle]);

  return (
    <PanelContext.Provider value={value}>{children}</PanelContext.Provider>
  );
}

// Solo en móvil: en escritorio los paneles están siempre visibles.
export function PanelToggle() {
  const { open, toggle } = useContext(PanelContext);
  const { t } = useI18n();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={open}
      aria-label={t(open ? "panel.close" : "panel.open")}
      className="glass flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-sm transition-colors hover:text-accent lg:hidden"
    >
      {open ? "✕" : "☰"}
    </button>
  );
}

export function PanelDrawer({ children }: { children: React.ReactNode }) {
  const { open } = useContext(PanelContext);

  return (
    <div
      className={`pointer-events-auto absolute inset-y-0 left-0 z-20 flex w-full min-h-0 flex-col gap-4 p-4 transition-transform duration-300 ease-out lg:static lg:w-2/5 lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-[105%]"
      }`}
    >
      {children}
    </div>
  );
}
