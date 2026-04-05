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
  const shortWhy = shop.whyRecommended.length > 100
    ? `${shop.whyRecommended.slice(0, 97)}...`
    : shop.whyRecommended;

  const addressLine = buildAddress(shop);

  return (
    <article className="cafe-card">
      <div className="cafe-header">
        <div>
          <h3>{shop.name}</h3>
          <p className="address-line">{addressLine}</p>
        </div>
        <div className="score-pill">{shop.specialtyScore}</div>
      </div>

      <div className="metric-row simple-metrics">
        <span>{shop.distanceMiles.toFixed(1)} mi</span>
        <span>{shop.openNow ? "Open now" : "Closed now"}</span>
      </div>

      <p className="why-copy short">{shortWhy}</p>

      <div className="support-row compact-support">
        {shop.supportLabels.slice(0, 1).map((label) => (
          <span key={label} className="support-badge">
            {label}
          </span>
        ))}
        {shop.sources.slice(0, 1).map((source) => (
          <a key={source.source} href={source.url} target="_blank" rel="noreferrer" className="source-badge">
            {source.source}
          </a>
        ))}
      </div>

      <button className="details-link" onClick={() => onViewDetails(shop)}>
        View details
      </button>
    </article>
  );
}
