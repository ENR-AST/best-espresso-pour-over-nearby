import type { CuratedCafeRecord } from "../../types/coffee";

export const coffeeGeekRecords: CuratedCafeRecord[] = [
  {
    sourceId: "coffeegeek",
    sourceName: "CoffeeGeek",
    category: "community",
    cafeName: "St Kilda Coffee",
    city: "New York",
    neighborhood: "Hell's Kitchen",
    confidence: 0.82,
    tags: ["espresso", "pour-over", "specialty"],
    evidenceNote: "Enthusiast discussion supports strong brew execution and shot quality.",
    sourceUrl: "https://coffeegeek.com",
    espressoBoost: 0.8,
    pourOverBoost: 0.8,
    credibilityBoost: 0.7,
    coffeeFocusBoost: 0.6,
    signalNotes: [
      "manual brew is taken seriously instead of treated like generic drip",
      "baristas show command of coffee flavor and extraction"
    ]
  },
  {
    sourceId: "coffeegeek",
    sourceName: "CoffeeGeek",
    category: "community",
    cafeName: "Ninth Street Espresso",
    city: "New York",
    neighborhood: "SoHo",
    confidence: 0.84,
    tags: ["espresso", "specialty"],
    evidenceNote: "Enthusiast praise for shot consistency and dependable bar flow.",
    sourceUrl: "https://coffeegeek.com",
    espressoBoost: 0.9,
    credibilityBoost: 0.7,
    coffeeFocusBoost: 0.7,
    signalNotes: [
      "traditional espresso preparation is emphasized over generic sizing",
      "the menu stays tightly centered on coffee craft"
    ]
  }
];
