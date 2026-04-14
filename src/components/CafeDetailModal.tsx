import { useEffect, useState } from "react";
import type { DiscoveredShopDraft, PersonalReview, RankedCoffeeShop } from "../types/coffee";

interface CafeDetailModalProps {
  shop: RankedCoffeeShop | null;
  personalReview?: PersonalReview;
  onSavePersonalReview: (review: PersonalReview) => void;
  onAddDiscoveredShop: (draft: DiscoveredShopDraft) => void;
  onClose: () => void;
}

export function CafeDetailModal({ shop, personalReview, onSavePersonalReview, onAddDiscoveredShop, onClose }: CafeDetailModalProps) {
  useEffect(() => {
  }, [personalReview, shop?.id]);

  if (!shop) {
    return null;
  }

  const activeShop = shop;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Cafe detail</p>
            <h2>{activeShop.name || "Coffee shop"}</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="detail-grid">
          <section>
            <h3>Why this is a specialty pick</h3>
            <p>{activeShop.whyRecommended}</p>
            <ul className="score-breakdown">
              <li>Final rank: {activeShop.specialtyScore}/100</li>
              {activeShop.ownerRank !== undefined ? <li>Source: your admin rank</li> : null}
              <li>Espresso evidence: {activeShop.espressoEvidence}/10</li>
              <li>Pour-over evidence: {activeShop.pourOverEvidence}/10</li>
              <li>Roaster program: {activeShop.roasterProgram}/10</li>
              <li>Credibility signals: {activeShop.credibilitySignals}/10</li>
            </ul>
            {activeShop.signalNotes && activeShop.signalNotes.length > 0 ? (
              <>
                <h3>Coffee-first signals</h3>
                <ul className="score-breakdown">
                  {activeShop.signalNotes.map((signal) => (
                    <li key={signal}>{signal}</li>
                  ))}
                </ul>
              </>
            ) : null}
            {activeShop.penaltySignals && activeShop.penaltySignals.length > 0 ? (
              <>
                <h3>Generic-cafe warnings</h3>
                <ul className="score-breakdown">
                  {activeShop.penaltySignals.map((signal) => (
                    <li key={signal}>{signal}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>

          <section>
            <h3>About this place</h3>
            <ul className="score-breakdown">
              <li>Address: {[activeShop.streetAddress, activeShop.city, activeShop.state].filter(Boolean).join(", ") || "Address unavailable"}</li>
              {activeShop.zipCode ? <li>ZIP code: {activeShop.zipCode}</li> : null}
              <li>Distance: {activeShop.distanceMiles.toFixed(1)} miles</li>
              {activeShop.openNow ? <li>Currently marked open</li> : <li>Open status unavailable</li>}
            </ul>
            <p className="admin-status">Coffee ranking is managed from the Admin side with one overall rank from 1 to 100.</p>
          </section>
        </div>

        <section>
          <h3>Evidence and sources</h3>
          <div className="evidence-list">
            {activeShop.sources.map((source) => (
              <a
                key={`${activeShop.id}-${source.source}-${source.note}`}
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

        <div className="external-links">
          {activeShop.externalLinks.map((link) => (
            <a key={`${link.label}-${link.url}`} href={link.url} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
