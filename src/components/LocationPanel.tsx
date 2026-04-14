import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, TileLayer, useMap } from "react-leaflet";
import type { RankedCoffeeShop, SearchLocation, SearchMode } from "../types/coffee";

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
  previewShops: RankedCoffeeShop[];
}

function RecenterPreviewMap({ location }: { location: SearchLocation }) {
  const map = useMap();
  map.setView([location.latitude, location.longitude], map.getZoom(), { animate: true });
  return null;
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
  savedCities,
  previewShops
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

        <div className="nav-links">
          <a href="#results">Results</a>
          <a href="#method">Method</a>
          <a href="#about">About</a>
        </div>
      </nav>

      <div className="hero-layout hero-layout-balanced">
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

        <div className="hero-map-card">
          <div className="hero-map-heading">
            <p className="eyebrow">Map preview</p>
            <strong>{location.label}</strong>
          </div>
          <div className="leaflet-shell hero-map-shell">
            <MapContainer
              center={[location.latitude, location.longitude]}
              zoom={12}
              scrollWheelZoom={false}
              dragging={true}
              className="hero-leaflet-map"
            >
              <RecenterPreviewMap location={location} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <CircleMarker
                center={[location.latitude, location.longitude]}
                radius={8}
                pathOptions={{ color: "#a44a2b", fillColor: "#a44a2b", fillOpacity: 0.95 }}
              />
              {previewShops.map((shop) => (
                <CircleMarker
                  key={shop.id}
                  center={[shop.latitude, shop.longitude]}
                  radius={7}
                  pathOptions={{ color: "#606848", fillColor: "#606848", fillOpacity: 0.75 }}
                />
              ))}
            </MapContainer>
          </div>
          <div className="hero-map-list">
            {previewShops.slice(0, 3).map((shop) => (
              <div key={shop.id} className="hero-map-list-item">
                <strong>{shop.name}</strong>
                <span>{shop.distanceMiles.toFixed(1)} mi</span>
              </div>
            ))}
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
      </div>
    </section>
  );
}
