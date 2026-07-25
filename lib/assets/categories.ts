export type CategoryRule = {
  key: string;
  label: string;
  color: string;
  terms: string[];
};

export const CATEGORY_RULES: CategoryRule[] = [
  {
    key: "elecciones",
    label: "Elecciones",
    color: "text-sky-300 border-sky-400/30 bg-sky-400/10",
    terms: [
      "election", "elections", "electoral", "vote", "votes", "voting", "ballot",
      "poll", "polls", "candidate", "campaign", "referendum",
      "eleccion", "elecciones", "electoral", "voto", "votos", "votacion",
      "comicios", "candidato", "candidata", "campaña", "referendo", "urnas",
    ],
  },
  {
    key: "protestas",
    label: "Protestas",
    color: "text-amber-300 border-amber-400/30 bg-amber-400/10",
    terms: [
      "protest", "protests", "protesters", "riot", "riots", "demonstration",
      "demonstrators", "strike", "rally", "unrest", "march",
      "protesta", "protestas", "manifestacion", "manifestantes", "disturbios",
      "huelga", "paro", "marcha", "revuelta",
    ],
  },
  {
    key: "desastres",
    label: "Desastres",
    color: "text-rose-300 border-rose-400/30 bg-rose-400/10",
    terms: [
      "earthquake", "quake", "tsunami", "hurricane", "flood", "flooding",
      "wildfire", "storm", "cyclone", "landslide", "eruption", "drought",
      "sismo", "terremoto", "temblor", "huracan", "inundacion", "incendio",
      "tormenta", "ciclon", "deslizamiento", "erupcion", "sequia",
    ],
  },
];
