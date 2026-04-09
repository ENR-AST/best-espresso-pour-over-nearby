import { useEffect, useState } from "react";
import type { DiscoveredShopDraft, PersonalReview, RankedCoffeeShop, Tag } from "../types/coffee";

interface CafeDetailModalProps {
  shop: RankedCoffeeShop | null;
  personalReview?: PersonalReview;
  onSavePersonalReview: (review: PersonalReview) => void;
  onAddDiscoveredShop: (draft: DiscoveredShopDraft) => void;
  onClose: () => void;
}

interface ReviewFormState {
  overallScore: string;
  espressoScore: string;
  pourOverScore: string;
  beanTransparencyScore: string;
  menuFocusScore: string;
  serviceScore: string;
  ambianceScore: string;
  wouldReturn: boolean;
  notes: string;
}

interface DiscoveredFormState extends ReviewFormState {
  name: string;
  city: string;
  neighborhood: string;
  zipCode: string;
  website: string;
  tags: Tag[];
}

const defaultForm: ReviewFormState = {
  overallScore: "8",
  espressoScore: "8",
  pourOverScore: "8",
  beanTransparencyScore: "8",
  menuFocusScore: "8",
  serviceScore: "8",
  ambianceScore: "8",
  wouldReturn: true,
  notes: ""
};

const defaultDiscoveredTags: Tag[] = ["espresso", "specialty"];

export function CafeDetailModal({ shop, personalReview, onSavePersonalReview, onAddDiscoveredShop, onClose }: CafeDetailModalProps) {
  const [form, setForm] = useState<ReviewFormState>(defaultForm);
  const [showDiscoveredForm, setShowDiscoveredForm] = useState(false);
  const [discoveredForm, setDiscoveredForm] = useState<DiscoveredFormState>({
    name: "",
    city: "",
    neighborhood: "",
    zipCode: "",
    website: "",
    tags: defaultDiscoveredTags,
    ...defaultForm
  });

  useEffect(() => {
    if (!personalReview) {
      setForm(defaultForm);
    } else {
      const fallbackOverallScore = (
        personalReview.espressoScore +
        personalReview.pourOverScore +
        personalReview.beanTransparencyScore +
        personalReview.menuFocusScore +
        personalReview.serviceScore +
        personalReview.ambianceScore
      ) / 6;

      setForm({
        overallScore: String(personalReview.overallScore ?? Number(fallbackOverallScore.toFixed(1))),
        espressoScore: String(personalReview.espressoScore),
        pourOverScore: String(personalReview.pourOverScore),
        beanTransparencyScore: String(personalReview.beanTransparencyScore),
        menuFocusScore: String(personalReview.menuFocusScore),
        serviceScore: String(personalReview.serviceScore),
        ambianceScore: String(personalReview.ambianceScore),
        wouldReturn: personalReview.wouldReturn,
        notes: personalReview.notes
      });
    }

    setShowDiscoveredForm(false);
    setDiscoveredForm({
      name: "",
      city: shop?.city ?? "",
      neighborhood: shop?.neighborhood ?? "",
      zipCode: shop?.zipCode ?? "",
      website: "",
      tags: defaultDiscoveredTags,
      ...defaultForm
    });
  }, [personalReview, shop?.id]);

  if (!shop) {
    return null;
  }

  const activeShop = shop;

  function saveReview() {
    const review: PersonalReview = {
      shopId: activeShop.id,
      overallScore: Number(form.overallScore),
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

  function toggleDiscoveredTag(tag: Tag) {
    setDiscoveredForm((current) => ({
      ...current,
      tags: current.tags.includes(tag)
        ? current.tags.filter((item) => item !== tag)
        : [...current.tags, tag]
    }));
  }

  function saveDiscoveredShop() {
    if (!discoveredForm.name.trim()) {
      return;
    }

    onAddDiscoveredShop({
      name: discoveredForm.name.trim(),
      city: discoveredForm.city.trim(),
      neighborhood: discoveredForm.neighborhood.trim(),
      zipCode: discoveredForm.zipCode.trim(),
      website: discoveredForm.website.trim(),
      tags: discoveredForm.tags.length > 0 ? discoveredForm.tags : defaultDiscoveredTags,
      overallScore: Number(discoveredForm.overallScore),
      espressoScore: Number(discoveredForm.espressoScore),
      pourOverScore: Number(discoveredForm.pourOverScore),
      beanTransparencyScore: Number(discoveredForm.beanTransparencyScore),
      menuFocusScore: Number(discoveredForm.menuFocusScore),
      serviceScore: Number(discoveredForm.serviceScore),
      ambianceScore: Number(discoveredForm.ambianceScore),
      wouldReturn: discoveredForm.wouldReturn,
      notes: discoveredForm.notes.trim()
    });
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
                Your rank
                <input type="number" min="1" max="10" value={form.overallScore} onChange={(event) => setForm((current) => ({ ...current, overallScore: event.target.value }))} />
              </label>
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

            <div className="discovered-shop-panel">
              <div className="discovered-shop-header">
                <div>
                  <h3>Add a coffee shop you discovered</h3>
                  <p className="admin-status">Use this if you found a place that is missing from the current list.</p>
                </div>
                <button className="action-button" type="button" onClick={() => setShowDiscoveredForm((current) => !current)}>
                  {showDiscoveredForm ? "Hide form" : "Add discovered shop"}
                </button>
              </div>

              {showDiscoveredForm ? (
                <div className="review-grid discovered-grid">
                  <label>
                    Your rank
                    <input type="number" min="1" max="10" value={discoveredForm.overallScore} onChange={(event) => setDiscoveredForm((current) => ({ ...current, overallScore: event.target.value }))} />
                  </label>
                  <label>
                    Shop name
                    <input value={discoveredForm.name} onChange={(event) => setDiscoveredForm((current) => ({ ...current, name: event.target.value }))} />
                  </label>
                  <label>
                    City
                    <input value={discoveredForm.city} onChange={(event) => setDiscoveredForm((current) => ({ ...current, city: event.target.value }))} />
                  </label>
                  <label>
                    Neighborhood
                    <input value={discoveredForm.neighborhood} onChange={(event) => setDiscoveredForm((current) => ({ ...current, neighborhood: event.target.value }))} />
                  </label>
                  <label>
                    ZIP code
                    <input value={discoveredForm.zipCode} onChange={(event) => setDiscoveredForm((current) => ({ ...current, zipCode: event.target.value }))} />
                  </label>
                  <label className="review-grid-wide">
                    Website
                    <input value={discoveredForm.website} onChange={(event) => setDiscoveredForm((current) => ({ ...current, website: event.target.value }))} placeholder="https://..." />
                  </label>
                  <div className="review-grid-wide">
                    <span className="admin-label">Tags</span>
                    <div className="admin-chip-row">
                      {(["espresso", "pour-over", "roaster", "specialty"] as Tag[]).map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className={discoveredForm.tags.includes(tag) ? "filter-chip active" : "filter-chip"}
                          onClick={() => toggleDiscoveredTag(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label>
                    Espresso
                    <input type="number" min="1" max="10" value={discoveredForm.espressoScore} onChange={(event) => setDiscoveredForm((current) => ({ ...current, espressoScore: event.target.value }))} />
                  </label>
                  <label>
                    Pour-over
                    <input type="number" min="1" max="10" value={discoveredForm.pourOverScore} onChange={(event) => setDiscoveredForm((current) => ({ ...current, pourOverScore: event.target.value }))} />
                  </label>
                  <label>
                    Bean transparency
                    <input type="number" min="1" max="10" value={discoveredForm.beanTransparencyScore} onChange={(event) => setDiscoveredForm((current) => ({ ...current, beanTransparencyScore: event.target.value }))} />
                  </label>
                  <label>
                    Menu focus
                    <input type="number" min="1" max="10" value={discoveredForm.menuFocusScore} onChange={(event) => setDiscoveredForm((current) => ({ ...current, menuFocusScore: event.target.value }))} />
                  </label>
                  <label>
                    Service
                    <input type="number" min="1" max="10" value={discoveredForm.serviceScore} onChange={(event) => setDiscoveredForm((current) => ({ ...current, serviceScore: event.target.value }))} />
                  </label>
                  <label>
                    Ambiance
                    <input type="number" min="1" max="10" value={discoveredForm.ambianceScore} onChange={(event) => setDiscoveredForm((current) => ({ ...current, ambianceScore: event.target.value }))} />
                  </label>
                  <label className="review-toggle review-grid-wide">
                    <input type="checkbox" checked={discoveredForm.wouldReturn} onChange={(event) => setDiscoveredForm((current) => ({ ...current, wouldReturn: event.target.checked }))} />
                    I would return
                  </label>
                  <textarea
                    className="review-notes review-grid-wide"
                    rows={4}
                    value={discoveredForm.notes}
                    onChange={(event) => setDiscoveredForm((current) => ({ ...current, notes: event.target.value }))}
                    placeholder="Your first notes about this discovered shop"
                  />
                  <button className="cta-secondary review-save-button review-grid-wide" type="button" onClick={saveDiscoveredShop}>
                    Save discovered shop
                  </button>
                </div>
              ) : null}
            </div>
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
