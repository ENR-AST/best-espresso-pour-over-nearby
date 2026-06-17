import type { CuratedCafeRecord } from "../../types/coffee";

export const perfectDailyGrindRecords: CuratedCafeRecord[] = [
  {
    sourceId: "perfect-daily-grind",
    sourceName: "Perfect Daily Grind",
    category: "editorial",
    cafeName: "SEY Coffee",
    city: "Brooklyn",
    neighborhood: "East Williamsburg",
    confidence: 0.96,
    tags: ["pour-over", "roaster", "specialty"],
    evidenceNote: "Editorial fit for transparent sourcing and exceptional filter coffee standards.",
    sourceUrl: "https://perfectdailygrind.com",
    pourOverBoost: 1.5,
    roasterBoost: 1.3,
    credibilityBoost: 1.2,
    coffeeFocusBoost: 1,
    transparencyBoost: 1,
    signalNotes: [
      "single-origin pour-over program with traceable sourcing",
      "origin and roast detail reinforce transparency"
    ]
  },
  {
    sourceId: "perfect-daily-grind",
    sourceName: "Perfect Daily Grind",
    category: "editorial",
    cafeName: "Coffee Project New York",
    city: "New York",
    neighborhood: "East Village",
    confidence: 0.9,
    tags: ["espresso", "pour-over", "specialty"],
    evidenceNote: "Editorially aligned with serious brew craft and competition-minded coffee service.",
    sourceUrl: "https://perfectdailygrind.com",
    espressoBoost: 1,
    pourOverBoost: 1.1,
    credibilityBoost: 1,
    coffeeFocusBoost: 0.9,
    signalNotes: [
      "manual brew options are treated as precision coffee service",
      "baristas communicate flavor notes rather than generic roast labels"
    ]
  }
];
