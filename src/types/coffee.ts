export type SourceCategory =
  | "editorial"
  | "curated-app"
  | "community"
  | "public-review";

export type Tag = "espresso" | "pour-over" | "roaster" | "specialty";

export type FilterKey = "open-now" | "walkable";

export type SearchMode = "current" | "city" | "zip";

export interface PersonalReview {
  shopId: string;
  overallScore: number;
  espressoScore: number;
  pourOverScore: number;
  beanTransparencyScore: number;
  menuFocusScore: number;
  serviceScore: number;
  ambianceScore: number;
  wouldReturn: boolean;
  notes: string;
  updatedAt: string;
}

export interface DiscoveredShopDraft {
  name: string;
  city: string;
  neighborhood: string;
  zipCode: string;
  website?: string;
  tags: Tag[];
  overallScore: number;
  espressoScore: number;
  pourOverScore: number;
  beanTransparencyScore: number;
  menuFocusScore: number;
  serviceScore: number;
  ambianceScore: number;
  wouldReturn: boolean;
  notes: string;
}

export interface SourceEvidence {
  source: string;
  category: SourceCategory;
  note: string;
  weight: number;
  url: string;
}

export interface CuratedCafeRecord {
  sourceId: string;
  sourceName: string;
  category: SourceCategory;
  cafeName: string;
  city?: string;
  neighborhood?: string;
  confidence: number;
  tags: Tag[];
  evidenceNote: string;
  sourceUrl: string;
  espressoBoost?: number;
  pourOverBoost?: number;
  roasterBoost?: number;
  credibilityBoost?: number;
  coffeeFocusBoost?: number;
  transparencyBoost?: number;
  penaltySignals?: string[];
  signalNotes?: string[];
  avoidNotes?: string[];
}

export interface CoffeeShop {
  id: string;
  name: string;
  discoveredByYou?: boolean;
  neighborhood: string;
  city: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  openNow: boolean;
  tags: Tag[];
  distanceHintMiles: number;
  espressoEvidence: number;
  pourOverEvidence: number;
  roasterProgram: number;
  credibilitySignals: number;
  publicRating: number;
  sources: SourceEvidence[];
  whyRecommended: string;
  externalLinks: { label: string; url: string }[];
  signalNotes?: string[];
  avoidNotes?: string[];
  penaltySignals?: string[];
}

export interface SearchLocation {
  label: string;
  latitude: number;
  longitude: number;
  source: "geolocation" | "manual" | "default";
}

export interface RankedCoffeeShop extends CoffeeShop {
  distanceMiles: number;
  specialtyScore: number;
  supportLabels: string[];
  personalScore?: number;
}
