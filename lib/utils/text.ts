import { CATEGORY_RULES, type CategoryRule } from "@/lib/assets/categories";
import { STOPWORDS } from "@/lib/assets/stopwords";

const STOPWORD_SET = new Set(STOPWORDS);
// Marcas diacríticas combinantes que deja NFD; en literal serían caracteres invisibles.
const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

export function normalize(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(DIACRITICS, "");
}

export function tokenize(title: string): string[] {
  return normalize(title)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 4 && !STOPWORD_SET.has(t));
}

export function classify(title: string | null): CategoryRule | null {
  if (!title) return null;
  const tokens = new Set(tokenize(title));
  return (
    CATEGORY_RULES.find((rule) => rule.terms.some((t) => tokens.has(t))) ?? null
  );
}

// Jaccard sobre tokens: detecta la misma noticia publicada por varios medios.
export function similarity(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const token of a) if (b.has(token)) shared++;
  return shared / (a.size + b.size - shared);
}
