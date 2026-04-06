import { curatedCafeRecords } from "../data/curatedRecords";
import type { CuratedCafeRecord, SourceCategory, Tag } from "../types/coffee";
import { createSupabaseClient } from "./supabaseClient";

interface CuratedMentionRow {
  confidence: number;
  evidence_note: string;
  source_url: string;
  espresso_boost: number | null;
  pour_over_boost: number | null;
  roaster_boost: number | null;
  credibility_boost: number | null;
  coffee_focus_boost: number | null;
  transparency_boost: number | null;
  signal_notes: string[] | null;
  avoid_notes: string[] | null;
  penalty_signals: string[] | null;
  curated_sources: {
    id: string;
    name: string;
    category: SourceCategory;
  } | {
    id: string;
    name: string;
    category: SourceCategory;
  }[] | null;
  curated_cafes: {
    name: string;
    city: string | null;
    neighborhood: string | null;
    tags: Tag[] | null;
  } | {
    name: string;
    city: string | null;
    neighborhood: string | null;
    tags: Tag[] | null;
  }[] | null;
}

function toCuratedRecord(row: CuratedMentionRow): CuratedCafeRecord | null {
  const source = Array.isArray(row.curated_sources) ? row.curated_sources[0] : row.curated_sources;
  const cafe = Array.isArray(row.curated_cafes) ? row.curated_cafes[0] : row.curated_cafes;

  if (!source || !cafe) {
    return null;
  }

  return {
    sourceId: source.id,
    sourceName: source.name,
    category: source.category,
    cafeName: cafe.name,
    city: cafe.city ?? undefined,
    neighborhood: cafe.neighborhood ?? undefined,
    confidence: row.confidence,
    tags: cafe.tags ?? ["specialty"],
    evidenceNote: row.evidence_note,
    sourceUrl: row.source_url,
    espressoBoost: row.espresso_boost ?? undefined,
    pourOverBoost: row.pour_over_boost ?? undefined,
    roasterBoost: row.roaster_boost ?? undefined,
    credibilityBoost: row.credibility_boost ?? undefined,
    coffeeFocusBoost: row.coffee_focus_boost ?? undefined,
    transparencyBoost: row.transparency_boost ?? undefined,
    signalNotes: row.signal_notes ?? undefined,
    avoidNotes: row.avoid_notes ?? undefined,
    penaltySignals: row.penalty_signals ?? undefined
  };
}

export async function loadCuratedCafeRecords(): Promise<{
  records: CuratedCafeRecord[];
  mode: "supabase" | "local";
  note: string;
}> {
  const supabase = createSupabaseClient();

  if (!supabase) {
    return {
      records: curatedCafeRecords,
      mode: "local",
      note: "Using bundled curated source records because Supabase is not configured."
    };
  }

  const { data, error } = await supabase
    .from("curated_mentions")
    .select(`
      confidence,
      evidence_note,
      source_url,
      espresso_boost,
      pour_over_boost,
      roaster_boost,
      credibility_boost,
      coffee_focus_boost,
      transparency_boost,
      signal_notes,
      avoid_notes,
      penalty_signals,
      curated_sources (
        id,
        name,
        category
      ),
      curated_cafes (
        name,
        city,
        neighborhood,
        tags
      )
    `);

  if (error) {
    return {
      records: curatedCafeRecords,
      mode: "local",
      note: `Supabase curated-source lookup failed, so the app used bundled records instead. ${error.message}`
    };
  }

  const records = (data ?? [])
    .map((row) => toCuratedRecord(row as CuratedMentionRow))
    .filter((record): record is CuratedCafeRecord => record !== null);

  if (records.length === 0) {
    return {
      records: curatedCafeRecords,
      mode: "local",
      note: "Supabase returned no curated rows yet, so the app used bundled records instead."
    };
  }

  return {
    records,
    mode: "supabase",
    note: `Loaded ${records.length} curated source records from Supabase.`
  };
}
