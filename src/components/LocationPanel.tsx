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
  currentLocationLabel: string;
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
  currentLocationLabel,
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
            <span className="nav-subtitle">Espresso and pour over nearby</span>
          </div>
        </div>

      </nav>

      <div className="hero-layout hero-layout-compact">
        <div className="hero-copy">
          <p className="eyebrow">Specialty Coffee Nearby</p>
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
        <div className="search-context-row">
          <div className="search-context-card">
            <span className="status-label">Searching in</span>
            <strong>{currentLocationLabel}</strong>
          </div>
        </div>

        {searchMode === "current" ? (
          <div className="current-location-panel">
            <div className="search-action-row">
              <span className={isLoading ? "status-badge working inline" : "status-badge ready inline"}>
                <span className="status-indicator" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                <strong>{isLoading ? "SEARCHING" : "READY"}</strong>
              </span>
              <button className="action-button primary" onClick={onUseMyLocation} disabled={isLoading}>
                {isLoading ? "Finding coffee..." : "Use my location"}
              </button>
              <button className="action-button reset" onClick={onReset} type="button">
                Reset
              </button>
            </div>
          </div>
        ) : (
          <div className="manual-search">
            <input
              aria-label={placeholder}
              value={locationInput}
              onChange={(event) => onInputChange(event.target.value)}
              placeholder={placeholder}
            />
            <div className="search-action-row">
              <span className={isLoading ? "status-badge working inline" : "status-badge ready inline"}>
                <span className="status-indicator" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                <strong>{isLoading ? "SEARCHING" : "READY"}</strong>
              </span>
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
                  Add city
                </button>
              ) : null}
              <button className="action-button reset" onClick={onReset} type="button">
                Reset
              </button>
            </div>
          </div>
        )}

        <div className="saved-cities-panel">
          <div className="saved-cities-header compact">
            <div>
              <span className="status-label">My cities</span>
              <strong>Quick search</strong>
            </div>
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
          <span>{geoStatus}</span>
        </div>
      </div>
    </section>
  );
}
