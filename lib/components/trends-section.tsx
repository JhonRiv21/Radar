import { getTrendingTerms } from "@/lib/services/trends";
import { TrendingPanel } from "@/lib/components/trending-panel";
import type { TrendingTerm } from "@/lib/types/event";

export async function TrendsSection() {
  let terms: TrendingTerm[];
  try {
    terms = await getTrendingTerms();
  } catch {
    return null;
  }
  return <TrendingPanel terms={terms} />;
}
