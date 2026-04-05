import type { CuratedCafeRecord } from "../../types/coffee";

export const dailyCoffeeNewsRecords: CuratedCafeRecord[] = [
  {
    sourceId: "daily-coffee-news",
    sourceName: "Daily Coffee News",
    category: "editorial",
    cafeName: "La Cabra NYC",
    city: "New York",
    neighborhood: "SoHo",
    confidence: 0.96,
    tags: ["pour-over", "roaster", "specialty"],
    evidenceNote: "Covered as a notable roaster-led operator with strong coffee program depth.",
    sourceUrl: "https://dailycoffeenews.com",
    pourOverBoost: 1.3,
    roasterBoost: 1.4,
    credibilityBoost: 1.1
  },
  {
    sourceId: "daily-coffee-news",
    sourceName: "Daily Coffee News",
    category: "editorial",
    cafeName: "Devocion Williamsburg",
    city: "Brooklyn",
    neighborhood: "Williamsburg",
    confidence: 0.9,
    tags: ["espresso", "roaster", "specialty"],
    evidenceNote: "Recognized for sourcing and roasting program with meaningful specialty credibility.",
    sourceUrl: "https://dailycoffeenews.com",
    espressoBoost: 1,
    roasterBoost: 1.4,
    credibilityBoost: 1
  },
  {
    sourceId: "daily-coffee-news",
    sourceName: "Daily Coffee News",
    category: "editorial",
    cafeName: "Verve Coffee Roasters Market Street",
    city: "San Francisco",
    neighborhood: "Downtown",
    confidence: 0.93,
    tags: ["espresso", "pour-over", "roaster", "specialty"],
    evidenceNote: "Editorial support for specialty roasting and cafe operation quality.",
    sourceUrl: "https://dailycoffeenews.com",
    espressoBoost: 1.1,
    pourOverBoost: 1.1,
    roasterBoost: 1.4,
    credibilityBoost: 1.1
  },
  {
    sourceId: "daily-coffee-news",
    sourceName: "Daily Coffee News",
    category: "editorial",
    cafeName: "Onyx Lab Pop-Up",
    city: "New York",
    neighborhood: "NoLita",
    confidence: 0.89,
    tags: ["pour-over", "roaster", "specialty"],
    evidenceNote: "Strong roaster recognition and specialty credibility from coffee industry reporting.",
    sourceUrl: "https://dailycoffeenews.com",
    pourOverBoost: 1.2,
    roasterBoost: 1.5,
    credibilityBoost: 1.2
  }
];
