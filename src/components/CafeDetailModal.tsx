import type { RankedCoffeeShop } from "../types/coffee";

interface CafeDetailModalProps {
  shop: RankedCoffeeShop | null;
  onClose: () => void;
}

export function CafeDetailModal({ shop, onClose }: CafeDetailModalProps) {
  if (!shop) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Cafe detail</p>
            <h2>{shop.name}</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="detail-grid">
          <section>
            <h3>Why this is a specialty pick</h3>
            <p>{shop.whyRecommended}</p>
            <ul className="score-breakdown">
              <li>Specialty score: {shop.specialtyScore}</li>
              <li>Espresso evidence: {shop.espressoEvidence}/10</li>
              <li>Pour-over evidence: {shop.pourOverEvidence}/10</li>
              <li>Roaster program: {shop.roasterProgram}/10</li>
              <li>Credibility signals: {shop.credibilitySignals}/10</li>
            </ul>
            {shop.signalNotes && shop.signalNotes.length > 0 ? (
              <>
                <h3>Coffee-first signals</h3>
                <ul className="score-breakdown">
                  {shop.signalNotes.map((signal) => (
                    <li key={signal}>{signal}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>

          <section>
            <h3>Evidence and sources</h3>
            <div className="evidence-list">
              {shop.sources.map((source) => (
                <a
                  key={`${shop.id}-${source.source}-${source.note}`}
                  className="evidence-card"
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <strong>{source.source}</strong>
                  <span>{source.category}</span>
                  <p>{source.note}</p>
                </a>
              ))}
            </div>
          </section>
        </div>

        <div className="external-links">
          {shop.externalLinks.map((link) => (
            <a key={`${link.label}-${link.url}`} href={link.url} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
