import type { CuratedCafeRecord } from "../../types/coffee";

export const homeBaristaRecords: CuratedCafeRecord[] = [
  {
    sourceId: "home-barista",
    sourceName: "Home-Barista",
    category: "community",
    cafeName: "SEY Coffee",
    city: "Brooklyn",
    neighborhood: "East Williamsburg",
    confidence: 0.86,
    tags: ["pour-over", "specialty"],
    evidenceNote: "Enthusiast praise centers on cup clarity, sourcing transparency, and filter quality.",
    sourceUrl: "https://www.home-barista.com",
    pourOverBoost: 0.9,
    credibilityBoost: 0.8,
    coffeeFocusBoost: 0.7,
    transparencyBoost: 0.8,
    signalNotes: [
      "flavor clarity and origin character are part of the core experience",
      "transparent sourcing matters to the shop's coffee identity"
    ]
  },
  {
    sourceId: "home-barista",
    sourceName: "Home-Barista",
    category: "community",
    cafeName: "Coffee Project New York",
    city: "New York",
    neighborhood: "East Village",
    confidence: 0.82,
    tags: ["espresso", "specialty"],
    evidenceNote: "Community support highlights balanced espresso craft and barista competence.",
    sourceUrl: "https://www.home-barista.com",
    espressoBoost: 0.8,
    credibilityBoost: 0.7,
    coffeeFocusBoost: 0.6,
    signalNotes: [
      "traditional espresso drink craft matters more than oversized menu formats"
    ]
  }
];
