import type { SearchLocation, SearchMode } from "../types/coffee";

interface SavedCity {
  label: string;
  value: string;
}

interface LocationPanelProps {
  locationInput: string;
  onInputChange: (value: string) => void;
  onUseMyLocation: () => void;
  onSearch: () => void;
  onReset: () => void;
  onSelectMode: (value: SearchMode) => void;
  onSelectSavedCity: (cityValue: string) => void;
  onAddSavedCity: (cityValue: string) => void;
  searchMode: SearchMode;
  location: SearchLocation;
  geoStatus: string;
  logoSrc: string;
  isLoading: boolean;
  savedCities: SavedCity[];
}

export function LocationPanel({
  locationInput,
  onInputChange,
  onUseMyLocation,
  onSearch,
  onReset,
  onSelectMode,
  onSelectSavedCity,
  onAddSavedCity,
  searchMode,
  location,
  geoStatus,
  logoSrc,
  isLoading,
  savedCities
}: LocationPanelProps) {
  const placeholder = searchMode === "zip" ? "Enter a 5-digit ZIP code" : "Enter a city or neighborhood";

  function handleAddSavedCity() {
    const nextValue = locationInput.trim();
    if (!nextValue) return;
    onAddSavedCity(nextValue);
  }

  return (
    <section className="hero-panel">
      <nav className="top-nav" aria-label="Primary">
        <div className="nav-brand">
          <span className="nav-mark">Wali Espresso</span>
          <span className="nav-subtitle">Specialty coffee finder</span>
        </div>

        <div className="nav-links">
          <a href="#results">Results</a>
          <a href="#method">Method</a>
          <a href="#about">About</a>
        </div>

        <div className="brand-corner">
          <div className="logo-frame compact">
            <img src={logoSrc} alt="Wali Espresso logo" className="hero-logo" />
          </div>
        </div>
      </nav>

      <div className="hero-layout">
        <div className="hero-copy">
          <p className="eyebrow">Best Espresso & Pour Over Nearby</p>
          <h1>Find coffee shops with real specialty credibility, not just generic ratings.</h1>
          <p className="lead">
            Search by your location, city, or ZIP code and get specialty-focused recommendations with evidence.
          </p>
        </div>
      </div>

      <div className="search-shell">
        <div className="mode-select-row">
          <div className="mode-select-block">
            <span className="status-label">Search by</span>
            <select
              className="mode-select"
              value={searchMode}
              onChange={(event) => onSelectMode(event.target.value as SearchMode)}
            >
              <option value="current">My current location</option>
              <option value="city">City name</option>
              <option value="zip">Zip code</option>
            </select>
          </div>

          <button className="action-button reset" onClick={onReset} type="button">
            Reset
          </button>
        </div>

        {searchMode === "current" ? (
          <div className="current-location-panel">
            <p className="current-location-copy">The app uses your current location automatically. You can refresh it any time below.</p>
            <button className="action-button primary wide" onClick={onUseMyLocation} disabled={isLoading}>
              {isLoading ? "Finding coffee..." : "Refresh my location"}
            </button>
          </div>
        ) : (
          <div className="manual-search">
            <input
              aria-label={placeholder}
              value={locationInput}
              onChange={(event) => onInputChange(event.target.value)}
              placeholder={placeholder}
            />
            <button className="cta-secondary" onClick={onSearch} disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </button>
            {searchMode === "city" ? (
              <button
                className="action-button add-city-button"
                onClick={handleAddSavedCity}
                disabled={!locationInput.trim() || isLoading}
                type="button"
              >
                Add city to My Cities
              </button>
            ) : null}
          </div>
        )}

        <div className="saved-cities-panel">
          <div className="saved-cities-header">
            <div>
              <span className="status-label">My cities</span>
              <strong>Home and travel shortcuts</strong>
            </div>
            <span className="saved-cities-hint">Tap one to search instantly, or add a new city while traveling.</span>
          </div>
          <div className="saved-cities-row">
            {savedCities.map((city) => (
              <button
                key={city.value}
                className="saved-city-chip"
                type="button"
                onClick={() => onSelectSavedCity(city.value)}
                disabled={isLoading}
              >
                {city.label}
              </button>
            ))}
          </div>
        </div>

        <div className="status-grid">
          <div>
            <span className="status-label">Current search base</span>
            <strong>{location.label}</strong>
          </div>
          <div>
            <span className="status-label">Location status</span>
            <strong>{geoStatus}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
