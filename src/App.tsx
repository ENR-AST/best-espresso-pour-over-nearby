import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CafeCard } from "./components/CafeCard";
import { CafeDetailModal } from "./components/CafeDetailModal";
import { FilterBar } from "./components/FilterBar";
import { LocationPanel } from "./components/LocationPanel";
import { MapCardRail } from "./components/MapCardRail";
import waliEspressoLogo from "./assets/wali-espresso.png";
import { defaultLocation, findMockLocation, mockLocationEntries } from "./data/mockLocations";
import { mockCoffeeShops } from "./data/mockCoffeeShops";
import { enrichCoffeeShopsWithCuratedSignals } from "./lib/curatedEnrichment";
import { getDistanceMiles } from "./lib/geo";
import { fetchNearbyCoffeeShops, geocodeLocation } from "./lib/liveCoffee";
import { rankCoffeeShops } from "./lib/scoring";
import type { CoffeeShop, FilterKey, RankedCoffeeShop, SearchLocation, SearchMode } from "./types/coffee";

function normalizeQuery(value: string): string {
  return value.trim();
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

function enrichShopsForDisplay(shops: CoffeeShop[]): CoffeeShop[] {
  return enrichCoffeeShopsWithCuratedSignals(shops);
}

function App() {
  const [location, setLocation] = useState<SearchLocation>(defaultLocation);
  const [resultsLocation, setResultsLocation] = useState<SearchLocation>(defaultLocation);
  const [locationInput, setLocationInput] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("current");
  const [geoStatus, setGeoStatus] = useState("Trying to detect your location automatically...");
  const [resultsStatus, setResultsStatus] = useState<"live" | "fallback">("fallback");
  const [activeFilters, setActiveFilters] = useState<FilterKey[]>([]);
  const [selectedShop, setSelectedShop] = useState<RankedCoffeeShop | null>(null);
  const [shops, setShops] = useState<CoffeeShop[]>(mockCoffeeShops);
  const [isLoading, setIsLoading] = useState(false);
  const autoLocateAttemptedRef = useRef(false);

  const rankedShops = useMemo(() => {
    return rankCoffeeShops(shops, resultsLocation, activeFilters);
  }, [shops, resultsLocation, activeFilters]);

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
    setIsLoading(true);

    if (!window.isSecureContext) {
      resetToDefault("Geolocation needs a secure page. Run the app from localhost with npm run dev, not from a file.");
      return;
    }

    if (!navigator.geolocation) {
      resetToDefault("Geolocation is not supported in this browser.");
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      try {
        const permission = await navigator.permissions.query({ name: "geolocation" });
        if (permission.state === "denied") {
          resetToDefault("Location permission is blocked in your browser. Allow location for localhost and try again.");
          return;
        }
      } catch {
        // Ignore permission API failures and continue with geolocation.
      }
    }

    setGeoStatus("Trying to detect your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
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
            const enrichedLiveShops = enrichShopsForDisplay(liveShops);

            if (enrichedLiveShops.length > 0) {
              setResultsLocation(userLocation);
              setShops(enrichedLiveShops);
              setResultsStatus("live");
              setGeoStatus(`Using your real location and found ${enrichedLiveShops.length} nearby coffee places.`);
              return;
            }

            setResultsLocation(nearestPrototype);
            setShops(mockCoffeeShops);
            setResultsStatus("fallback");
            setGeoStatus(`Your real location was detected, but live nearby lookup returned no cafes. Showing prototype data centered near ${nearestPrototype.label} instead.`);
          } catch (error) {
            setResultsLocation(nearestPrototype);
            setShops(mockCoffeeShops);
            setResultsStatus("fallback");
            setGeoStatus(`Your real location was detected, but nearby coffee lookup failed. Showing prototype recommendations centered near ${nearestPrototype.label} instead. ${error instanceof Error ? error.message : "Unknown lookup error."}`);
          } finally {
            setIsLoading(false);
          }
        })();
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          resetToDefault("Location blocked by the browser. Showing default recommendations instead.");
          return;
        }

        if (error.code === error.POSITION_UNAVAILABLE) {
          resetToDefault("Your browser could not determine a location. Showing default recommendations instead.");
          return;
        }

        if (error.code === error.TIMEOUT) {
          resetToDefault("Location timed out. Showing default recommendations instead.");
          return;
        }

        resetToDefault(`Could not read your location. Showing default recommendations instead. ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 300000
      }
    );
  }, [resetToDefault]);

  useEffect(() => {
    if (autoLocateAttemptedRef.current) return;
    autoLocateAttemptedRef.current = true;
    void handleUseMyLocation();
  }, [handleUseMyLocation]);

  async function handleSearch() {
    const query = normalizeQuery(locationInput);
    if (!query) {
      setGeoStatus(searchMode === "zip" ? "Enter a 5-digit ZIP code to search." : "Enter a city or neighborhood to search.");
      return;
    }

    setIsLoading(true);

    try {
      const liveLocation = await geocodeLocation(query, searchMode);

      if (liveLocation) {
        const liveShops = await fetchNearbyCoffeeShops(liveLocation);
        const enrichedLiveShops = enrichShopsForDisplay(liveShops);
        setLocation(liveLocation);

        if (enrichedLiveShops.length > 0) {
          setResultsLocation(liveLocation);
          setShops(enrichedLiveShops);
          setResultsStatus("live");
          setGeoStatus(`Search applied: ${liveLocation.label}. Found ${enrichedLiveShops.length} nearby coffee places.`);
          setIsLoading(false);
          return;
        }

        setResultsLocation(liveLocation);
        setShops(mockCoffeeShops);
        setResultsStatus("fallback");
        setGeoStatus(`Found ${liveLocation.label}, but no live nearby cafes were returned. Showing prototype data instead.`);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      if (searchMode === "city") {
        const matchedLocation = findMockLocation(query.toLowerCase());
        if (matchedLocation) {
          setLocation(matchedLocation);
          setResultsLocation(matchedLocation);
          setShops(mockCoffeeShops);
          setResultsStatus("fallback");
          setGeoStatus(`Live location search failed, so the app used the prototype match: ${matchedLocation.label}.`);
          setIsLoading(false);
          return;
        }
      }

      resetToDefault(error instanceof Error ? error.message : "Search failed. Reset to default recommendations.");
      return;
    }

    resetToDefault("Could not find that location yet. Showing default recommendations instead.");
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

  function handleSelectMode(mode: SearchMode) {
    setSearchMode(mode);
    setLocationInput("");

    if (mode === "current") {
      void handleUseMyLocation();
      return;
    }

    setGeoStatus(mode === "zip" ? "ZIP code mode selected. Enter a 5-digit ZIP code." : "City mode selected. Enter a city or neighborhood.");
  }

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
          searchMode={searchMode}
          geoStatus={geoStatus}
          logoSrc={waliEspressoLogo}
          isLoading={isLoading}
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
          </article>
        </div>
      </section>

      <CafeDetailModal shop={selectedShop} onClose={() => setSelectedShop(null)} />
    </main>
  );
}

export default App;
