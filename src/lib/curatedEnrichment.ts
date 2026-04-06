import { curatedCafeRecords } from "../data/curatedRecords";
import type { CoffeeShop, CuratedCafeRecord, SourceEvidence, Tag } from "../types/coffee";

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\bcoffee\b/g, "")
    .replace(/\broasters\b/g, "")
    .replace(/\broastery\b/g, "")
    .replace(/\bcafe\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function similarityScore(left: string, right: string): number {
  if (left === right) {
    return 1;
  }

  const leftWords = new Set(left.split(" ").filter(Boolean));
  const rightWords = new Set(right.split(" ").filter(Boolean));
  const overlap = [...leftWords].filter((word) => rightWords.has(word)).length;
  const maxSize = Math.max(leftWords.size, rightWords.size, 1);

  return overlap / maxSize;
}

function mergeSources(current: SourceEvidence[], incoming: SourceEvidence[]): SourceEvidence[] {
  const byKey = new Map<string, SourceEvidence>();

  for (const source of [...current, ...incoming]) {
    const key = `${source.source}-${source.note}`;
    if (!byKey.has(key)) {
      byKey.set(key, source);
    }
  }

  return Array.from(byKey.values());
}

function mergeTags(current: Tag[], incoming: Tag[]): Tag[] {
  return Array.from(new Set<Tag>([...current, ...incoming]));
}

function mergeNotes(current: string[] | undefined, incoming: string[]): string[] {
  return Array.from(new Set([...(current ?? []), ...incoming]));
}

function toSourceEvidence(record: CuratedCafeRecord): SourceEvidence {
  return {
    source: record.sourceName,
    category: record.category,
    note: record.evidenceNote,
    weight: record.confidence,
    url: record.sourceUrl
  };
}

function buildCuratedReason(current: string, records: CuratedCafeRecord[]): string {
  const sourceNames = Array.from(new Set(records.map((record) => record.sourceName))).join(", ");
  const signalNotes = Array.from(
    new Set(records.flatMap((record) => record.signalNotes ?? []))
  ).slice(0, 2);
  const signalSentence =
    signalNotes.length > 0
      ? ` Coffee-first signals include ${signalNotes.join(" and ")}.`
      : "";

  return `${current} Curated specialty evidence also matched this cafe through ${sourceNames}.${signalSentence}`;
}

function getMatchingRecords(shop: CoffeeShop): CuratedCafeRecord[] {
  const normalizedShopName = normalizeName(shop.name);

  return curatedCafeRecords.filter((record) => {
    const score = similarityScore(normalizedShopName, normalizeName(record.cafeName));
    return score >= 0.55;
  });
}

export function enrichCoffeeShopsWithCuratedSignals(shops: CoffeeShop[]): CoffeeShop[] {
  return shops.map((shop) => {
    const matches = getMatchingRecords(shop);

    if (matches.length === 0) {
      return shop;
    }

    const sourceEvidence = matches.map(toSourceEvidence);
    const allTags = matches.flatMap((record) => record.tags);
    const espressoBoost = Math.max(...matches.map((record) => record.espressoBoost ?? 0), 0);
    const pourOverBoost = Math.max(...matches.map((record) => record.pourOverBoost ?? 0), 0);
    const roasterBoost = Math.max(...matches.map((record) => record.roasterBoost ?? 0), 0);
    const credibilityBoost = Math.max(...matches.map((record) => record.credibilityBoost ?? 0), 0);
    const coffeeFocusBoost = Math.max(...matches.map((record) => record.coffeeFocusBoost ?? 0), 0);
    const transparencyBoost = Math.max(...matches.map((record) => record.transparencyBoost ?? 0), 0);
    const curatedLinks = matches.map((record) => ({
      label: record.sourceName,
      url: record.sourceUrl
    }));
    const signalNotes = matches.flatMap((record) => record.signalNotes ?? []);
    const avoidNotes = matches.flatMap((record) => record.avoidNotes ?? []);
    const penaltySignals = matches.flatMap((record) => record.penaltySignals ?? []);

    return {
      ...shop,
      tags: mergeTags(shop.tags, allTags),
      espressoEvidence: Math.min(10, shop.espressoEvidence + espressoBoost),
      pourOverEvidence: Math.min(10, shop.pourOverEvidence + pourOverBoost),
      roasterProgram: Math.min(10, shop.roasterProgram + roasterBoost),
      credibilitySignals: Math.min(10, shop.credibilitySignals + credibilityBoost + coffeeFocusBoost + transparencyBoost),
      sources: mergeSources(shop.sources, sourceEvidence),
      whyRecommended: buildCuratedReason(shop.whyRecommended, matches),
      signalNotes: mergeNotes(shop.signalNotes, signalNotes),
      avoidNotes: mergeNotes(shop.avoidNotes, avoidNotes),
      penaltySignals: mergeNotes(shop.penaltySignals, penaltySignals),
      externalLinks: [...shop.externalLinks, ...curatedLinks].filter(
        (link, index, all) => all.findIndex((candidate) => candidate.url === link.url) === index
      )
    };
  });
}
