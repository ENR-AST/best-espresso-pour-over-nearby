import { curatedCafeRecords } from "./curatedRecords";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface CuratedSourceSeedRow {
  id: string;
  name: string;
  category: string;
  home_url: string;
}

export interface CuratedCafeSeedRow {
  id: string;
  name: string;
  city: string | null;
  neighborhood: string | null;
  tags: string[];
}

export interface CuratedMentionSeedRow {
  source_id: string;
  cafe_id: string;
  confidence: number;
  evidence_note: string;
  source_url: string;
  espresso_boost: number | null;
  pour_over_boost: number | null;
  roaster_boost: number | null;
  credibility_boost: number | null;
  coffee_focus_boost: number | null;
  transparency_boost: number | null;
  signal_notes: string[];
  avoid_notes: string[];
  penalty_signals: string[];
}

export interface CuratedSeedPayload {
  sources: CuratedSourceSeedRow[];
  cafes: CuratedCafeSeedRow[];
  mentions: CuratedMentionSeedRow[];
}

export function buildCuratedSeedPayload(): CuratedSeedPayload {
  const sourcesById = new Map<string, CuratedSourceSeedRow>();
  const cafesById = new Map<string, CuratedCafeSeedRow>();
  const mentions: CuratedMentionSeedRow[] = [];

  for (const record of curatedCafeRecords) {
    sourcesById.set(record.sourceId, {
      id: record.sourceId,
      name: record.sourceName,
      category: record.category,
      home_url: record.sourceUrl
    });

    const cafeId = slugify([
      record.cafeName,
      record.city ?? "",
      record.neighborhood ?? ""
    ].filter(Boolean).join("-"));

    const existingCafe = cafesById.get(cafeId);
    if (!existingCafe) {
      cafesById.set(cafeId, {
        id: cafeId,
        name: record.cafeName,
        city: record.city ?? null,
        neighborhood: record.neighborhood ?? null,
        tags: [...record.tags]
      });
    } else {
      existingCafe.tags = Array.from(new Set([...existingCafe.tags, ...record.tags]));
    }

    mentions.push({
      source_id: record.sourceId,
      cafe_id: cafeId,
      confidence: record.confidence,
      evidence_note: record.evidenceNote,
      source_url: record.sourceUrl,
      espresso_boost: record.espressoBoost ?? null,
      pour_over_boost: record.pourOverBoost ?? null,
      roaster_boost: record.roasterBoost ?? null,
      credibility_boost: record.credibilityBoost ?? null,
      coffee_focus_boost: record.coffeeFocusBoost ?? null,
      transparency_boost: record.transparencyBoost ?? null,
      signal_notes: record.signalNotes ?? [],
      avoid_notes: record.avoidNotes ?? [],
      penalty_signals: record.penaltySignals ?? []
    });
  }

  return {
    sources: Array.from(sourcesById.values()),
    cafes: Array.from(cafesById.values()),
    mentions
  };
}

export const curatedSeedPayload = buildCuratedSeedPayload();
