import type { CuratedCafeRecord, SourceCategory, Tag } from "../types/coffee";
import { createSupabaseClient } from "./supabaseClient";

export interface AdminSourceRow {
  id: string;
  name: string;
  category: SourceCategory;
  home_url: string | null;
}

export interface AdminCafeRow {
  id: number;
  slug: string;
  name: string;
  city: string | null;
  neighborhood: string | null;
  tags: Tag[];
}

export interface AdminMentionInput {
  sourceId: string;
  cafeId: number;
  confidence: number;
  evidenceNote: string;
  sourceUrl: string;
  espressoBoost?: number;
  pourOverBoost?: number;
  roasterBoost?: number;
  credibilityBoost?: number;
  coffeeFocusBoost?: number;
  transparencyBoost?: number;
  signalNotes: string[];
  avoidNotes: string[];
  penaltySignals: string[];
}

function requireSupabase() {
  const supabase = createSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured for this environment.");
  }

  return supabase;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function listCuratedSources(): Promise<AdminSourceRow[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("curated_sources")
    .select("id, name, category, home_url")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AdminSourceRow[];
}

export async function listCuratedCafes(): Promise<AdminCafeRow[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("curated_cafes")
    .select("id, slug, name, city, neighborhood, tags")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AdminCafeRow[];
}

export async function createCuratedSource(input: AdminSourceRow): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase
    .from("curated_sources")
    .upsert(
      {
        id: input.id,
        name: input.name,
        category: input.category,
        home_url: input.home_url
      },
      { onConflict: "id" }
    );

  if (error) {
    throw new Error(error.message);
  }
}

export async function createCuratedCafe(input: {
  name: string;
  city?: string;
  neighborhood?: string;
  tags: Tag[];
}): Promise<void> {
  const supabase = requireSupabase();
  const slug = slugify([input.name, input.city ?? "", input.neighborhood ?? ""].filter(Boolean).join("-"));
  const { error } = await supabase
    .from("curated_cafes")
    .upsert(
      {
        slug,
        name: input.name,
        city: input.city ?? null,
        neighborhood: input.neighborhood ?? null,
        tags: input.tags
      },
      { onConflict: "slug" }
    );

  if (error) {
    throw new Error(error.message);
  }
}

export async function createCuratedMention(input: AdminMentionInput): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase
    .from("curated_mentions")
    .upsert(
      {
        source_id: input.sourceId,
        cafe_id: input.cafeId,
        confidence: input.confidence,
        evidence_note: input.evidenceNote,
        source_url: input.sourceUrl,
        espresso_boost: input.espressoBoost ?? null,
        pour_over_boost: input.pourOverBoost ?? null,
        roaster_boost: input.roasterBoost ?? null,
        credibility_boost: input.credibilityBoost ?? null,
        coffee_focus_boost: input.coffeeFocusBoost ?? null,
        transparency_boost: input.transparencyBoost ?? null,
        signal_notes: input.signalNotes,
        avoid_notes: input.avoidNotes,
        penalty_signals: input.penaltySignals
      },
      { onConflict: "source_id,cafe_id,source_url" }
    );

  if (error) {
    throw new Error(error.message);
  }
}

export function convertAdminRowsToCuratedRecords(
  sources: AdminSourceRow[],
  cafes: AdminCafeRow[],
  mentions: Array<{
    source_id: string;
    cafe_id: number;
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
  }>
): CuratedCafeRecord[] {
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const cafeById = new Map(cafes.map((cafe) => [cafe.id, cafe]));

  return mentions.flatMap((mention) => {
    const source = sourceById.get(mention.source_id);
    const cafe = cafeById.get(mention.cafe_id);

    if (!source || !cafe) {
      return [];
    }

    return [{
      sourceId: source.id,
      sourceName: source.name,
      category: source.category,
      cafeName: cafe.name,
      city: cafe.city ?? undefined,
      neighborhood: cafe.neighborhood ?? undefined,
      confidence: mention.confidence,
      tags: cafe.tags,
      evidenceNote: mention.evidence_note,
      sourceUrl: mention.source_url,
      espressoBoost: mention.espresso_boost ?? undefined,
      pourOverBoost: mention.pour_over_boost ?? undefined,
      roasterBoost: mention.roaster_boost ?? undefined,
      credibilityBoost: mention.credibility_boost ?? undefined,
      coffeeFocusBoost: mention.coffee_focus_boost ?? undefined,
      transparencyBoost: mention.transparency_boost ?? undefined,
      signalNotes: mention.signal_notes ?? undefined,
      avoidNotes: mention.avoid_notes ?? undefined,
      penaltySignals: mention.penalty_signals ?? undefined
    }];
  });
}
