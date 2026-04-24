import type { SearchMode } from "../types/coffee";

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
        <div className="brand-cluster">
          <div className="logo-frame compact">
            <img src={logoSrc} alt="Wali Espresso logo" className="hero-logo" />
          </div>
          <div className="nav-brand">
            <span className="nav-mark">Wali Espresso</span>
            <span className="nav-subtitle">Specialty coffee finder</span>
          </div>
        </div>

      </nav>

      <div className="hero-layout hero-layout-compact">
        <div className="hero-copy">
          <p className="eyebrow">Best Espresso & Pour Over Nearby</p>
          <h1>Coffe Near You</h1>
          <div className="lead search-mode-intro">
            <span className="search-mode-label">Search coffe by:</span>
            <div className="search-mode-buttons">
              <button
                type="button"
                className={searchMode === "current" ? "filter-chip active" : "filter-chip"}
                onClick={() => onSelectMode("current")}
              >
                Your location
              </button>
              <button
                type="button"
                className={searchMode === "city" ? "filter-chip active" : "filter-chip"}
                onClick={() => onSelectMode("city")}
              >
                City
              </button>
              <button
                type="button"
                className={searchMode === "zip" ? "filter-chip active" : "filter-chip"}
                onClick={() => onSelectMode("zip")}
              >
                Zipcode
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="search-shell">
        <div className="mode-select-row">
          <button className="action-button reset" onClick={onReset} type="button">
            Reset
          </button>
        </div>

        {searchMode === "current" ? (
          <div className="current-location-panel">
            <p className="current-location-copy">Choose how you want to start: use your location, or switch to ZIP code/city search above.</p>
            <button className="action-button primary wide" onClick={onUseMyLocation} disabled={isLoading}>
              {isLoading ? "Finding coffee..." : "Use my location"}
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

        <div className={isLoading ? "status-strip working" : "status-strip ready"}>
          <span className="status-indicator" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <strong>{isLoading ? "Working" : "Ready"}</strong>
          <span>{geoStatus}</span>
        </div>
      </div>
    </section>
  );
}
