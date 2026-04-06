import type { CuratedCafeRecord } from "../../types/coffee";

export const beanconquerorRecords: CuratedCafeRecord[] = [
  {
    sourceId: "beanconqueror",
    sourceName: "Beanconqueror",
    category: "curated-app",
    cafeName: "Devocion Williamsburg",
    city: "Brooklyn",
    neighborhood: "Williamsburg",
    confidence: 0.78,
    tags: ["espresso", "roaster", "specialty"],
    evidenceNote: "Brew enthusiasts track it for freshness, sourcing, and roaster-backed coffee quality.",
    sourceUrl: "https://beanconqueror.com",
    espressoBoost: 0.6,
    roasterBoost: 0.9,
    credibilityBoost: 0.6,
    coffeeFocusBoost: 0.7,
    transparencyBoost: 0.8,
    signalNotes: [
      "fresh crop and sourcing transparency support a coffee-first experience",
      "roaster-backed bean detail matters to visitors who track brew quality"
    ]
  },
  {
    sourceId: "beanconqueror",
    sourceName: "Beanconqueror",
    category: "curated-app",
    cafeName: "Onyx Lab Pop-Up",
    city: "New York",
    neighborhood: "NoLita",
    confidence: 0.81,
    tags: ["pour-over", "roaster", "specialty"],
    evidenceNote: "Tracked by brew-focused users who care about single-origin coffee and brew accuracy.",
    sourceUrl: "https://beanconqueror.com",
    pourOverBoost: 0.9,
    roasterBoost: 1,
    credibilityBoost: 0.7,
    coffeeFocusBoost: 0.8,
    transparencyBoost: 0.7,
    signalNotes: [
      "single-origin brewing matters more than broad beverage variety",
      "manual brew credibility is reinforced by enthusiast tracking"
    ]
  }
];
