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
import { loadPersonalReviews, savePersonalReviews, type PersonalReviewMap } from "./lib/personalReviews";
import { fetchNearbyCoffeeShops, geocodeLocation, isExcludedLargeChain } from "./lib/liveCoffee";
import { rankCoffeeShops } from "./lib/scoring";
import type { CoffeeShop, CuratedCafeRecord, FilterKey, PersonalReview, RankedCoffeeShop, SearchLocation, SearchMode } from "./types/coffee";

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

function App() {
  const [location, setLocation] = useState<SearchLocation>(defaultLocation);
  const [resultsLocation, setResultsLocation] = useState<SearchLocation>(defaultLocation);
  const [locationInput, setLocationInput] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("current");
  const [savedCities, setSavedCities] = useState<SavedCity[]>(() => loadSavedCities());
  const [geoStatus, setGeoStatus] = useState("Trying to detect your location automatically...");
  const [resultsStatus, setResultsStatus] = useState<"live" | "fallback">("fallback");
  const [activeFilters, setActiveFilters] = useState<FilterKey[]>([]);
  const [selectedShop, setSelectedShop] = useState<RankedCoffeeShop | null>(null);
  const [shops, setShops] = useState<CoffeeShop[]>(mockCoffeeShops);
  const [personalReviews, setPersonalReviews] = useState<PersonalReviewMap>(() => loadPersonalReviews());
  const [curatedRecords, setCuratedRecords] = useState<CuratedCafeRecord[]>([]);
  const [curatedRecordsMode, setCuratedRecordsMode] = useState<"supabase" | "local">("local");
  const [curatedRecordsNote, setCuratedRecordsNote] = useState("Using bundled curated source records while the app loads.");
  const [isLoading, setIsLoading] = useState(false);
  const autoLocateAttemptedRef = useRef(false);
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
    return enrichShopsForDisplay(shops, curatedRecords);
  }, [shops, curatedRecords]);

  const rankedShops = useMemo(() => {
    return rankCoffeeShops(displayShops, resultsLocation, activeFilters, personalReviews);
  }, [displayShops, resultsLocation, activeFilters, personalReviews]);

  const topPick = rankedShops[0];

  const resetToDefault = useCallback((status = "Reset to default recommendations.") => {
    setLocation(defaultLocation);
    setResultsLocation(defaultLocation);
    setLocationInput("");
    setSearchMode("current");
    setShops(mockCoffeeShops);
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

        const userLocation: SearchLocation = {
          label: "Your current location",
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

        void (async () => {
          try {
            const liveShops = await fetchNearbyCoffeeShops(userLocation);
            if (!isLatestLocationRequest(requestId)) return;

            if (liveShops.length > 0) {
              setResultsLocation(userLocation);
              setShops(liveShops);
              setResultsStatus("live");
              setGeoStatus(`Using your real location and found ${liveShops.length} nearby coffee places.`);
              return;
            }

            if (!isLatestLocationRequest(requestId)) return;
            setResultsLocation(nearestPrototype);
            setShops(mockCoffeeShops);
            setResultsStatus("fallback");
            setGeoStatus(`Your real location was detected, but live nearby lookup returned no cafes. Showing prototype data centered near ${nearestPrototype.label} instead.`);
          } catch (error) {
            if (!isLatestLocationRequest(requestId)) return;
            setResultsLocation(nearestPrototype);
            setShops(mockCoffeeShops);
            setResultsStatus("fallback");
            setGeoStatus(`Your real location was detected, but nearby coffee lookup failed. Showing prototype recommendations centered near ${nearestPrototype.label} instead. ${error instanceof Error ? error.message : "Unknown lookup error."}`);
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
    savePersonalReviews(personalReviews);
  }, [personalReviews]);

  useEffect(() => {
    window.localStorage.setItem(SAVED_CITIES_STORAGE_KEY, JSON.stringify(savedCities));
  }, [savedCities]);

  useEffect(() => {
    if (autoLocateAttemptedRef.current) return;
    autoLocateAttemptedRef.current = true;
    void handleUseMyLocation();
  }, [handleUseMyLocation]);

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
    void handleUseMyLocation();
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

  function handleSavePersonalReview(review: PersonalReview) {
    setPersonalReviews((current) => ({
      ...current,
      [review.shopId]: review
    }));
    setGeoStatus(`Saved your grading for ${selectedShop?.name ?? "this cafe"}. Your ranking now reflects it.`);
  }

  const selectedShopWithReview = selectedShop
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

      <section className="top-pick-panel">
        <p className="eyebrow">Top recommendation</p>
        <div className="top-pick-card">
          <div>
            <h2>{topPick?.name}</h2>
            <p>{topPick?.whyRecommended}</p>
          </div>
          <div className="top-pick-stats">
            <span>{topPick?.specialtyScore} specialty score</span>
            <span>{topPick?.distanceMiles.toFixed(1)} mi away</span>
            <span>{topPick?.supportLabels.join(" · ")}</span>
          </div>
        </div>
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
            <p>The app now uses one dropdown for location mode, with current location as the default and a dedicated reset action.</p>
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
        shop={selectedShopWithReview}
        personalReview={selectedShopWithReview ? personalReviews[selectedShopWithReview.id] : undefined}
        onSavePersonalReview={handleSavePersonalReview}
        onClose={() => setSelectedShop(null)}
      />
    </main>
  );
}

export default App;
