import { useEffect, useState } from "react";
import type { PersonalReview, RankedCoffeeShop } from "../types/coffee";

interface CafeDetailModalProps {
  shop: RankedCoffeeShop | null;
  personalReview?: PersonalReview;
  onSavePersonalReview: (review: PersonalReview) => void;
  onClose: () => void;
}

interface ReviewFormState {
  espressoScore: string;
  pourOverScore: string;
  beanTransparencyScore: string;
  menuFocusScore: string;
  serviceScore: string;
  ambianceScore: string;
  wouldReturn: boolean;
  notes: string;
}

const defaultForm: ReviewFormState = {
  espressoScore: "8",
  pourOverScore: "8",
  beanTransparencyScore: "8",
  menuFocusScore: "8",
  serviceScore: "8",
  ambianceScore: "8",
  wouldReturn: true,
  notes: ""
};

export function CafeDetailModal({ shop, personalReview, onSavePersonalReview, onClose }: CafeDetailModalProps) {
  const [form, setForm] = useState<ReviewFormState>(defaultForm);

  useEffect(() => {
    if (!personalReview) {
      setForm(defaultForm);
      return;
    }

    setForm({
      espressoScore: String(personalReview.espressoScore),
      pourOverScore: String(personalReview.pourOverScore),
      beanTransparencyScore: String(personalReview.beanTransparencyScore),
      menuFocusScore: String(personalReview.menuFocusScore),
      serviceScore: String(personalReview.serviceScore),
      ambianceScore: String(personalReview.ambianceScore),
      wouldReturn: personalReview.wouldReturn,
      notes: personalReview.notes
    });
  }, [personalReview, shop?.id]);

  if (!shop) {
    return null;
  }

  const activeShop = shop;

  function saveReview() {
    const review: PersonalReview = {
      shopId: activeShop.id,
      espressoScore: Number(form.espressoScore),
      pourOverScore: Number(form.pourOverScore),
      beanTransparencyScore: Number(form.beanTransparencyScore),
      menuFocusScore: Number(form.menuFocusScore),
      serviceScore: Number(form.serviceScore),
      ambianceScore: Number(form.ambianceScore),
      wouldReturn: form.wouldReturn,
      notes: form.notes.trim(),
      updatedAt: new Date().toISOString()
    };

    onSavePersonalReview(review);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Cafe detail</p>
            <h2>{activeShop.name}</h2>
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
              <li>Ranking score: {activeShop.specialtyScore}</li>
              {activeShop.personalScore !== undefined ? <li>Your score: {activeShop.personalScore.toFixed(1)}/10</li> : null}
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
            <h3>Your grading</h3>
            <p className="admin-status">Your personal grading now has strong weight in the ranking for reviewed cafes.</p>
            <div className="review-grid">
              <label>
                Espresso
                <input type="number" min="1" max="10" value={form.espressoScore} onChange={(event) => setForm((current) => ({ ...current, espressoScore: event.target.value }))} />
              </label>
              <label>
                Pour-over
                <input type="number" min="1" max="10" value={form.pourOverScore} onChange={(event) => setForm((current) => ({ ...current, pourOverScore: event.target.value }))} />
              </label>
              <label>
                Bean transparency
                <input type="number" min="1" max="10" value={form.beanTransparencyScore} onChange={(event) => setForm((current) => ({ ...current, beanTransparencyScore: event.target.value }))} />
              </label>
              <label>
                Menu focus
                <input type="number" min="1" max="10" value={form.menuFocusScore} onChange={(event) => setForm((current) => ({ ...current, menuFocusScore: event.target.value }))} />
              </label>
              <label>
                Service
                <input type="number" min="1" max="10" value={form.serviceScore} onChange={(event) => setForm((current) => ({ ...current, serviceScore: event.target.value }))} />
              </label>
              <label>
                Ambiance
                <input type="number" min="1" max="10" value={form.ambianceScore} onChange={(event) => setForm((current) => ({ ...current, ambianceScore: event.target.value }))} />
              </label>
            </div>
            <label className="review-toggle">
              <input type="checkbox" checked={form.wouldReturn} onChange={(event) => setForm((current) => ({ ...current, wouldReturn: event.target.checked }))} />
              I would return
            </label>
            <textarea
              className="review-notes"
              rows={4}
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Notes about the coffee, menu, service, or anything you want to remember"
            />
            <button className="cta-secondary review-save-button" type="button" onClick={saveReview}>
              Save my grading
            </button>
          </section>
        </div>

        <section>
          <h3>Evidence and sources</h3>
          <div className="evidence-list">
            {shop.sources.map((source) => (
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
