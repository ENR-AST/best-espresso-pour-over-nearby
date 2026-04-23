import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CafeCard } from "./components/CafeCard";
import { CafeDetailModal } from "./components/CafeDetailModal";
import { FilterBar } from "./components/FilterBar";
import { LocationPanel } from "./components/LocationPanel";
import { MapCardRail } from "./components/MapCardRail";
import { AdminPanel } from "./components/AdminPanel";
import waliEspressoLogo from "./assets/wali-espresso.png";
import { defaultLocation, findMockLocation, mockLocationEntries } from "./data/mockLocations";
import { mockCoffeeShops } from "./data/mockCoffeeShops";
import { enrichCoffeeShopsWithCuratedSignals } from "./lib/curatedEnrichment";
import { loadCuratedCafeRecords } from "./lib/curatedSourceStore";
import { getDistanceMiles } from "./lib/geo";
import { fetchNearbyCoffeeShops, geocodeLocation, isExcludedLargeChain, reverseGeocodeLocation } from "./lib/liveCoffee";
import { rankCoffeeShops } from "./lib/scoring";
import type { CoffeeShop, CuratedCafeRecord, FilterKey, RankedCoffeeShop, SearchLocation, SearchMode } from "./types/coffee";

interface SavedCity {
  label: string;
  value: string;
}

const SAVED_CITIES_STORAGE_KEY = "wali-espresso-saved-cities";
const defaultSavedCities: SavedCity[] = [
  { label: "Jersey City", value: "Jersey City, NJ" },
  { label: "New York City", value: "New York City, NY" },
  { label: "Bethesda", value: "Bethesda, MD" },
  { label: "Venice", value: "Venice, FL" }
];

function normalizeQuery(value: string): string {
  return value.trim();
}

function normalizeSavedCityValue(value: string): string {
  return value.trim().toLowerCase();
}

function createSavedCityLabel(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function loadSavedCities(): SavedCity[] {
  if (typeof window === "undefined") return defaultSavedCities;

  try {
    const raw = window.localStorage.getItem(SAVED_CITIES_STORAGE_KEY);
    if (!raw) return defaultSavedCities;

    const parsed = JSON.parse(raw) as SavedCity[];
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultSavedCities;

    return parsed.filter((entry) => entry?.label && entry?.value);
  } catch {
    return defaultSavedCities;
  }
}

function getNearestPrototypeMarket(latitude: number, longitude: number): SearchLocation {
  const nearest = [...mockLocationEntries].sort((a, b) => {
    const distanceA = getDistanceMiles(latitude, longitude, a.latitude, a.longitude);
    const distanceB = getDistanceMiles(latitude, longitude, b.latitude, b.longitude);
    return distanceA - distanceB;
  })[0];

  return {
    label: nearest.label,
    latitude: nearest.latitude,
    longitude: nearest.longitude,
    source: "default"
  };
}

function enrichShopsForDisplay(shops: CoffeeShop[], curatedRecords: CuratedCafeRecord[]): CoffeeShop[] {
  return enrichCoffeeShopsWithCuratedSignals(shops, curatedRecords).filter(
    (shop) => !isExcludedLargeChain(shop.name)
  );
}

function normalizeShopKey(shop: CoffeeShop): string {
  const normalize = (value: string | undefined) =>
    (value ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ");

  const normalizedStreet = normalize(shop.streetAddress);
  const normalizedCity = normalize(shop.city);
  const normalizedState = normalize(shop.state);
  const normalizedName = normalize(shop.name);

  return [normalizedName, normalizedStreet || normalize(shop.neighborhood), normalizedCity, normalizedState]
    .filter(Boolean)
    .join("|");
}

function mergeUniqueStrings(current: string[] = [], incoming: string[] = []) {
  return Array.from(new Set([...current, ...incoming].filter(Boolean)));
}

function mergeDuplicateShops(shops: CoffeeShop[]): CoffeeShop[] {
  const grouped = new Map<string, CoffeeShop>();

  for (const shop of shops) {
    const key = normalizeShopKey(shop);
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, shop);
      continue;
    }

    const preferred =
      existing.id.startsWith("your-list-") || existing.discoveredByYou
        ? existing
        : shop.id.startsWith("your-list-") || shop.discoveredByYou
          ? shop
          : existing;
    const secondary = preferred === existing ? shop : existing;

    grouped.set(key, {
      ...secondary,
      ...preferred,
      streetAddress: preferred.streetAddress || secondary.streetAddress,
      neighborhood: preferred.neighborhood || secondary.neighborhood,
      city: preferred.city || secondary.city,
      state: preferred.state || secondary.state,
      zipCode: preferred.zipCode || secondary.zipCode,
      latitude: preferred.latitude ?? secondary.latitude,
      longitude: preferred.longitude ?? secondary.longitude,
      tags: Array.from(new Set([...preferred.tags, ...secondary.tags])),
      sources: Array.from(
        new Map(
          [...preferred.sources, ...secondary.sources].map((source) => [
            `${source.source}|${source.note}|${source.url}`,
            source
          ])
        ).values()
      ),
      signalNotes: mergeUniqueStrings(preferred.signalNotes, secondary.signalNotes),
      avoidNotes: mergeUniqueStrings(preferred.avoidNotes, secondary.avoidNotes),
      penaltySignals: mergeUniqueStrings(preferred.penaltySignals, secondary.penaltySignals),
      externalLinks: Array.from(
        new Map(
          [...preferred.externalLinks, ...secondary.externalLinks].map((link) => [
            `${link.label}|${link.url}`,
            link
          ])
        ).values()
      )
    });
  }

  return Array.from(grouped.values());
}

function buildYourListShops(
  curatedRecords: CuratedCafeRecord[],
  resultsLocation: SearchLocation,
  existingShops: CoffeeShop[]
): CoffeeShop[] {
  const grouped = new Map<string, CuratedCafeRecord[]>();
  const locationLabel = resultsLocation.label.toLowerCase();

  const candidateRecords = curatedRecords.filter((record) => {
    const cafeName = record.cafeName?.trim();
    if (!cafeName) {
      return false;
    }

    if (record.sourceId !== "your-list") {
      return false;
    }

    const city = record.city?.toLowerCase() ?? "";
    const cityMatch = !city || locationLabel.includes(city) || city.includes(locationLabel);
    const distanceMatch =
      record.latitude !== undefined &&
      record.longitude !== undefined &&
      getDistanceMiles(
        resultsLocation.latitude,
        resultsLocation.longitude,
        record.latitude,
        record.longitude
      ) <= 15;

    return cityMatch || distanceMatch;
  });

  for (const record of candidateRecords) {
    const key = `${record.cafeName.trim().toLowerCase()}|${record.city?.toLowerCase() ?? ""}|${record.neighborhood?.toLowerCase() ?? ""}`;
    const current = grouped.get(key) ?? [];
    current.push(record);
    grouped.set(key, current);
  }

  return Array.from(grouped.values())
    .filter((records) => Boolean(records[0]?.cafeName?.trim()))
    .map((records, index) => {
      const primary = records[0];
      const primaryName = primary.cafeName.trim();
      const latitudeOffset = (index + 1) * 0.0011;
      const longitudeOffset = (index + 1) * 0.0009;
      const tags = Array.from(new Set(records.flatMap((record) => record.tags)));
      const espressoBoost = Math.max(...records.map((record) => record.espressoBoost ?? 0), 0);
      const pourOverBoost = Math.max(...records.map((record) => record.pourOverBoost ?? 0), 0);
      const roasterBoost = Math.max(...records.map((record) => record.roasterBoost ?? 0), 0);
      const credibilityBoost = Math.max(...records.map((record) => record.credibilityBoost ?? 0), 0);
      const signalNotes = Array.from(new Set(records.flatMap((record) => record.signalNotes ?? [])));
      const penaltySignals = Array.from(new Set(records.flatMap((record) => record.penaltySignals ?? [])));
      const sources = records.map((record) => ({
        source: record.sourceName,
        category: record.category,
        note: record.evidenceNote,
        weight: record.confidence,
        url: record.sourceUrl
      }));

      return {
        id: `your-list-${primaryName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        name: primaryName,
        discoveredByYou: true,
        streetAddress: primary.streetAddress,
        neighborhood: primary.neighborhood ?? "Added by you",
        city: primary.city ?? resultsLocation.label,
        state: primary.state,
        zipCode: primary.zipCode ?? "",
        latitude: primary.latitude ?? (resultsLocation.latitude + latitudeOffset),
        longitude: primary.longitude ?? (resultsLocation.longitude + longitudeOffset),
        openNow: true,
        tags,
        distanceHintMiles:
          primary.latitude !== undefined && primary.longitude !== undefined
            ? getDistanceMiles(
                resultsLocation.latitude,
                resultsLocation.longitude,
                primary.latitude,
                primary.longitude
              )
            : 0.6 + index * 0.15,
        espressoEvidence: Math.min(10, 5.5 + espressoBoost * 6),
        pourOverEvidence: Math.min(10, 5.5 + pourOverBoost * 6),
        roasterProgram: Math.min(10, 4 + roasterBoost * 6),
        credibilitySignals: Math.min(10, 6 + credibilityBoost * 6),
        publicRating: 4.2,
        sources,
        whyRecommended: "Added by you from the admin editor, so it appears directly in your coffee list.",
        signalNotes,
        avoidNotes: [],
        penaltySignals,
        externalLinks: records.map((record) => ({
          label: record.sourceName,
          url: record.sourceUrl
        }))
      } satisfies CoffeeShop;
    });
}

function App() {
  const [location, setLocation] = useState<SearchLocation>(defaultLocation);
  const [resultsLocation, setResultsLocation] = useState<SearchLocation>(defaultLocation);
  const [locationInput, setLocationInput] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("current");
  const [savedCities, setSavedCities] = useState<SavedCity[]>(() => loadSavedCities());
  const [geoStatus, setGeoStatus] = useState("Use your location or enter a ZIP code/city to begin.");
  const [resultsStatus, setResultsStatus] = useState<"live" | "fallback">("fallback");
  const [activeFilters, setActiveFilters] = useState<FilterKey[]>([]);
  const [selectedShop, setSelectedShop] = useState<RankedCoffeeShop | null>(null);
  const [shops, setShops] = useState<CoffeeShop[]>([]);
  const [curatedRecords, setCuratedRecords] = useState<CuratedCafeRecord[]>([]);
  const [curatedRecordsMode, setCuratedRecordsMode] = useState<"supabase" | "local">("local");
  const [curatedRecordsNote, setCuratedRecordsNote] = useState("Using bundled curated source records while the app loads.");
  const [isLoading, setIsLoading] = useState(false);
  const requestSequenceRef = useRef(0);

  function beginLocationRequest() {
    requestSequenceRef.current += 1;
    return requestSequenceRef.current;
  }

  function isLatestLocationRequest(requestId: number) {
    return requestSequenceRef.current === requestId;
  }

  const refreshCuratedRecords = useCallback(async () => {
    const curatedSourceResult = await loadCuratedCafeRecords();
    setCuratedRecords(curatedSourceResult.records);
    setCuratedRecordsMode(curatedSourceResult.mode);
    setCuratedRecordsNote(curatedSourceResult.note);
  }, []);

  const displayShops = useMemo(() => {
    const yourListShops = buildYourListShops(curatedRecords, resultsLocation, shops);
    return enrichShopsForDisplay(
      mergeDuplicateShops([...yourListShops, ...shops]),
      curatedRecords
    );
  }, [shops, curatedRecords, resultsLocation]);

  const rankedShops = useMemo(() => {
    return rankCoffeeShops(displayShops, resultsLocation, activeFilters);
  }, [displayShops, resultsLocation, activeFilters]);

  const resetToDefault = useCallback((status = "Use your location or enter a ZIP code/city to begin.") => {
    setLocation(defaultLocation);
    setResultsLocation(defaultLocation);
    setLocationInput("");
    setSearchMode("current");
    setShops([]);
    setResultsStatus("fallback");
    setGeoStatus(status);
    setIsLoading(false);
  }, []);

  const handleUseMyLocation = useCallback(async () => {
    const requestId = beginLocationRequest();
    setIsLoading(true);

    if (!window.isSecureContext) {
      if (isLatestLocationRequest(requestId)) {
        resetToDefault("Geolocation needs a secure page. Run the app from localhost with npm run dev, not from a file.");
      }
      return;
    }

    if (!navigator.geolocation) {
      if (isLatestLocationRequest(requestId)) {
        resetToDefault("Geolocation is not supported in this browser.");
      }
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      try {
        const permission = await navigator.permissions.query({ name: "geolocation" });
        if (permission.state === "denied") {
          if (isLatestLocationRequest(requestId)) {
            resetToDefault("Location permission is blocked in your browser. Allow location for localhost and try again.");
          }
          return;
        }
      } catch {
        // Ignore permission API failures and continue with geolocation.
      }
    }

    setGeoStatus("Trying to detect your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!isLatestLocationRequest(requestId)) return;

        void (async () => {
          let locationLabel = "Your current location";

          try {
            const reversedLabel = await reverseGeocodeLocation(
              position.coords.latitude,
              position.coords.longitude
            );
            if (reversedLabel) {
              locationLabel = reversedLabel;
            }
          } catch {
            // Keep the generic label when reverse geocoding is unavailable.
          }

          const userLocation: SearchLocation = {
            label: locationLabel,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            source: "geolocation"
          };

          const nearestPrototype = getNearestPrototypeMarket(
            position.coords.latitude,
            position.coords.longitude
          );

          setLocation(userLocation);
          setLocationInput("");

          try {
            const liveShops = await fetchNearbyCoffeeShops(userLocation);
            if (!isLatestLocationRequest(requestId)) return;

            if (liveShops.length > 0) {
              setResultsLocation(userLocation);
              setShops(liveShops);
              setResultsStatus("live");
              setGeoStatus(`Using ${locationLabel} and found ${liveShops.length} nearby coffee places.`);
              return;
            }

            if (!isLatestLocationRequest(requestId)) return;
            setResultsLocation(nearestPrototype);
            setShops(mockCoffeeShops);
            setResultsStatus("fallback");
            setGeoStatus(`${locationLabel} was detected, but live nearby lookup returned no cafes. Showing fallback recommendations centered near ${nearestPrototype.label} instead.`);
          } catch (error) {
            if (!isLatestLocationRequest(requestId)) return;
            setResultsLocation(nearestPrototype);
            setShops(mockCoffeeShops);
            setResultsStatus("fallback");
            setGeoStatus(`${locationLabel} was detected, but nearby coffee lookup failed. Showing fallback recommendations centered near ${nearestPrototype.label} instead. ${error instanceof Error ? error.message : "Unknown lookup error."}`);
          } finally {
            if (isLatestLocationRequest(requestId)) {
              setIsLoading(false);
            }
          }
        })();
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          if (isLatestLocationRequest(requestId)) {
            resetToDefault("Location blocked by the browser. Showing default recommendations instead.");
          }
          return;
        }

        if (error.code === error.POSITION_UNAVAILABLE) {
          if (isLatestLocationRequest(requestId)) {
            resetToDefault("Your browser could not determine a location. Showing default recommendations instead.");
          }
          return;
        }

        if (error.code === error.TIMEOUT) {
          if (isLatestLocationRequest(requestId)) {
            resetToDefault("Location timed out. Showing default recommendations instead.");
          }
          return;
        }

        if (isLatestLocationRequest(requestId)) {
          resetToDefault(`Could not read your location. Showing default recommendations instead. ${error.message}`);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 300000
      }
    );
  }, [resetToDefault]);

  useEffect(() => {
    void refreshCuratedRecords();
  }, [refreshCuratedRecords]);

  useEffect(() => {
    window.localStorage.setItem(SAVED_CITIES_STORAGE_KEY, JSON.stringify(savedCities));
  }, [savedCities]);

  async function handleSearch() {
    const requestId = beginLocationRequest();
    const query = normalizeQuery(locationInput);
    if (!query) {
      if (isLatestLocationRequest(requestId)) {
        setGeoStatus(searchMode === "zip" ? "Enter a 5-digit ZIP code to search." : "Enter a city or neighborhood to search.");
      }
      return;
    }

    setIsLoading(true);

    let liveLocation: SearchLocation | null = null;

    try {
      liveLocation = await geocodeLocation(query, searchMode);
    } catch (error) {
      if (searchMode === "city") {
        const matchedLocation = findMockLocation(query.toLowerCase());
        if (matchedLocation) {
          if (!isLatestLocationRequest(requestId)) return;
          setLocation(matchedLocation);
          setResultsLocation(matchedLocation);
          setShops(mockCoffeeShops);
          setResultsStatus("fallback");
          setGeoStatus(`Live location search failed, so the app used the prototype match: ${matchedLocation.label}.`);
          setIsLoading(false);
          return;
        }
      }

      if (isLatestLocationRequest(requestId)) {
        setGeoStatus(error instanceof Error ? error.message : "Search failed.");
        setIsLoading(false);
      }
      return;
    }

    if (!liveLocation) {
      if (isLatestLocationRequest(requestId)) {
        setGeoStatus("Could not find that location. Try a city, neighborhood, or 5-digit ZIP code.");
        setIsLoading(false);
      }
      return;
    }

    const nearestPrototype = getNearestPrototypeMarket(liveLocation.latitude, liveLocation.longitude);

    try {
      const liveShops = await fetchNearbyCoffeeShops(liveLocation);
      if (!isLatestLocationRequest(requestId)) return;
      setLocation(liveLocation);

      if (liveShops.length > 0) {
        setResultsLocation(liveLocation);
        setShops(liveShops);
        setResultsStatus("live");
        setGeoStatus(`Search applied: ${liveLocation.label}. Found ${liveShops.length} nearby coffee places.`);
        setIsLoading(false);
        return;
      }

      setLocation(liveLocation);
      setResultsLocation(nearestPrototype);
      setShops(mockCoffeeShops);
      setResultsStatus("fallback");
      setGeoStatus(`Found ${liveLocation.label}, but live nearby cafes were unavailable. Showing fallback recommendations centered near ${nearestPrototype.label}.`);
      setIsLoading(false);
      return;
    } catch (error) {
      if (!isLatestLocationRequest(requestId)) return;

      setLocation(liveLocation);
      setResultsLocation(nearestPrototype);
      setShops(mockCoffeeShops);
      setResultsStatus("fallback");
      setGeoStatus(`Found ${liveLocation.label}, but nearby lookup failed. Showing fallback recommendations centered near ${nearestPrototype.label} instead. ${error instanceof Error ? error.message : "Unknown lookup error."}`);
      setIsLoading(false);
      return;
    }

    if (isLatestLocationRequest(requestId)) {
      resetToDefault("Could not find that location yet. Showing default recommendations instead.");
    }
  }

  function handleToggleFilter(filter: FilterKey) {
    setActiveFilters((current) =>
      current.includes(filter)
        ? current.filter((item) => item !== filter)
        : [...current, filter]
    );
  }

  function handleReset() {
    resetToDefault();
  }

  function handleAddSavedCity(cityValue: string) {
    const normalizedValue = cityValue.trim();
    if (!normalizedValue) return;

    setSavedCities((current) => {
      const alreadyExists = current.some(
        (entry) => normalizeSavedCityValue(entry.value) === normalizeSavedCityValue(normalizedValue)
      );

      if (alreadyExists) {
        setGeoStatus(`${createSavedCityLabel(normalizedValue)} is already in My Cities.`);
        return current;
      }

      const nextEntry = {
        label: createSavedCityLabel(normalizedValue),
        value: normalizedValue
      };

      setGeoStatus(`${nextEntry.label} was added to My Cities.`);
      return [...current, nextEntry];
    });
  }

  function handleSelectSavedCity(cityValue: string) {
    setSearchMode("city");
    setLocationInput(cityValue);
    setGeoStatus(`Searching saved city: ${cityValue}`);

    window.setTimeout(() => {
      void handleSavedCitySearch(cityValue);
    }, 0);
  }

  async function handleSavedCitySearch(cityValue: string) {
    setLocationInput(cityValue);
    const requestId = beginLocationRequest();
    const query = normalizeQuery(cityValue);
    if (!query) return;

    setIsLoading(true);

    let liveLocation: SearchLocation | null = null;

    try {
      liveLocation = await geocodeLocation(query, "city");
    } catch (error) {
      const matchedLocation = findMockLocation(query.toLowerCase());
      if (matchedLocation) {
        if (!isLatestLocationRequest(requestId)) return;
        setLocation(matchedLocation);
        setResultsLocation(matchedLocation);
        setShops(mockCoffeeShops);
        setResultsStatus("fallback");
        setGeoStatus(`Live lookup missed ${query}, so the app used the prototype match: ${matchedLocation.label}.`);
        setIsLoading(false);
        return;
      }

      if (isLatestLocationRequest(requestId)) {
        setGeoStatus(error instanceof Error ? error.message : "Search failed.");
        setIsLoading(false);
      }
      return;
    }

    if (!liveLocation) {
      if (isLatestLocationRequest(requestId)) {
        setGeoStatus(`Could not find ${query} yet.`);
        setIsLoading(false);
      }
      return;
    }

    const nearestPrototype = getNearestPrototypeMarket(liveLocation.latitude, liveLocation.longitude);

    try {
      const liveShops = await fetchNearbyCoffeeShops(liveLocation);
      if (!isLatestLocationRequest(requestId)) return;
      setLocation(liveLocation);

      if (liveShops.length > 0) {
        setResultsLocation(liveLocation);
        setShops(liveShops);
        setResultsStatus("live");
        setGeoStatus(`Saved city applied: ${liveLocation.label}. Found ${liveShops.length} nearby coffee places.`);
        setIsLoading(false);
        return;
      }

      setResultsLocation(nearestPrototype);
      setShops(mockCoffeeShops);
      setResultsStatus("fallback");
      setGeoStatus(`Found ${liveLocation.label}, but live nearby cafes were unavailable. Showing fallback recommendations centered near ${nearestPrototype.label}.`);
      setIsLoading(false);
    } catch (error) {
      if (!isLatestLocationRequest(requestId)) return;

      setLocation(liveLocation);
      setResultsLocation(nearestPrototype);
      setShops(mockCoffeeShops);
      setResultsStatus("fallback");
      setGeoStatus(`Found ${liveLocation.label}, but nearby lookup failed. Showing fallback recommendations centered near ${nearestPrototype.label} instead. ${error instanceof Error ? error.message : "Unknown lookup error."}`);
      setIsLoading(false);
    }
  }

  function handleSelectMode(mode: SearchMode) {
    setSearchMode(mode);
    setLocationInput("");

    if (mode === "current") {
      void handleUseMyLocation();
      return;
    }

    setGeoStatus(mode === "zip" ? "ZIP code mode selected. Enter a 5-digit ZIP code." : "City mode selected. Enter a city or neighborhood.");
  }
  const selectedRankedShop = selectedShop
    ? rankedShops.find((shop) => shop.id === selectedShop.id) ?? selectedShop
    : null;

  return (
    <main className="app-shell">
      <section id="about">
        <LocationPanel
          location={location}
          locationInput={locationInput}
          onInputChange={setLocationInput}
          onSearch={handleSearch}
          onUseMyLocation={handleUseMyLocation}
          onReset={handleReset}
          onSelectMode={handleSelectMode}
          onSelectSavedCity={handleSelectSavedCity}
          onAddSavedCity={handleAddSavedCity}
          searchMode={searchMode}
          geoStatus={geoStatus}
          logoSrc={waliEspressoLogo}
          isLoading={isLoading}
          savedCities={savedCities}
          previewShops={rankedShops.slice(0, 3)}
        />
      </section>

      <section id="results" className="results-shell">
        <div className="section-heading results-header">
          <div>
            <p className="eyebrow">Results</p>
            <h2>Ranked cafes and roasters</h2>
          </div>
          <div className="results-meta">
            <span className={resultsStatus === "live" ? "results-badge live" : "results-badge fallback"}>
              {resultsStatus === "live" ? "Live results" : "Fallback results"}
            </span>
            <span>{rankedShops.length} matches</span>
          </div>
        </div>

        <FilterBar activeFilters={activeFilters} onToggleFilter={handleToggleFilter} />

        <div className="content-grid">
          <div className="results-list">
            {rankedShops.map((shop) => (
              <CafeCard key={shop.id} shop={shop} onViewDetails={setSelectedShop} />
            ))}
          </div>

          <MapCardRail shops={rankedShops} location={resultsLocation} />
        </div>
      </section>

      <section id="method" className="architecture-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Method</p>
            <h2>Production-minded, mock-data first</h2>
          </div>
        </div>
        <div className="architecture-grid">
          <article>
            <h3>Simpler interface</h3>
            <p>The app now uses direct search buttons for your location, city, or ZIP code, with a dedicated reset action.</p>
          </article>
          <article>
            <h3>Real map</h3>
            <p>Leaflet plots the actual result area so the map matches the cafes you are seeing.</p>
          </article>
          <article>
            <h3>Curated specialty enrichment</h3>
            <p>Live places are matched against known specialty cafes in the curated dataset to inherit stronger editorial and enthusiast signals.</p>
            <p>{curatedRecordsMode === "supabase" ? "Curated source mode: Supabase." : "Curated source mode: bundled fallback."}</p>
            <p>{curatedRecordsNote}</p>
          </article>
        </div>
      </section>

      <AdminPanel curatedMode={curatedRecordsMode} onSaved={refreshCuratedRecords} />

      <CafeDetailModal
        shop={selectedRankedShop}
        onClose={() => setSelectedShop(null)}
      />
    </main>
  );
}

export default App;
