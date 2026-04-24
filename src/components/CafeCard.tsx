import type { RankedCoffeeShop } from "../types/coffee";

interface CafeCardProps {
  shop: RankedCoffeeShop;
  onViewDetails: (shop: RankedCoffeeShop) => void;
}

function getYourRank(shop: RankedCoffeeShop): number | null {
  if (shop.ownerRank !== undefined) {
    return Number(shop.ownerRank.toFixed(0));
  }

  const noteMatch = shop.signalNotes?.find((note) => /your overall rank is/i.test(note));
  if (!noteMatch) {
    return null;
  }

  const match100 = noteMatch.match(/(\d+(?:\.\d+)?)\/100/);
  if (match100) {
    return Number(match100[1]);
  }

  const match10 = noteMatch.match(/(\d+(?:\.\d+)?)\/10/);
  if (match10) {
    return Number(match10[1]) * 10;
  }

  return null;
}

function buildAddress(shop: RankedCoffeeShop): string {
  const parts = [shop.streetAddress, shop.city, shop.state].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(", ");
  }

  const fallbackParts = [shop.neighborhood, shop.city, shop.zipCode].filter(Boolean);
  if (fallbackParts.length > 0) {
    return fallbackParts.join(", ");
  }

  const finalFallback = [shop.city, shop.state].filter(Boolean);
  if (finalFallback.length > 0) {
    return finalFallback.join(", ");
  }

  return "Address unavailable";
}

export function CafeCard({ shop, onViewDetails }: CafeCardProps) {
  const addressLine = buildAddress(shop);
  const isDiscoveredShop = shop.discoveredByYou || shop.id.startsWith("discovered-");
  const yourRank = getYourRank(shop);

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
        <div className="score-pill" aria-label={`Rank ${shop.specialtyScore}`}>
          <span className="score-pill-label">Rank</span>
          <strong>{shop.specialtyScore}</strong>
        </div>
      </div>

      {yourRank !== null ? <p className="personal-score-line">From your admin rank</p> : null}

      <button className="details-link compact" onClick={() => onViewDetails(shop)}>
        View more details
      </button>
    </article>
  );
}
