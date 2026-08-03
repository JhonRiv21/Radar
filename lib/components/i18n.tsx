"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  MESSAGES,
  LANG_COOKIE,
  type Lang,
  type MessageKey,
} from "@/lib/assets/i18n";

const ONE_YEAR = 60 * 60 * 24 * 365;

type Vars = Record<string, string | number>;

type ContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: MessageKey, vars?: Vars) => string;
};

const I18nContext = createContext<ContextValue | null>(null);

function format(text: string, vars?: Vars): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name) =>
    name in vars ? String(vars[name]) : match,
  );
}

// El idioma llega desde el servidor (cookie). Leerlo del cliente tras montar
// rompería la hidratación: los bloques bajo Suspense hidratan después del efecto.
export function I18nProvider({
  initialLang,
  children,
}: {
  initialLang: Lang;
  children: React.ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=${ONE_YEAR}; SameSite=Lax; Secure`;
    document.documentElement.lang = next;
  }, []);

  const t = useCallback(
    (key: MessageKey, vars?: Vars) => format(MESSAGES[key][lang], vars),
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n fuera de I18nProvider");
  return ctx;
}

export function LanguageSelector() {
  const { lang, setLang, t } = useI18n();

  return (
    <div
      className="glass-soft flex overflow-hidden rounded-full text-xs"
      role="group"
      aria-label={t("lang.label")}
    >
      {(["en", "es"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`cursor-pointer px-2.5 py-1 uppercase transition-colors ${
            lang === code
              ? "bg-accent/15 text-accent"
              : "text-muted hover:text-foreground"
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
