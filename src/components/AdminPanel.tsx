import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  createPersonalCafe,
  listPersonalCafes,
  sendAdminMagicLink,
  signOutAdmin,
  updatePersonalCafe,
  type AdminPersonalCafeRow
} from "../lib/adminStore";
import { getSupabaseSession, onSupabaseAuthStateChange } from "../lib/supabaseClient";
import type { Tag } from "../types/coffee";

const tagOptions: Tag[] = ["espresso", "pour-over", "roaster", "specialty"];

function parseAdminAllowlist(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

interface AdminPanelProps {
  curatedMode: "supabase" | "local";
  onSaved: () => Promise<void>;
}

export function AdminPanel({ curatedMode, onSaved }: AdminPanelProps) {
  const [cafes, setCafes] = useState<AdminPersonalCafeRow[]>([]);
  const [status, setStatus] = useState("Connect Supabase and use this panel to add missing coffee shops.");
  const [isBusy, setIsBusy] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authEmailInput, setAuthEmailInput] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const configuredPasscode = import.meta.env.VITE_ADMIN_PASSCODE;
  const adminAllowlist = useMemo(
    () => parseAdminAllowlist(import.meta.env.VITE_ADMIN_EMAIL_ALLOWLIST),
    []
  );
  const useEmailAuth = adminAllowlist.length > 0;
  const signedInEmail = session?.user?.email?.toLowerCase() ?? "";
  const isAuthorizedEmail = useEmailAuth && signedInEmail ? adminAllowlist.includes(signedInEmail) : false;
  const canEdit = useEmailAuth ? isAuthorizedEmail : Boolean(configuredPasscode && isUnlocked);

  const [cafeForm, setCafeForm] = useState({
    id: null as number | null,
    name: "",
    streetAddress: "",
    city: "",
    state: "",
    neighborhood: "",
    zipCode: "",
    overallScore: "80",
    tags: ["specialty"] as Tag[]
  });

  async function refreshAdminData() {
    const loadedCafes = await listPersonalCafes();
    setCafes(loadedCafes);
  }

  useEffect(() => {
    if (!useEmailAuth) {
      setAuthReady(true);
      return;
    }

    let isMounted = true;
    void (async () => {
      try {
        const activeSession = await getSupabaseSession();
        if (isMounted) {
          setSession(activeSession);
        }
      } catch (error) {
        if (isMounted) {
          setStatus(error instanceof Error ? error.message : "Could not read admin session.");
        }
      } finally {
        if (isMounted) {
          setAuthReady(true);
        }
      }
    })();

    const subscription = onSupabaseAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [useEmailAuth]);

  useEffect(() => {
    if (useEmailAuth && !authReady) {
      setStatus("Checking admin session...");
      return;
    }

    if (!useEmailAuth && !configuredPasscode) {
      setStatus("Admin panel is disabled until VITE_ADMIN_PASSCODE or VITE_ADMIN_EMAIL_ALLOWLIST is configured.");
      return;
    }

    if (curatedMode !== "supabase") {
      setStatus("Admin panel is ready, but Supabase must be active in this environment before editing.");
      return;
    }

    if (useEmailAuth && !session) {
      setStatus("Sign in with your admin email to unlock the editor.");
      return;
    }

    if (useEmailAuth && session && !isAuthorizedEmail) {
      setStatus(`Signed in as ${session.user.email}, but that email is not on the admin allowlist.`);
      return;
    }

    if (!canEdit) {
      setStatus("Enter your admin passcode to unlock the editor.");
      return;
    }

    void (async () => {
      try {
        await refreshAdminData();
        setStatus(useEmailAuth ? `Admin unlocked for ${session?.user.email}.` : "Supabase admin panel ready.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not load admin data.");
      }
    })();
  }, [authReady, canEdit, configuredPasscode, curatedMode, isAuthorizedEmail, session, useEmailAuth]);

  async function handleCreateCafe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    try {
      const payload = {
        name: cafeForm.name.trim(),
        streetAddress: cafeForm.streetAddress.trim(),
        city: cafeForm.city.trim() || undefined,
        state: cafeForm.state.trim() || undefined,
        neighborhood: cafeForm.neighborhood.trim() || undefined,
        zipCode: cafeForm.zipCode.trim() || undefined,
        overallScore: Number(cafeForm.overallScore),
        tags: cafeForm.tags
      };

      if (cafeForm.id !== null) {
        await updatePersonalCafe(cafeForm.id, payload);
      } else {
        await createPersonalCafe(payload);
      }
      await refreshAdminData();
      await onSaved();
      setCafeForm({ id: null, name: "", streetAddress: "", city: "", state: "", neighborhood: "", zipCode: "", overallScore: "80", tags: ["specialty"] });
      setStatus(cafeForm.id !== null ? "Coffee shop updated." : "Coffee shop saved and added to Your list.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save cafe.");
    } finally {
      setIsBusy(false);
    }
  }

  function handleEditCafe(cafe: AdminPersonalCafeRow) {
    setCafeForm({
      id: cafe.id,
      name: cafe.name,
      streetAddress: cafe.street_address ?? "",
      city: cafe.city ?? "",
      state: cafe.state ?? "",
      neighborhood: cafe.neighborhood ?? "",
      zipCode: cafe.zip_code ?? "",
      overallScore: String(cafe.owner_rank ?? 80),
      tags: cafe.tags?.length ? cafe.tags : ["specialty"]
    });
    setStatus(`Editing ${cafe.name}. Update the fields and save again.`);
  }

  function handleCancelEdit() {
    setCafeForm({ id: null, name: "", streetAddress: "", city: "", state: "", neighborhood: "", zipCode: "", overallScore: "80", tags: ["specialty"] });
    setStatus("Edit cancelled.");
  }

  async function handleSendMagicLink() {
    const email = authEmailInput.trim().toLowerCase();
    if (!email) {
      setStatus("Enter your admin email first.");
      return;
    }

    setIsBusy(true);
    try {
      await sendAdminMagicLink(email);
      setStatus(`Magic link sent to ${email}. Open it in this browser to unlock admin.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not send magic link.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSignOut() {
    setIsBusy(true);
    try {
      await signOutAdmin();
      setStatus("Signed out of admin.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not sign out.");
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

      {useEmailAuth ? (
        !authReady ? (
          <p className="admin-status">Checking admin session...</p>
        ) : !session ? (
          <div className="admin-gate">
            <p className="admin-status">Sign in with an approved admin email to unlock the editor.</p>
            <div className="admin-gate-row">
              <input
                type="email"
                value={authEmailInput}
                onChange={(event) => setAuthEmailInput(event.target.value)}
                placeholder="Admin email"
              />
              <button className="cta-secondary" disabled={isBusy} type="button" onClick={handleSendMagicLink}>
                {isBusy ? "Sending..." : "Send magic link"}
              </button>
            </div>
          </div>
        ) : !isAuthorizedEmail ? (
          <div className="admin-gate">
            <p className="admin-status">{status}</p>
            <button className="action-button" type="button" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        ) : (
          <>
            <div className="admin-session-row">
              <p className="admin-status">{status}</p>
              <button className="action-button" type="button" onClick={handleSignOut}>
                Sign out
              </button>
            </div>

            <div className="admin-grid">
              <form className="admin-card admin-card-wide" onSubmit={handleCreateCafe}>
                <h3>{cafeForm.id !== null ? "Edit Coffee" : "Add Coffee"}</h3>
                <p className="admin-status">Use this when the app missed a coffee shop and you want to add it yourself with one admin-only rank from 1 to 100.</p>
                <input
                  required
                  value={cafeForm.name}
                  onChange={(event) => setCafeForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Coffee shop name"
                />
                <input
                  required
                  value={cafeForm.streetAddress}
                  onChange={(event) => setCafeForm((current) => ({ ...current, streetAddress: event.target.value }))}
                  placeholder="Street address"
                />
                <input
                  required
                  value={cafeForm.city}
                  onChange={(event) => setCafeForm((current) => ({ ...current, city: event.target.value }))}
                  placeholder="City"
                />
                <input
                  required
                  value={cafeForm.state}
                  onChange={(event) => setCafeForm((current) => ({ ...current, state: event.target.value }))}
                  placeholder="State"
                />
                <input
                  value={cafeForm.neighborhood}
                  onChange={(event) => setCafeForm((current) => ({ ...current, neighborhood: event.target.value }))}
                  placeholder="Neighborhood"
                />
                <input
                  required
                  value={cafeForm.zipCode}
                  onChange={(event) => setCafeForm((current) => ({ ...current, zipCode: event.target.value }))}
                  placeholder="ZIP code"
                />
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={cafeForm.overallScore}
                  onChange={(event) => setCafeForm((current) => ({ ...current, overallScore: event.target.value }))}
                  placeholder="Your rank (1-100)"
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
                <div className="admin-actions-row">
                  <button className="cta-secondary" disabled={isBusy} type="submit">
                    {cafeForm.id !== null ? "Update coffee" : "Save coffee"}
                  </button>
                  {cafeForm.id !== null ? (
                    <button className="action-button reset" disabled={isBusy} type="button" onClick={handleCancelEdit}>
                      Cancel edit
                    </button>
                  ) : null}
                </div>
              </form>

              <section className="admin-card admin-card-wide">
                <div className="admin-list-header">
                  <div>
                    <h3>My Added Coffees</h3>
                    <p className="admin-status">Use Edit to update the address, tags, or final rank of any coffee you added.</p>
                  </div>
                  <a className="details-link compact-link" href="#admin">
                    Jump to editor
                  </a>
                </div>
                <div className="admin-list">
                  {cafes.length === 0 ? (
                    <p className="admin-status">No admin-added coffees yet.</p>
                  ) : (
                    cafes.map((cafe) => (
                      <article key={cafe.id} className="admin-list-item">
                        <div>
                          <strong>{cafe.name}</strong>
                          <p className="admin-status">
                            {[cafe.street_address, cafe.city, cafe.state].filter(Boolean).join(", ")}
                          </p>
                          <p className="admin-status">Rank: {cafe.owner_rank ?? "Not set"} / 100</p>
                        </div>
                        <button className="action-button" type="button" onClick={() => handleEditCafe(cafe)}>
                          Edit
                        </button>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </div>
          </>
        )
      ) : !configuredPasscode ? (
        <p className="admin-status">Set <code>VITE_ADMIN_EMAIL_ALLOWLIST</code> or <code>VITE_ADMIN_PASSCODE</code> in your environment to enable this editor.</p>
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
            <form className="admin-card admin-card-wide" onSubmit={handleCreateCafe}>
              <h3>{cafeForm.id !== null ? "Edit Coffee" : "Add Coffee"}</h3>
              <p className="admin-status">Use this when the app missed a coffee shop and you want to add it yourself with one admin-only rank from 1 to 100.</p>
              <input required value={cafeForm.name} onChange={(event) => setCafeForm((current) => ({ ...current, name: event.target.value }))} placeholder="Coffee shop name" />
              <input required value={cafeForm.streetAddress} onChange={(event) => setCafeForm((current) => ({ ...current, streetAddress: event.target.value }))} placeholder="Street address" />
              <input required value={cafeForm.city} onChange={(event) => setCafeForm((current) => ({ ...current, city: event.target.value }))} placeholder="City" />
              <input required value={cafeForm.state} onChange={(event) => setCafeForm((current) => ({ ...current, state: event.target.value }))} placeholder="State" />
              <input value={cafeForm.neighborhood} onChange={(event) => setCafeForm((current) => ({ ...current, neighborhood: event.target.value }))} placeholder="Neighborhood" />
              <input required value={cafeForm.zipCode} onChange={(event) => setCafeForm((current) => ({ ...current, zipCode: event.target.value }))} placeholder="ZIP code" />
              <input type="number" min="1" max="100" value={cafeForm.overallScore} onChange={(event) => setCafeForm((current) => ({ ...current, overallScore: event.target.value }))} placeholder="Your rank (1-100)" />
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
              <div className="admin-actions-row">
                <button className="cta-secondary" disabled={isBusy} type="submit">
                  {cafeForm.id !== null ? "Update coffee" : "Save coffee"}
                </button>
                {cafeForm.id !== null ? (
                  <button className="action-button reset" disabled={isBusy} type="button" onClick={handleCancelEdit}>
                    Cancel edit
                  </button>
                ) : null}
              </div>
            </form>

            <section className="admin-card admin-card-wide">
              <div className="admin-list-header">
                <div>
                  <h3>My Added Coffees</h3>
                  <p className="admin-status">Use Edit to update the address, tags, or final rank of any coffee you added.</p>
                </div>
                <a className="details-link compact-link" href="#admin">
                  Jump to editor
                </a>
              </div>
              <div className="admin-list">
                {cafes.length === 0 ? (
                  <p className="admin-status">No admin-added coffees yet.</p>
                ) : (
                  cafes.map((cafe) => (
                    <article key={cafe.id} className="admin-list-item">
                      <div>
                        <strong>{cafe.name}</strong>
                        <p className="admin-status">
                          {[cafe.street_address, cafe.city, cafe.state].filter(Boolean).join(", ")}
                        </p>
                        <p className="admin-status">Rank: {cafe.owner_rank ?? "Not set"} / 100</p>
                      </div>
                      <button className="action-button" type="button" onClick={() => handleEditCafe(cafe)}>
                        Edit
                      </button>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </section>
  );
}
