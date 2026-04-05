import type { CuratedCafeRecord } from "../../types/coffee";

export const europeanCoffeeTripRecords: CuratedCafeRecord[] = [
  {
    sourceId: "european-coffee-trip",
    sourceName: "European Coffee Trip",
    category: "editorial",
    cafeName: "La Cabra NYC",
    city: "New York",
    neighborhood: "SoHo",
    confidence: 0.94,
    tags: ["pour-over", "roaster", "specialty"],
    evidenceNote: "Destination-worthy brew service and coffee program depth.",
    sourceUrl: "https://europeancoffeetrip.com",
    pourOverBoost: 1.4,
    roasterBoost: 1.2,
    credibilityBoost: 1.1
  },
  {
    sourceId: "european-coffee-trip",
    sourceName: "European Coffee Trip",
    category: "editorial",
    cafeName: "Verve Coffee Roasters Market Street",
    city: "San Francisco",
    neighborhood: "Downtown",
    confidence: 0.87,
    tags: ["pour-over", "roaster", "specialty"],
    evidenceNote: "Recognized as a destination-grade specialty stop with filter coffee strength.",
    sourceUrl: "https://europeancoffeetrip.com",
    pourOverBoost: 1.3,
    roasterBoost: 1.1,
    credibilityBoost: 1
  }
];
