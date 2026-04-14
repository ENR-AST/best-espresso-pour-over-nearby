import type { CuratedCafeRecord, SourceCategory, Tag } from "../types/coffee";
import { geocodeAddress } from "./liveCoffee";
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
  street_address: string | null;
  city: string | null;
  state: string | null;
  neighborhood: string | null;
  zip_code: string | null;
  latitude: number | null;
  longitude: number | null;
  tags: Tag[];
}

export interface AdminPersonalCafeInput {
  name: string;
  streetAddress: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  zipCode?: string;
  tags: Tag[];
  overallScore: number;
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

export async function sendAdminMagicLink(email: string): Promise<void> {
  const supabase = requireSupabase();
  const redirectTo =
    import.meta.env.VITE_ADMIN_REDIRECT_URL ||
    (typeof window !== "undefined" ? window.location.origin : undefined);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo
    }
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signOutAdmin(): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
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
    .select("id, slug, name, street_address, city, state, neighborhood, zip_code, latitude, longitude, tags")
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
  streetAddress?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  tags: Tag[];
}): Promise<AdminCafeRow> {
  const supabase = requireSupabase();
  const slug = slugify([input.name, input.city ?? "", input.neighborhood ?? "", input.streetAddress ?? ""].filter(Boolean).join("-"));
  const { error } = await supabase
    .from("curated_cafes")
    .upsert(
      {
        slug,
        name: input.name,
        street_address: input.streetAddress ?? null,
        city: input.city ?? null,
        state: input.state ?? null,
        neighborhood: input.neighborhood ?? null,
        zip_code: input.zipCode ?? null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        tags: input.tags
      },
      { onConflict: "slug" }
    );
    
  if (error) {
    throw new Error(error.message);
  }

  const { data: selectedRow, error: selectError } = await supabase
    .from("curated_cafes")
    .select("id, slug, name, street_address, city, state, neighborhood, zip_code, latitude, longitude, tags")
    .eq("slug", slug)
    .single();

  if (selectError) {
    throw new Error(selectError.message);
  }

  return selectedRow as AdminCafeRow;
}

export async function createPersonalCafe(input: AdminPersonalCafeInput): Promise<void> {
  const supabase = requireSupabase();
  const trimmedName = input.name.trim();
  if (!trimmedName) {
    throw new Error("Coffee shop name is required.");
  }

  const trimmedStreetAddress = input.streetAddress.trim();
  if (!trimmedStreetAddress) {
    throw new Error("Street address is required.");
  }

  const trimmedCity = input.city?.trim();
  if (!trimmedCity) {
    throw new Error("City is required.");
  }

  const trimmedState = input.state?.trim();
  if (!trimmedState) {
    throw new Error("State is required.");
  }

  const trimmedZipCode = input.zipCode?.trim();
  if (!trimmedZipCode) {
    throw new Error("ZIP code is required.");
  }

  const geocodeQuery = [trimmedStreetAddress, trimmedCity, trimmedState, trimmedZipCode].filter(Boolean).join(", ");
  const geocoded = await geocodeAddress(geocodeQuery);

  const cafe = await createCuratedCafe({
    name: trimmedName,
    streetAddress: trimmedStreetAddress,
    city: trimmedCity,
    state: trimmedState,
    neighborhood: input.neighborhood?.trim() || undefined,
    zipCode: trimmedZipCode,
    latitude: geocoded?.latitude,
    longitude: geocoded?.longitude,
    tags: input.tags
  });

  await createCuratedSource({
    id: "your-list",
    name: "Your list",
    category: "community",
    home_url: null
  });

  const score = Math.max(1, Math.min(10, input.overallScore));
  const boost = Number((score / 10).toFixed(2));

  await createCuratedMention({
    sourceId: "your-list",
    cafeId: cafe.id,
    confidence: 0.95,
    evidenceNote: "Added by you from the admin editor as a personally selected coffee shop.",
    sourceUrl: import.meta.env.VITE_ADMIN_REDIRECT_URL || "https://best-espresso-pour-over-nearby.vercel.app",
    espressoBoost: boost,
    pourOverBoost: boost,
    roasterBoost: input.tags.includes("roaster") ? boost : Math.max(0.2, Number((boost * 0.5).toFixed(2))),
    credibilityBoost: boost,
    coffeeFocusBoost: boost,
    transparencyBoost: boost,
    signalNotes: [`your overall rank is ${score}/10`],
    avoidNotes: [],
    penaltySignals: []
  });
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
      streetAddress: cafe.street_address ?? undefined,
      evidenceNote: mention.evidence_note,
      state: cafe.state ?? undefined,
      zipCode: cafe.zip_code ?? undefined,
      latitude: cafe.latitude ?? undefined,
      longitude: cafe.longitude ?? undefined,
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
