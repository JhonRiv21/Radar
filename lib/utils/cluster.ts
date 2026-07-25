import { tokenize, similarity } from "@/lib/utils/text";
import type { EventRow, EventCluster } from "@/lib/types/event";

const SIMILARITY_THRESHOLD = 0.45;

// Agrupa la misma noticia cubierta por varios medios.
export function clusterEvents(events: EventRow[]): EventCluster[] {
  const clusters: (EventCluster & { tokens: Set<string> })[] = [];

  for (const event of events) {
    const tokens = new Set(tokenize(event.title ?? ""));
    const match = tokens.size
      ? clusters.find((c) => similarity(c.tokens, tokens) >= SIMILARITY_THRESHOLD)
      : undefined;

    if (match) {
      match.coverage++;
      if (event.sourceDomain && !match.sources.includes(event.sourceDomain)) {
        match.sources.push(event.sourceDomain);
      }
      continue;
    }

    clusters.push({
      lead: event,
      coverage: 1,
      sources: event.sourceDomain ? [event.sourceDomain] : [],
      tokens,
    });
  }

  return clusters.map(({ lead, coverage, sources }) => ({
    lead,
    coverage,
    sources,
  }));
}
