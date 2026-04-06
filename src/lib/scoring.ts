import type {
  CoffeeShop,
  FilterKey,
  RankedCoffeeShop,
  SearchLocation,
  SourceCategory
} from "../types/coffee";
import { getDistanceMiles } from "./geo";

const categoryMultiplier: Record<SourceCategory, number> = {
  editorial: 1,
  "curated-app": 0.82,
  community: 0.64,
  "public-review": 0.32
};

function getSourceSupportScore(shop: CoffeeShop): number {
  const raw = shop.sources.reduce((sum, source) => {
    return sum + source.weight * categoryMultiplier[source.category];
  }, 0);

  return Math.min(raw * 12, 40);
}

function getDistanceScore(distanceMiles: number): number {
  if (distanceMiles <= 0.5) return 10;
  if (distanceMiles <= 1) return 8.5;
  if (distanceMiles <= 2) return 7;
  if (distanceMiles <= 3) return 5.5;
  if (distanceMiles <= 5) return 4;
  return 2;
}

function getCoffeeFocusBonus(shop: CoffeeShop): number {
  const signalCount = shop.signalNotes?.length ?? 0;
  const avoidCount = shop.avoidNotes?.length ?? 0;

  return Math.min(signalCount * 1.3 + avoidCount * 0.4, 8);
}

function getPenaltyScore(shop: CoffeeShop): number {
  const explicitPenalties = shop.penaltySignals?.length ?? 0;
  const avoidCount = shop.avoidNotes?.length ?? 0;
  const genericMenuPenalty = !shop.tags.includes("pour-over") && !shop.tags.includes("roaster") ? 2.5 : 0;
  const weakCoffeeFocusPenalty =
    shop.espressoEvidence < 5.5 && shop.pourOverEvidence < 5.5 ? 3.5 : 0;
  const genericSupportPenalty =
    shop.sources.every((source) => source.category === "public-review") ? 2.8 : 0;

  return explicitPenalties * 2.2 + avoidCount * 0.8 + genericMenuPenalty + weakCoffeeFocusPenalty + genericSupportPenalty;
}

export function getSupportLabels(shop: CoffeeShop): string[] {
  const labels = new Set<string>();

  for (const source of shop.sources) {
    if (source.category === "editorial") labels.add("Editorially supported");
    if (source.category === "curated-app") labels.add("Curated-app supported");
    if (source.category === "community") labels.add("Community supported");
    if (source.category === "public-review") labels.add("Public-review led");
  }

  return Array.from(labels);
}

export function scoreShop(
  shop: CoffeeShop,
  location: SearchLocation
): RankedCoffeeShop {
  const distanceMiles = getDistanceMiles(
    location.latitude,
    location.longitude,
    shop.latitude,
    shop.longitude
  );

  const sourceSupport = getSourceSupportScore(shop);
  const espresso = shop.espressoEvidence * 2.2;
  const pourOver = shop.pourOverEvidence * 1.9;
  const roaster = shop.roasterProgram * 1.5;
  const credibility = shop.credibilitySignals * 1.6;
  const distance = getDistanceScore(distanceMiles);
  const publicRating = shop.publicRating * 0.9;
  const coffeeFocusBonus = getCoffeeFocusBonus(shop);
  const penaltyScore = getPenaltyScore(shop);

  const specialtyScore = Math.round(
    sourceSupport + espresso + pourOver + roaster + credibility + distance + publicRating + coffeeFocusBonus - penaltyScore
  );

  return {
    ...shop,
    distanceMiles,
    specialtyScore,
    supportLabels: getSupportLabels(shop)
  };
}

export function applyFilters(
  shops: RankedCoffeeShop[],
  filters: FilterKey[]
): RankedCoffeeShop[] {
  return shops.filter((shop) => {
    return filters.every((filter) => {
      switch (filter) {
        case "open-now":
          return shop.openNow;
        case "walkable":
          return shop.distanceMiles <= 1.2;
        default:
          return true;
      }
    });
  });
}

export function rankCoffeeShops(
  shops: CoffeeShop[],
  location: SearchLocation,
  filters: FilterKey[]
): RankedCoffeeShop[] {
  return applyFilters(
    shops.map((shop) => scoreShop(shop, location)),
    filters
  ).sort((a, b) => {
    if (b.specialtyScore !== a.specialtyScore) {
      return b.specialtyScore - a.specialtyScore;
    }

    return a.distanceMiles - b.distanceMiles;
  });
}
