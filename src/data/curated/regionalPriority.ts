import type { CuratedCafeRecord } from "../../types/coffee";

export const regionalPriorityRecords: CuratedCafeRecord[] = [
  {
    sourceId: "daily-coffee-news",
    sourceName: "Daily Coffee News",
    category: "editorial",
    cafeName: "Modcup Coffee",
    city: "Jersey City",
    neighborhood: "The Heights",
    confidence: 0.91,
    tags: ["espresso", "pour-over", "roaster", "specialty"],
    evidenceNote: "Editorially aligned with a roaster-led coffee program and serious filter coffee standards in Jersey City.",
    sourceUrl: "https://dailycoffeenews.com",
    espressoBoost: 1.0,
    pourOverBoost: 1.1,
    roasterBoost: 1.2,
    credibilityBoost: 1.0,
    coffeeFocusBoost: 0.9,
    transparencyBoost: 0.8,
    signalNotes: [
      "single-origin coffees are treated as distinct brew options",
      "roaster-backed menu points toward coffee-first priorities"
    ]
  },
  {
    sourceId: "coffeegeek",
    sourceName: "CoffeeGeek",
    category: "community",
    cafeName: "Dames Coffee Espresso Bar",
    city: "Jersey City",
    neighborhood: "Downtown",
    confidence: 0.82,
    tags: ["espresso", "specialty"],
    evidenceNote: "Community-style specialty support centered on espresso execution and a focused menu rather than generic cafe breadth.",
    sourceUrl: "https://coffeegeek.com",
    espressoBoost: 1.0,
    credibilityBoost: 0.8,
    coffeeFocusBoost: 0.8,
    signalNotes: [
      "traditional espresso drink language suggests ratio-based service",
      "short menu keeps the focus on coffee craft"
    ]
  },
  {
    sourceId: "sprudge",
    sourceName: "Sprudge",
    category: "editorial",
    cafeName: "Ceremony Coffee Roasters",
    city: "Bethesda",
    neighborhood: "Woodmont Triangle",
    confidence: 0.92,
    tags: ["espresso", "pour-over", "roaster", "specialty"],
    evidenceNote: "Editorially credible roaster-cafe with real pour-over depth and strong specialty transparency in Bethesda.",
    sourceUrl: "https://sprudge.com",
    espressoBoost: 1.0,
    pourOverBoost: 1.1,
    roasterBoost: 1.2,
    credibilityBoost: 1.0,
    coffeeFocusBoost: 0.9,
    transparencyBoost: 0.9,
    signalNotes: [
      "manual brew options are presented as genuine handcrafted coffee",
      "origin and tasting-note detail support stronger transparency"
    ]
  },
  {
    sourceId: "perfect-daily-grind",
    sourceName: "Perfect Daily Grind",
    category: "editorial",
    cafeName: "Ceremony Coffee Roasters",
    city: "Bethesda",
    neighborhood: "Woodmont Triangle",
    confidence: 0.89,
    tags: ["espresso", "pour-over", "roaster", "specialty"],
    evidenceNote: "Editorial fit for a coffee-first program with strong sourcing, roast literacy, and serious espresso balance.",
    sourceUrl: "https://perfectdailygrind.com",
    espressoBoost: 0.9,
    pourOverBoost: 1.0,
    roasterBoost: 1.0,
    credibilityBoost: 0.9,
    coffeeFocusBoost: 0.9,
    transparencyBoost: 0.9,
    signalNotes: [
      "single-origin and roast-transparency cues support thoughtful sourcing",
      "menu structure favors coffee over sugary novelty drinks"
    ]
  },
  {
    sourceId: "roasters-app",
    sourceName: "Roasters app",
    category: "curated-app",
    cafeName: "Black Gold Coffee Roasters",
    city: "Venice",
    neighborhood: "South Venice",
    confidence: 0.84,
    tags: ["espresso", "roaster", "specialty"],
    evidenceNote: "Roaster-focused listing supports Black Gold as a stronger coffee-first stop in Venice than a generic cafe option.",
    sourceUrl: "https://apps.apple.com",
    espressoBoost: 0.8,
    roasterBoost: 1.1,
    credibilityBoost: 0.8,
    coffeeFocusBoost: 0.8,
    transparencyBoost: 0.7,
    signalNotes: [
      "roaster presence suggests fresher coffee and more focused bean quality",
      "coffee remains the lead product rather than an all-day cafe menu"
    ]
  },
  {
    sourceId: "beanhunter",
    sourceName: "Beanhunter",
    category: "curated-app",
    cafeName: "Black Gold Coffee Roasters",
    city: "Venice",
    neighborhood: "South Venice",
    confidence: 0.8,
    tags: ["espresso", "specialty"],
    evidenceNote: "Curated-app support suggests this is one of the more coffee-serious stops in the Venice area.",
    sourceUrl: "https://www.beanhunter.com",
    espressoBoost: 0.7,
    credibilityBoost: 0.7,
    coffeeFocusBoost: 0.7,
    signalNotes: [
      "focused menu favors coffee over broader beverage sprawl"
    ]
  }
];
