import type { SearchLocation, SearchMode } from "../types/coffee";

interface LocationPanelProps {
  locationInput: string;
  onInputChange: (value: string) => void;
  onUseMyLocation: () => void;
  onSearch: () => void;
  onReset: () => void;
  onSelectMode: (value: SearchMode) => void;
  searchMode: SearchMode;
  location: SearchLocation;
  geoStatus: string;
  logoSrc: string;
  isLoading: boolean;
}

export function LocationPanel({
  locationInput,
  onInputChange,
  onUseMyLocation,
  onSearch,
  onReset,
  onSelectMode,
  searchMode,
  location,
  geoStatus,
  logoSrc,
  isLoading
}: LocationPanelProps) {
  const placeholder = searchMode === "zip" ? "Enter a 5-digit ZIP code" : "Enter a city or neighborhood";

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
        <div className="mode-grid">
          <button className="action-button primary" onClick={onUseMyLocation} disabled={isLoading}>
            {isLoading ? "Finding coffee..." : "Use my location"}
          </button>
          <button className={searchMode === "city" ? "action-button active" : "action-button"} onClick={() => onSelectMode("city")} type="button">
            City name
          </button>
          <button className={searchMode === "zip" ? "action-button active" : "action-button"} onClick={() => onSelectMode("zip")} type="button">
            Zip code
          </button>
          <button className="action-button reset" onClick={onReset} type="button">
            Reset
          </button>
        </div>

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
