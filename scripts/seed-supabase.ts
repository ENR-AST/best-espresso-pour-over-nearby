import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { curatedSeedPayload } from "../src/data/curatedSeed";

const url = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("Missing Supabase credentials. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    persistSession: false
  }
});

async function main() {
  console.log(`Seeding ${curatedSeedPayload.sources.length} sources, ${curatedSeedPayload.cafes.length} cafes, ${curatedSeedPayload.mentions.length} mentions...`);

  const { error: sourceError } = await supabase
    .from("curated_sources")
    .upsert(curatedSeedPayload.sources, { onConflict: "id" });

  if (sourceError) {
    throw new Error(`Failed seeding curated_sources: ${sourceError.message}`);
  }

  const cafesToUpsert = curatedSeedPayload.cafes.map((cafe) => ({
    slug: cafe.id,
    name: cafe.name,
    city: cafe.city,
    neighborhood: cafe.neighborhood,
    tags: cafe.tags
  }));

  const { error: cafeError } = await supabase
    .from("curated_cafes")
    .upsert(cafesToUpsert, { onConflict: "slug" });

  if (cafeError) {
    throw new Error(`Failed seeding curated_cafes: ${cafeError.message}`);
  }

  const { data: cafeRows, error: cafeFetchError } = await supabase
    .from("curated_cafes")
    .select("id, slug");

  if (cafeFetchError) {
    throw new Error(`Failed loading curated_cafes after upsert: ${cafeFetchError.message}`);
  }

  const cafeIdBySlug = new Map((cafeRows ?? []).map((row) => [row.slug as string, row.id as number]));

  const mentionsToUpsert = curatedSeedPayload.mentions
    .map((mention) => {
      const cafeId = cafeIdBySlug.get(mention.cafe_id);
      if (!cafeId) {
        return null;
      }

      return {
        source_id: mention.source_id,
        cafe_id: cafeId,
        confidence: mention.confidence,
        evidence_note: mention.evidence_note,
        source_url: mention.source_url,
        espresso_boost: mention.espresso_boost,
        pour_over_boost: mention.pour_over_boost,
        roaster_boost: mention.roaster_boost,
        credibility_boost: mention.credibility_boost,
        coffee_focus_boost: mention.coffee_focus_boost,
        transparency_boost: mention.transparency_boost,
        signal_notes: mention.signal_notes,
        avoid_notes: mention.avoid_notes,
        penalty_signals: mention.penalty_signals
      };
    })
    .filter((mention): mention is NonNullable<typeof mention> => mention !== null);

  const { error: mentionError } = await supabase
    .from("curated_mentions")
    .upsert(mentionsToUpsert, { onConflict: "source_id,cafe_id,source_url" });

  if (mentionError) {
    throw new Error(`Failed seeding curated_mentions: ${mentionError.message}`);
  }

  console.log("Supabase seed completed successfully.");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
