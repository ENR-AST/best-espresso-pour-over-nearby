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
const DEFAULT_SEARCH_RADIUS_METERS = 16093;
const EXCLUDED_CHAIN_PATTERNS = [
  /\bstarbucks\b/i,
  /\bdunkin\b/i,
  /\bpeet'?s\b/i,
  /\btim hortons\b/i,
  /\bcosta coffee\b/i,
  /\bcaribou coffee\b/i,
  /\bthe coffee bean\b/i,
  /\bcoffee bean & tea leaf\b/i,
  /\bgloria jean'?s\b/i,
  /\bphilz\b/i
];

function safeNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeText(value: string | undefined): string {
  return (value ?? "").trim();
}

function splitLocationLabel(label: string) {
  const parts = label.split(",").map((part) => part.trim()).filter(Boolean);
  return {
    city: parts[0] ?? "",
    state: parts[1] ?? ""
  };
}

function buildStreetAddress(tags: Record<string, string>): string {
  const houseNumber = normalizeText(tags["addr:housenumber"]);
  const street = normalizeText(tags["addr:street"]);
  const streetOnly = normalizeText(tags.street);

  if (houseNumber && street) {
    return `${houseNumber} ${street}`;
  }

  return street || streetOnly;
}

export function isExcludedLargeChain(name: string): boolean {
  return EXCLUDED_CHAIN_PATTERNS.some((pattern) => pattern.test(name));
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

function buildTextBlob(tags: Record<string, string>): string {
  return Object.values(tags).join(" ").toLowerCase();
}

function inferSignalNotes(textBlob: string): string[] {
  const notes: string[] = [];

  if (/(single origin|single-origin|ethiopian|ethiopia|colombia|colombian|guatemala|guatemalan|kenya|panama|washed|natural)/i.test(textBlob)) {
    notes.push("single-origin coffee and traceable sourcing are visible");
  }

  if (/(pour over|pour-over|v60|chemex|kalita|brew bar|filter coffee)/i.test(textBlob)) {
    notes.push("manual brew is offered as a real handcrafted coffee option");
  }

  if (/(cortado|macchiato|flat white)/i.test(textBlob)) {
    notes.push("traditional espresso drinks suggest ratio-based preparation");
  }

  if (/(roast date|fresh crop|origin|producer|farm)/i.test(textBlob)) {
    notes.push("origin and freshness details suggest stronger transparency");
  }

  if (/(fruity|chocolaty|chocolatey|floral|citrus|berry|stone fruit|caramel notes|tasting notes)/i.test(textBlob)) {
    notes.push("flavor-note language suggests coffee knowledge at the bar");
  }

  return notes;
}

function inferPenaltySignals(textBlob: string): string[] {
  const penalties: string[] = [];

  if (/(dark roast|bold roast|extra bold|french roast)/i.test(textBlob)) {
    penalties.push("dark-roast or bold-roast language can hide bean quality");
  }

  if (/(vanilla|hazelnut|caramel|pumpkin spice|frappe|frappuccino|smoothie|milkshake|boba|bubble tea|energy drink|monster|red bull)/i.test(textBlob)) {
    penalties.push("sweet or non-coffee drinks appear to dominate the menu");
  }

  if (/(small|medium|large)/i.test(textBlob) && /(latte|cappuccino|macchiato|cortado|flat white|espresso)/i.test(textBlob)) {
    penalties.push("generic cup sizing appears to override espresso drink ratios");
  }

  if (/(breakfast|brunch|sandwich|burger|pizza|salad|cocktail|wine|beer)/i.test(textBlob) && !/(espresso|pour over|single origin|roaster|brew bar)/i.test(textBlob)) {
    penalties.push("food or non-coffee service appears more prominent than coffee craft");
  }

  return penalties;
}

function getCoffeeEvidenceAdjustments(signalNotes: string[], penaltySignals: string[]) {
  const positive = signalNotes.length;
  const negative = penaltySignals.length;

  return {
    espresso: positive * 0.45 - negative * 0.5,
    pourOver: positive * 0.55 - negative * 0.55,
    credibility: positive * 0.4 - negative * 0.5
  };
}

function toCoffeeShop(element: OverpassElement, location: SearchLocation): CoffeeShop | null {
  const tags = element.tags ?? {};
  const name = normalizeText(tags.name);
  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;

  if (!name || latitude === undefined || longitude === undefined) return null;
  if (isExcludedLargeChain(name)) return null;

  const inferredTags = inferTags(tags);
  const isRoaster = inferredTags.includes("roaster");
  const hasWebsite = Boolean(tags.website || tags["contact:website"]);
  const textBlob = buildTextBlob(tags);
  const hasSpecialtyWords = /specialty|single origin|third wave|espresso|filter|pour over|pour-over|roaster/i.test(textBlob);
  const signalNotes = inferSignalNotes(textBlob);
  const penaltySignals = inferPenaltySignals(textBlob);
  const adjustments = getCoffeeEvidenceAdjustments(signalNotes, penaltySignals);
  const locationParts = splitLocationLabel(location.label);
  const streetAddress = buildStreetAddress(tags);
  const city =
    normalizeText(tags["addr:city"]) ||
    normalizeText(tags["addr:town"]) ||
    normalizeText(tags["addr:village"]) ||
    locationParts.city ||
    location.label;
  const state =
    normalizeText(tags["addr:state"]) ||
    normalizeText(tags["addr:state_code"]) ||
    locationParts.state;

  return {
    id: `live-${element.type}-${element.id}`,
    name,
    streetAddress,
    neighborhood: normalizeText(tags.neighbourhood) || normalizeText(tags.suburb) || "Nearby",
    city,
    state,
    zipCode: normalizeText(tags["addr:postcode"]),
    latitude,
    longitude,
    openNow: true,
    tags: inferredTags,
    distanceHintMiles: 0,
    espressoEvidence: Math.max(2.5, Math.min(10, (hasSpecialtyWords ? 6.2 : 4.5) + adjustments.espresso)),
    pourOverEvidence: Math.max(2.2, Math.min(10, (hasSpecialtyWords ? 5.8 : 3.8) + adjustments.pourOver)),
    roasterProgram: isRoaster ? 8.4 : 3.5,
    credibilitySignals: Math.max(2.5, Math.min(10, (hasWebsite ? 5.6 : 4.2) + adjustments.credibility)),
    publicRating: 3.8,
    sources: [
      {
        source: "OpenStreetMap",
        category: "public-review",
        note: "Live nearby coffee place from OpenStreetMap, blended with coffee-first signals and curated specialty enrichment when available.",
        weight: 0.35,
        url: `https://www.openstreetmap.org/${element.type}/${element.id}`
      }
    ],
    whyRecommended: isRoaster
      ? "Nearby live result with roastery signals and stronger coffee-first potential."
      : "Nearby live coffee result selected for coffee-first signals and local relevance.",
    signalNotes,
    penaltySignals,
    avoidNotes: penaltySignals.length > 0 ? ["available metadata suggests this may be less coffee-focused than the strongest specialty picks"] : [],
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

export async function reverseGeocodeLocation(latitude: number, longitude: number): Promise<string | null> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("zoom", "12");
  url.searchParams.set("addressdetails", "1");

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error(`Reverse geocoding failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    display_name?: string;
    address?: Record<string, string>;
  };

  const address = data.address ?? {};
  const cityLabel =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.suburb ||
    address.county;
  const stateLabel = address.state_code || address.state;

  if (cityLabel && stateLabel) {
    return `${cityLabel}, ${stateLabel}`;
  }

  if (cityLabel) {
    return cityLabel;
  }

  return data.display_name?.split(",").slice(0, 2).join(", ").trim() || null;
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
