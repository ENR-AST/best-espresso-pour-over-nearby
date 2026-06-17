import type { CuratedCafeRecord } from "../../types/coffee";

export const baristappRecords: CuratedCafeRecord[] = [
  {
    sourceId: "baristapp",
    sourceName: "Baristapp",
    category: "curated-app",
    cafeName: "Coffee Project New York",
    city: "New York",
    neighborhood: "East Village",
    confidence: 0.83,
    tags: ["espresso", "pour-over", "specialty"],
    evidenceNote: "Barista-focused recognition supports training-minded drink execution and serious coffee service.",
    sourceUrl: "https://baristapp.com",
    espressoBoost: 0.8,
    pourOverBoost: 0.7,
    credibilityBoost: 0.8,
    coffeeFocusBoost: 0.8,
    signalNotes: [
      "barista craft is visible in both espresso and manual brew offerings",
      "traditional coffee standards matter more than novelty drinks"
    ]
  },
  {
    sourceId: "baristapp",
    sourceName: "Baristapp",
    category: "curated-app",
    cafeName: "SEY Coffee",
    city: "Brooklyn",
    neighborhood: "East Williamsburg",
    confidence: 0.79,
    tags: ["pour-over", "specialty"],
    evidenceNote: "Barista-focused support aligns with precise filter coffee execution and clear origin storytelling.",
    sourceUrl: "https://baristapp.com",
    pourOverBoost: 0.9,
    credibilityBoost: 0.7,
    coffeeFocusBoost: 0.8,
    transparencyBoost: 0.7,
    signalNotes: [
      "baristas communicate origin and flavor with confidence",
      "manual brew remains central to the menu identity"
    ]
  }
];
