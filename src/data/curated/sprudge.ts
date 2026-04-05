import type { CuratedCafeRecord } from "../../types/coffee";

export const sprudgeRecords: CuratedCafeRecord[] = [
  {
    sourceId: "sprudge",
    sourceName: "Sprudge",
    category: "editorial",
    cafeName: "Ninth Street Espresso",
    city: "New York",
    neighborhood: "SoHo",
    confidence: 0.96,
    tags: ["espresso", "specialty"],
    evidenceNote: "Editorial recognition for dependable espresso and long-running specialty credibility.",
    sourceUrl: "https://sprudge.com",
    espressoBoost: 1.2,
    credibilityBoost: 1.1
  },
  {
    sourceId: "sprudge",
    sourceName: "Sprudge",
    category: "editorial",
    cafeName: "Blue Bottle Bryant Park",
    city: "New York",
    neighborhood: "Midtown",
    confidence: 0.9,
    tags: ["pour-over", "roaster", "specialty"],
    evidenceNote: "Featured in specialty coffee coverage as a roaster-backed brew-bar destination.",
    sourceUrl: "https://sprudge.com",
    pourOverBoost: 1.1,
    roasterBoost: 1.2,
    credibilityBoost: 1
  },
  {
    sourceId: "sprudge",
    sourceName: "Sprudge",
    category: "editorial",
    cafeName: "Sightglass Coffee",
    city: "San Francisco",
    neighborhood: "SoMa",
    confidence: 0.95,
    tags: ["espresso", "pour-over", "roaster", "specialty"],
    evidenceNote: "Editorially recognized for full-spectrum specialty coffee quality and roaster credibility.",
    sourceUrl: "https://sprudge.com",
    espressoBoost: 1.1,
    pourOverBoost: 1.2,
    roasterBoost: 1.3,
    credibilityBoost: 1.2
  },
  {
    sourceId: "sprudge",
    sourceName: "Sprudge",
    category: "editorial",
    cafeName: "Ritual Coffee Roasters Valencia",
    city: "San Francisco",
    neighborhood: "Mission District",
    confidence: 0.92,
    tags: ["roaster", "specialty"],
    evidenceNote: "Repeated specialty coverage supporting roaster status and serious coffee program depth.",
    sourceUrl: "https://sprudge.com",
    roasterBoost: 1.3,
    credibilityBoost: 1.1
  }
];
