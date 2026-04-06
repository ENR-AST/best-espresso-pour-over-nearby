import type { CoffeeShop, SearchLocation, SearchMode, Tag } from "../types/coffee";

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface ZippopotamPlace {
  "place name": string;
  state: string;
  latitude: string;
  longitude: string;
}

interface ZippopotamResponse {
  places: ZippopotamPlace[];
}

interface OverpassElement {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
}

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter"
];
const DEFAULT_SEARCH_RADIUS_METERS = 24140;

function safeNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeText(value: string | undefined): string {
  return (value ?? "").trim();
}

function inferTags(tags: Record<string, string>): Tag[] {
  const result = new Set<Tag>(["specialty"]);
  const textBlob = Object.values(tags).join(" ").toLowerCase();

  if (textBlob.includes("espresso")) result.add("espresso");
  if (textBlob.includes("pour over") || textBlob.includes("pour-over") || textBlob.includes("filter coffee") || textBlob.includes("brew bar")) {
    result.add("pour-over");
  }
  if (tags.craft === "roastery" || textBlob.includes("roaster")) result.add("roaster");

  return Array.from(result);
}

function toCoffeeShop(element: OverpassElement, location: SearchLocation): CoffeeShop | null {
  const tags = element.tags ?? {};
  const name = normalizeText(tags.name);
  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;

  if (!name || latitude === undefined || longitude === undefined) return null;

  const inferredTags = inferTags(tags);
  const isRoaster = inferredTags.includes("roaster");
  const hasWebsite = Boolean(tags.website || tags["contact:website"]);
  const textBlob = Object.values(tags).join(" ");
  const hasSpecialtyWords = /specialty|single origin|third wave|espresso|filter|pour over|pour-over|roaster/i.test(textBlob);

  return {
    id: `live-${element.type}-${element.id}`,
    name,
    neighborhood: normalizeText(tags.neighbourhood) || normalizeText(tags.suburb) || "Nearby",
    city: normalizeText(tags["addr:city"]) || location.label,
    zipCode: normalizeText(tags["addr:postcode"]),
    latitude,
    longitude,
    openNow: true,
    tags: inferredTags,
    distanceHintMiles: 0,
    espressoEvidence: hasSpecialtyWords ? 6.2 : 4.5,
    pourOverEvidence: hasSpecialtyWords ? 5.8 : 3.8,
    roasterProgram: isRoaster ? 8.4 : 3.5,
    credibilitySignals: hasWebsite ? 5.6 : 4.2,
    publicRating: 3.8,
    sources: [
      {
        source: "OpenStreetMap",
        category: "public-review",
        note: "Live nearby coffee place from OpenStreetMap. Specialty enrichment still needs curated source ingestion.",
        weight: 0.35,
        url: `https://www.openstreetmap.org/${element.type}/${element.id}`
      }
    ],
    whyRecommended: isRoaster
      ? "Nearby live result with roastery signals. Specialty ranking is provisional until curated coffee sources are connected."
      : "Nearby live coffee result. Specialty ranking is provisional until curated coffee sources are connected.",
    externalLinks: [
      ...(tags.website || tags["contact:website"] ? [{ label: "Website", url: tags.website ?? tags["contact:website"] ?? "" }] : []),
      { label: "OpenStreetMap", url: `https://www.openstreetmap.org/${element.type}/${element.id}` }
    ]
  };
}

function isLikelyUsZip(query: string): boolean {
  return /^\d{5}(?:-\d{4})?$/.test(query.trim());
}

async function geocodeUsZip(zip: string): Promise<SearchLocation | null> {
  const normalizedZip = zip.trim().slice(0, 5);
  const response = await fetch(`https://api.zippopotam.us/us/${normalizedZip}`);

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`ZIP lookup failed with status ${response.status}`);

  const data = (await response.json()) as ZippopotamResponse;
  const place = data.places?.[0];
  if (!place) return null;

  return {
    label: `${place["place name"]}, ${place.state} ${normalizedZip}`,
    latitude: safeNumber(place.latitude, 0),
    longitude: safeNumber(place.longitude, 0),
    source: "manual"
  };
}

export async function geocodeLocation(query: string, mode: SearchMode): Promise<SearchLocation | null> {
  const trimmed = query.trim();

  if (mode === "zip") {
    if (!isLikelyUsZip(trimmed)) {
      throw new Error("Enter a valid 5-digit ZIP code.");
    }

    const zipLocation = await geocodeUsZip(trimmed);
    if (zipLocation) return zipLocation;
    return null;
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("q", trimmed);

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" }
  });

  if (!response.ok) throw new Error(`Geocoding failed with status ${response.status}`);

  const data = (await response.json()) as NominatimResult[];
  const first = data[0];
  if (!first) return null;

  return {
    label: first.display_name,
    latitude: safeNumber(first.lat, 0),
    longitude: safeNumber(first.lon, 0),
    source: "manual"
  };
}

async function fetchOverpass(endpoint: string, body: string): Promise<{ elements?: OverpassElement[] }> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body
  });

  if (!response.ok) throw new Error(`Nearby coffee lookup failed with status ${response.status}`);
  return (await response.json()) as { elements?: OverpassElement[] };
}

export async function fetchNearbyCoffeeShops(location: SearchLocation, radiusMeters = DEFAULT_SEARCH_RADIUS_METERS): Promise<CoffeeShop[]> {
  const query = `
[out:json][timeout:20];
(
  node["amenity"="cafe"](around:${radiusMeters},${location.latitude},${location.longitude});
  way["amenity"="cafe"](around:${radiusMeters},${location.latitude},${location.longitude});
  node["shop"="coffee"](around:${radiusMeters},${location.latitude},${location.longitude});
  way["shop"="coffee"](around:${radiusMeters},${location.latitude},${location.longitude});
  node["craft"="roastery"](around:${radiusMeters},${location.latitude},${location.longitude});
  way["craft"="roastery"](around:${radiusMeters},${location.latitude},${location.longitude});
);
out center tags 24;
`;

  let lastError: Error | null = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const data = await fetchOverpass(endpoint, query);
      const elements = data.elements ?? [];
      const deduped = new Map<string, CoffeeShop>();

      for (const element of elements) {
        const shop = toCoffeeShop(element, location);
        if (!shop) continue;
        if (!deduped.has(shop.name.toLowerCase())) deduped.set(shop.name.toLowerCase(), shop);
      }

      return Array.from(deduped.values()).slice(0, 24);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown nearby lookup error.");
    }
  }

  throw lastError ?? new Error("Nearby coffee lookup failed.");
}
