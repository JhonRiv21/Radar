export type Lang = "en" | "es";

// Vive aquí y no en el provider: un componente de servidor no puede importar
// valores reales desde un módulo "use client" (Next los vuelve referencias).
export const LANG_COOKIE = "radar-lang";
export const DEFAULT_LANG: Lang = "en";

export function parseLang(value?: string): Lang {
  return value === "es" ? "es" : DEFAULT_LANG;
}

export type Translation = Record<Lang, string>;

// Inglés primero: las noticias y los eventos de las fuentes vienen en inglés.
export const MESSAGES = {
  "brand.tagline": { en: "· natural hazards", es: "· fenómenos naturales" },
  "brand.credit": { en: "Built by", es: "Creado por" },

  "lang.label": { en: "Language", es: "Idioma" },

  "panel.open": { en: "Open panel", es: "Abrir panel" },
  "panel.close": { en: "Close panel", es: "Cerrar panel" },

  "stats.title": { en: "Natural activity", es: "Actividad natural" },
  "stats.empty": {
    en: "No events for this filter.",
    es: "Sin eventos para este filtro.",
  },
  "stats.filterBy": { en: "Filter {label}", es: "Filtrar {label}" },

  "range.today": { en: "Today", es: "Hoy" },
  "range.15d": { en: "15 days", es: "15 días" },
  "range.30d": { en: "30 days", es: "30 días" },

  "country.all": { en: "All countries", es: "Todos los países" },
  "country.search": { en: "Search country…", es: "Buscar país…" },
  "country.noResults": { en: "No results", es: "Sin resultados" },

  "events.title": { en: "Latest events", es: "Últimos eventos" },
  "events.count": { en: "{shown} of {total} · {range}", es: "{shown} de {total} · {range}" },
  "events.loading": { en: "Loading more events…", es: "Cargando más eventos…" },
  "events.end": {
    en: "{total} events · end of history",
    es: "{total} eventos · fin del historial",
  },
  "events.empty": {
    en: "No events for this filter.",
    es: "Sin eventos para este filtro.",
  },

  "card.showOnMap": { en: "Show on map", es: "Ver en el mapa" },
  "card.detail": { en: "View details ›", es: "Ver detalle ›" },
  "card.tsunami": { en: "tsunami", es: "tsunami" },
  "card.alert": { en: "{level} alert", es: "alerta {level}" },

  "map.live": { en: "Live", es: "En vivo" },
  "map.pause": { en: "Pause animation", es: "Pausar animación" },
  "map.resume": { en: "Resume animation", es: "Reanudar animación" },
  "map.close": { en: "Close", es: "Cerrar" },

  "health.empty": { en: "no data yet", es: "sin datos aún" },
  "health.error": { en: "update failed", es: "fallo al actualizar" },
  "health.fresh": { en: "updated", es: "actualizado" },
  "health.stale": { en: "stale", es: "desactualizado" },

  "error.title": {
    en: "No database connection.",
    es: "No hay conexión a la base de datos.",
  },
  "error.help": {
    en: "Copy .env.example to .env.local, add your Supabase credentials and run npm run db:migrate.",
    es: "Copia .env.example a .env.local, pon tus credenciales de Supabase y corre npm run db:migrate.",
  },

  "kind.earthquake": { en: "Earthquakes", es: "Sismos" },
  "kind.wildfire": { en: "Wildfires", es: "Incendios" },
  "kind.flood": { en: "Floods", es: "Inundaciones" },
  "kind.storm": { en: "Storms", es: "Tormentas" },
  "kind.volcano": { en: "Volcanoes", es: "Volcanes" },
  "kind.drought": { en: "Droughts", es: "Sequías" },
  "kind.ice": { en: "Sea ice", es: "Hielo marino" },
} as const satisfies Record<string, Translation>;

export type MessageKey = keyof typeof MESSAGES;

export const LOCALES: Record<Lang, string> = {
  en: "en-US",
  es: "es-CO",
};
