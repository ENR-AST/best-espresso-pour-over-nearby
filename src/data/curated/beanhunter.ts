import type { CuratedCafeRecord } from "../../types/coffee";

export const beanhunterRecords: CuratedCafeRecord[] = [
  {
    sourceId: "beanhunter",
    sourceName: "Beanhunter",
    category: "curated-app",
    cafeName: "Ritual Coffee Roasters Valencia",
    city: "San Francisco",
    neighborhood: "Mission District",
    confidence: 0.82,
    tags: ["espresso", "pour-over", "roaster", "specialty"],
    evidenceNote: "Specialty users consistently identify it as a serious coffee stop, not a generic cafe.",
    sourceUrl: "https://www.beanhunter.com",
    espressoBoost: 0.7,
    pourOverBoost: 0.7,
    roasterBoost: 0.9,
    credibilityBoost: 0.7,
    coffeeFocusBoost: 0.7,
    signalNotes: [
      "menu reputation centers on coffee quality over sugary drinks",
      "manual brew remains part of the specialty expectation"
    ]
  },
  {
    sourceId: "beanhunter",
    sourceName: "Beanhunter",
    category: "curated-app",
    cafeName: "Philz Coffee Mission",
    city: "San Francisco",
    neighborhood: "Mission District",
    confidence: 0.42,
    tags: ["specialty"],
    evidenceNote: "Popularity is visible, but specialty coffee evidence is weaker and more review-led.",
    sourceUrl: "https://www.beanhunter.com",
    credibilityBoost: 0.1,
    penaltySignals: [
      "public-review popularity outweighs coffee-program specificity",
      "manual brew evidence is limited"
    ],
    avoidNotes: [
      "generic crowd appeal appears stronger than coffee-first specialization"
    ]
  }
];
