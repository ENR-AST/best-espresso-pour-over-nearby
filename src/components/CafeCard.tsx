import type { RankedCoffeeShop } from "../types/coffee";

interface CafeCardProps {
  shop: RankedCoffeeShop;
  onViewDetails: (shop: RankedCoffeeShop) => void;
}

function buildAddress(shop: RankedCoffeeShop): string {
  const parts = [shop.neighborhood, shop.city, shop.zipCode].filter(Boolean);
  return parts.join(", ");
}

export function CafeCard({ shop, onViewDetails }: CafeCardProps) {
  const addressLine = buildAddress(shop);
  const isDiscoveredShop = shop.discoveredByYou || shop.id.startsWith("discovered-");

  return (
    <article className="cafe-card">
      <div className="cafe-header">
        <div>
          <h3 className="cafe-title-row">
            <span>{shop.name}</span>
            {isDiscoveredShop ? (
              <span className="discovered-badge" aria-label="Discovered by you" title="Discovered by you">
                ✓
              </span>
            ) : null}
          </h3>
          <p className="address-line">{addressLine}</p>
        </div>
        <div className="score-pill" aria-label={`Grade ${shop.specialtyScore}`}>
          <span className="score-pill-label">Grade</span>
          <strong>{shop.specialtyScore}</strong>
        </div>
      </div>

      {shop.personalScore !== undefined ? (
        <p className="personal-score-line">Your grade: {shop.personalScore.toFixed(1)} / 10</p>
      ) : null}

      <button className="details-link" onClick={() => onViewDetails(shop)}>
        View more details
      </button>
    </article>
  );
}
