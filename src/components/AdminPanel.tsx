import { useEffect, useState } from "react";
import {
  createCuratedCafe,
  createCuratedMention,
  createCuratedSource,
  listCuratedCafes,
  listCuratedSources,
  type AdminCafeRow,
  type AdminSourceRow
} from "../lib/adminStore";
import type { SourceCategory, Tag } from "../types/coffee";

const sourceCategories: SourceCategory[] = ["editorial", "curated-app", "community", "public-review"];
const tagOptions: Tag[] = ["espresso", "pour-over", "roaster", "specialty"];

function parseList(value: string): string[] {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

interface AdminPanelProps {
  curatedMode: "supabase" | "local";
  onSaved: () => Promise<void>;
}

export function AdminPanel({ curatedMode, onSaved }: AdminPanelProps) {
  const [sources, setSources] = useState<AdminSourceRow[]>([]);
  const [cafes, setCafes] = useState<AdminCafeRow[]>([]);
  const [status, setStatus] = useState("Connect Supabase and use this panel to add sources, cafes, and mentions.");
  const [isBusy, setIsBusy] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  const configuredPasscode = import.meta.env.VITE_ADMIN_PASSCODE;

  const [sourceForm, setSourceForm] = useState({
    id: "",
    name: "",
    category: "editorial" as SourceCategory,
    homeUrl: ""
  });

  const [cafeForm, setCafeForm] = useState({
    name: "",
    city: "",
    neighborhood: "",
    tags: ["specialty"] as Tag[]
  });

  const [mentionForm, setMentionForm] = useState({
    sourceId: "",
    cafeId: "",
    confidence: "0.8",
    evidenceNote: "",
    sourceUrl: "",
    espressoBoost: "",
    pourOverBoost: "",
    roasterBoost: "",
    credibilityBoost: "",
    coffeeFocusBoost: "",
    transparencyBoost: "",
    signalNotes: "",
    avoidNotes: "",
    penaltySignals: ""
  });

  async function refreshAdminData() {
    const [loadedSources, loadedCafes] = await Promise.all([
      listCuratedSources(),
      listCuratedCafes()
    ]);

    setSources(loadedSources);
    setCafes(loadedCafes);
  }

  useEffect(() => {
    if (!configuredPasscode) {
      setStatus("Admin panel is disabled until VITE_ADMIN_PASSCODE is configured.");
      return;
    }

    if (curatedMode !== "supabase") {
      setStatus("Admin panel is ready, but Supabase must be active in this environment before editing.");
      return;
    }

    void (async () => {
      try {
        await refreshAdminData();
        setStatus("Supabase admin panel ready.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not load admin data.");
      }
    })();
  }, [configuredPasscode, curatedMode]);

  async function handleCreateSource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    try {
      await createCuratedSource({
        id: sourceForm.id.trim(),
        name: sourceForm.name.trim(),
        category: sourceForm.category,
        home_url: sourceForm.homeUrl.trim() || null
      });
      await refreshAdminData();
      await onSaved();
      setSourceForm({ id: "", name: "", category: "editorial", homeUrl: "" });
      setStatus("Source saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save source.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleCreateCafe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    try {
      await createCuratedCafe({
        name: cafeForm.name.trim(),
        city: cafeForm.city.trim() || undefined,
        neighborhood: cafeForm.neighborhood.trim() || undefined,
        tags: cafeForm.tags
      });
      await refreshAdminData();
      await onSaved();
      setCafeForm({ name: "", city: "", neighborhood: "", tags: ["specialty"] });
      setStatus("Cafe saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save cafe.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleCreateMention(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    try {
      await createCuratedMention({
        sourceId: mentionForm.sourceId,
        cafeId: Number(mentionForm.cafeId),
        confidence: Number(mentionForm.confidence),
        evidenceNote: mentionForm.evidenceNote.trim(),
        sourceUrl: mentionForm.sourceUrl.trim(),
        espressoBoost: mentionForm.espressoBoost ? Number(mentionForm.espressoBoost) : undefined,
        pourOverBoost: mentionForm.pourOverBoost ? Number(mentionForm.pourOverBoost) : undefined,
        roasterBoost: mentionForm.roasterBoost ? Number(mentionForm.roasterBoost) : undefined,
        credibilityBoost: mentionForm.credibilityBoost ? Number(mentionForm.credibilityBoost) : undefined,
        coffeeFocusBoost: mentionForm.coffeeFocusBoost ? Number(mentionForm.coffeeFocusBoost) : undefined,
        transparencyBoost: mentionForm.transparencyBoost ? Number(mentionForm.transparencyBoost) : undefined,
        signalNotes: parseList(mentionForm.signalNotes),
        avoidNotes: parseList(mentionForm.avoidNotes),
        penaltySignals: parseList(mentionForm.penaltySignals)
      });
      await refreshAdminData();
      await onSaved();
      setMentionForm({
        sourceId: "",
        cafeId: "",
        confidence: "0.8",
        evidenceNote: "",
        sourceUrl: "",
        espressoBoost: "",
        pourOverBoost: "",
        roasterBoost: "",
        credibilityBoost: "",
        coffeeFocusBoost: "",
        transparencyBoost: "",
        signalNotes: "",
        avoidNotes: "",
        penaltySignals: ""
      });
      setStatus("Mention saved. Curated data refreshed.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save mention.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <section id="admin" className="admin-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Admin</p>
          <h2>Simple curated editor</h2>
        </div>
      </div>

      {!configuredPasscode ? (
        <p className="admin-status">Set <code>VITE_ADMIN_PASSCODE</code> in your environment to enable this editor.</p>
      ) : !isUnlocked ? (
        <div className="admin-gate">
          <p className="admin-status">Enter your admin passcode to unlock the editor.</p>
          <div className="admin-gate-row">
            <input
              type="password"
              value={passcodeInput}
              onChange={(event) => setPasscodeInput(event.target.value)}
              placeholder="Admin passcode"
            />
            <button
              className="cta-secondary"
              type="button"
              onClick={() => {
                if (passcodeInput === configuredPasscode) {
                  setIsUnlocked(true);
                  setStatus("Admin unlocked.");
                  return;
                }

                setStatus("Incorrect admin passcode.");
              }}
            >
              Unlock
            </button>
          </div>
        </div>
      ) : (
        <>
      <p className="admin-status">{status}</p>

      <div className="admin-grid">
        <form className="admin-card" onSubmit={handleCreateSource}>
          <h3>Add source</h3>
          <input
            value={sourceForm.id}
            onChange={(event) => setSourceForm((current) => ({ ...current, id: event.target.value }))}
            placeholder="Source id: sprudge"
          />
          <input
            value={sourceForm.name}
            onChange={(event) => setSourceForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Source name"
          />
          <select
            value={sourceForm.category}
            onChange={(event) => setSourceForm((current) => ({ ...current, category: event.target.value as SourceCategory }))}
          >
            {sourceCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <input
            value={sourceForm.homeUrl}
            onChange={(event) => setSourceForm((current) => ({ ...current, homeUrl: event.target.value }))}
            placeholder="Home URL"
          />
          <button className="cta-secondary" disabled={isBusy} type="submit">Save source</button>
        </form>

        <form className="admin-card" onSubmit={handleCreateCafe}>
          <h3>Add cafe</h3>
          <input
            value={cafeForm.name}
            onChange={(event) => setCafeForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Cafe name"
          />
          <input
            value={cafeForm.city}
            onChange={(event) => setCafeForm((current) => ({ ...current, city: event.target.value }))}
            placeholder="City"
          />
          <input
            value={cafeForm.neighborhood}
            onChange={(event) => setCafeForm((current) => ({ ...current, neighborhood: event.target.value }))}
            placeholder="Neighborhood"
          />
          <label className="admin-label">Tags</label>
          <div className="admin-chip-row">
            {tagOptions.map((tag) => {
              const active = cafeForm.tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  className={active ? "filter-chip active" : "filter-chip"}
                  onClick={() =>
                    setCafeForm((current) => ({
                      ...current,
                      tags: active
                        ? current.tags.filter((item) => item !== tag)
                        : [...current.tags, tag]
                    }))
                  }
                >
                  {tag}
                </button>
              );
            })}
          </div>
          <button className="cta-secondary" disabled={isBusy} type="submit">Save cafe</button>
        </form>

        <form className="admin-card admin-card-wide" onSubmit={handleCreateMention}>
          <h3>Add source mention</h3>
          <select
            value={mentionForm.sourceId}
            onChange={(event) => setMentionForm((current) => ({ ...current, sourceId: event.target.value }))}
          >
            <option value="">Select source</option>
            {sources.map((source) => (
              <option key={source.id} value={source.id}>{source.name}</option>
            ))}
          </select>
          <select
            value={mentionForm.cafeId}
            onChange={(event) => setMentionForm((current) => ({ ...current, cafeId: event.target.value }))}
          >
            <option value="">Select cafe</option>
            {cafes.map((cafe) => (
              <option key={cafe.id} value={cafe.id}>{cafe.name}{cafe.city ? ` - ${cafe.city}` : ""}</option>
            ))}
          </select>
          <input
            value={mentionForm.confidence}
            onChange={(event) => setMentionForm((current) => ({ ...current, confidence: event.target.value }))}
            placeholder="Confidence: 0.8"
          />
          <input
            value={mentionForm.sourceUrl}
            onChange={(event) => setMentionForm((current) => ({ ...current, sourceUrl: event.target.value }))}
            placeholder="Article or source URL"
          />
          <textarea
            value={mentionForm.evidenceNote}
            onChange={(event) => setMentionForm((current) => ({ ...current, evidenceNote: event.target.value }))}
            placeholder="Evidence note"
            rows={3}
          />
          <div className="admin-two-col">
            <input value={mentionForm.espressoBoost} onChange={(event) => setMentionForm((current) => ({ ...current, espressoBoost: event.target.value }))} placeholder="Espresso boost" />
            <input value={mentionForm.pourOverBoost} onChange={(event) => setMentionForm((current) => ({ ...current, pourOverBoost: event.target.value }))} placeholder="Pour-over boost" />
            <input value={mentionForm.roasterBoost} onChange={(event) => setMentionForm((current) => ({ ...current, roasterBoost: event.target.value }))} placeholder="Roaster boost" />
            <input value={mentionForm.credibilityBoost} onChange={(event) => setMentionForm((current) => ({ ...current, credibilityBoost: event.target.value }))} placeholder="Credibility boost" />
            <input value={mentionForm.coffeeFocusBoost} onChange={(event) => setMentionForm((current) => ({ ...current, coffeeFocusBoost: event.target.value }))} placeholder="Coffee-focus boost" />
            <input value={mentionForm.transparencyBoost} onChange={(event) => setMentionForm((current) => ({ ...current, transparencyBoost: event.target.value }))} placeholder="Transparency boost" />
          </div>
          <input
            value={mentionForm.signalNotes}
            onChange={(event) => setMentionForm((current) => ({ ...current, signalNotes: event.target.value }))}
            placeholder="Signal notes, comma separated"
          />
          <input
            value={mentionForm.avoidNotes}
            onChange={(event) => setMentionForm((current) => ({ ...current, avoidNotes: event.target.value }))}
            placeholder="Avoid notes, comma separated"
          />
          <input
            value={mentionForm.penaltySignals}
            onChange={(event) => setMentionForm((current) => ({ ...current, penaltySignals: event.target.value }))}
            placeholder="Penalty signals, comma separated"
          />
          <button className="cta-secondary" disabled={isBusy} type="submit">Save mention</button>
        </form>
      </div>
        </>
      )}
    </section>
  );
}
