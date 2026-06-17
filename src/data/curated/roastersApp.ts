import type { CuratedCafeRecord } from "../../types/coffee";

export const roastersAppRecords: CuratedCafeRecord[] = [
  {
    sourceId: "roasters-app",
    sourceName: "Roasters app",
    category: "curated-app",
    cafeName: "Blue Bottle Bryant Park",
    city: "New York",
    neighborhood: "Midtown",
    confidence: 0.8,
    tags: ["pour-over", "roaster", "specialty"],
    evidenceNote: "Roaster-focused app support confirms the shop is relevant for coffee program depth, not just convenience.",
    sourceUrl: "https://apps.apple.com",
    pourOverBoost: 0.7,
    roasterBoost: 1,
    credibilityBoost: 0.6,
    coffeeFocusBoost: 0.7,
    signalNotes: [
      "roaster-backed menu depth matters more than generic cafe appeal"
    ]
  },
  {
    sourceId: "roasters-app",
    sourceName: "Roasters app",
    category: "curated-app",
    cafeName: "Sightglass Coffee",
    city: "San Francisco",
    neighborhood: "SoMa",
    confidence: 0.84,
    tags: ["espresso", "pour-over", "roaster", "specialty"],
    evidenceNote: "Roaster destination status reinforces strong coffee-first credibility.",
    sourceUrl: "https://apps.apple.com",
    espressoBoost: 0.8,
    pourOverBoost: 0.8,
    roasterBoost: 1.1,
    credibilityBoost: 0.7,
    coffeeFocusBoost: 0.8,
    transparencyBoost: 0.6,
    signalNotes: [
      "roaster identity and brew options support a serious coffee menu"
    ]
  }
];
