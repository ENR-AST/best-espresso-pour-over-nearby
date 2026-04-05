import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import type { RankedCoffeeShop, SearchLocation } from "../types/coffee";

interface MapCardRailProps {
  shops: RankedCoffeeShop[];
  location: SearchLocation;
}

function RecenterMap({ location }: { location: SearchLocation }) {
  const map = useMap();
  map.setView([location.latitude, location.longitude], map.getZoom(), {
    animate: true
  });
  return null;
}

export function MapCardRail({ shops, location }: MapCardRailProps) {
  const visibleShops = shops.slice(0, 12);

  return (
    <section className="map-panel">
      <div className="map-placeholder live">
        <p className="eyebrow">Live map</p>
        <h2>See top specialty picks around your search area.</h2>
        <p>The map centers on the result area and plots the highest-ranked nearby cafes.</p>
      </div>

      <div className="leaflet-shell">
        <MapContainer
          center={[location.latitude, location.longitude]}
          zoom={13}
          scrollWheelZoom={true}
          className="leaflet-map"
        >
          <RecenterMap location={location} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <CircleMarker
            center={[location.latitude, location.longitude]}
            radius={10}
            pathOptions={{ color: "#a44a2b", fillColor: "#a44a2b", fillOpacity: 0.95 }}
          >
            <Popup>Result area center</Popup>
          </CircleMarker>

          {visibleShops.map((shop) => (
            <CircleMarker
              key={shop.id}
              center={[shop.latitude, shop.longitude]}
              radius={Math.max(7, Math.min(12, Math.round(shop.specialtyScore / 10)))}
              pathOptions={{ color: "#606848", fillColor: "#606848", fillOpacity: 0.7 }}
            >
              <Popup>
                <strong>{shop.name}</strong>
                <br />
                Score: {shop.specialtyScore}
                <br />
                {shop.distanceMiles.toFixed(1)} mi away
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="map-rail">
        {visibleShops.slice(0, 5).map((shop) => (
          <div key={shop.id} className="mini-map-card">
            <strong>{shop.name}</strong>
            <span>{shop.distanceMiles.toFixed(1)} mi away</span>
            <span>{shop.specialtyScore} specialty score</span>
          </div>
        ))}
      </div>
    </section>
  );
}
