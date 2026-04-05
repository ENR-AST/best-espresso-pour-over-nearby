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
    credibilityBoost: 0.7
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
    credibilityBoost: 0.7
  }
];
