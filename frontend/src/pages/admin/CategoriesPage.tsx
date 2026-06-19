// FILE 5: CategoriesPage.tsx
// Category management + Ventes page (two exports in one file)

import React, { useState, useMemo } from "react";
import { useCategories, useCreateCategorie, useDeleteCategorie } from "../../hooks/categories";
import { useComposants } from "../../hooks/composants";
import { useCommandes } from "../../hooks/commandes";

// ─── Palette ──────────────────────────────────────────────────────────────────

const T = {
  atelier: "#EEF1F2",
  panel: "#FAFBFB",
  graphite: "#18211F",
  verdigris: "#1C7A62",
  steel: "#6E7A80",
  brass: "#A87C2A",
  oxide: "#9C4A2C",
  rule: "#DCE1E2",
} as const;

// ─── Shared styles string ─────────────────────────────────────────────────────

const SHARED_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Inter:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
`;

// ─── DesktopGate (shared) ─────────────────────────────────────────────────────

function DesktopGate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="admin-desktop-only">{children}</div>
      <div className="admin-mobile-message">
        <p>
          La console d'administration est conçue pour un écran large.
          Ouvrez-la sur un ordinateur.
        </p>
      </div>
      <style>{`
        @media (min-width: 1024px) { .admin-mobile-message { display: none !important; } }
        @media (max-width: 1023px) {
          .admin-desktop-only { display: none !important; }
          .admin-mobile-message {
            display: flex; align-items: center; justify-content: center;
            min-height: 100vh; padding: 2rem; background: ${T.atelier};
            font-family: Inter, system-ui, sans-serif; color: ${T.steel};
            font-size: 1rem; text-align: center;
          }
        }
      `}</style>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT 1: CategoriesPage
// ─────────────────────────────────────────────────────────────────────────────

interface Categorie {
  id: string;
  libelle: string;
  count: number; // number of composants in this category
}

export function CategoriesPage() {
  const { data: catsData } = useCategories();
  const { data: composantsData } = useComposants({});
  const createMut = useCreateCategorie();
  const deleteMut = useDeleteCategorie();

  const [newLibelle, setNewLibelle] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Derive per-category composant counts (the API doesn't return them).
  const categories: Categorie[] = useMemo(() => {
    const counts = new Map<number, number>();
    (composantsData ?? []).forEach((c) => {
      if (c.categorieId != null) counts.set(c.categorieId, (counts.get(c.categorieId) ?? 0) + 1);
    });
    return (catsData ?? []).map((c) => ({
      id: String(c.id),
      libelle: c.libelle,
      count: counts.get(c.id) ?? 0,
    }));
  }, [catsData, composantsData]);

  function handleAdd() {
    const trimmed = newLibelle.trim();
    if (!trimmed) {
      setError("Le libellé ne peut pas être vide.");
      return;
    }
    if (categories.some((c) => c.libelle.toLowerCase() === trimmed.toLowerCase())) {
      setError(`La catégorie « ${trimmed} » existe déjà.`);
      return;
    }
    createMut.mutate(
      { libelle: trimmed },
      {
        onSuccess: () => { setNewLibelle(""); setError(null); },
        onError: (e: unknown) => setError((e as { message?: string })?.message ?? "Échec de l'ajout."),
      },
    );
  }

  function handleDeleteConfirm(id: string) {
    deleteMut.mutate(Number(id), { onSuccess: () => setConfirmDeleteId(null) });
  }

  const categoryToDelete = categories.find((c) => c.id === confirmDeleteId);

  return (
    <DesktopGate>
      <style>{`
        ${SHARED_CSS}

        .cat-root {
          background: ${T.atelier};
          min-height: 100vh;
          font-family: Inter, system-ui, sans-serif;
          color: ${T.graphite};
        }

        .cat-header {
          background: ${T.panel};
          border-bottom: 1px solid ${T.rule};
          padding: 20px 40px;
        }

        .cat-title {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 16px;
          font-weight: 600;
          color: ${T.graphite};
          margin-bottom: 4px;
        }

        .cat-subtitle {
          font-family: Inter, system-ui, sans-serif;
          font-size: 12px;
          color: ${T.steel};
        }

        .cat-content {
          padding: 32px 40px;
          max-width: 640px;
        }

        .add-row {
          display: flex;
          gap: 10px;
          margin-bottom: 28px;
          align-items: flex-start;
        }

        .add-input {
          flex: 1;
          font-family: Inter, system-ui, sans-serif;
          font-size: 13px;
          border: 1px solid ${T.rule};
          background: ${T.panel};
          color: ${T.graphite};
          padding: 8px 12px;
          border-radius: 4px;
          outline: none;
          transition: border-color 0.15s;
        }

        .add-input:focus { border-color: ${T.verdigris}; }
        .add-input.error { border-color: ${T.oxide}; }
        .add-input::placeholder { color: ${T.steel}; }

        .btn-add {
          font-family: Inter, system-ui, sans-serif;
          font-size: 12px;
          font-weight: 600;
          background: ${T.verdigris};
          color: #fff;
          border: none;
          padding: 9px 18px;
          border-radius: 4px;
          cursor: pointer;
          white-space: nowrap;
          transition: opacity 0.15s;
        }

        .btn-add:hover { opacity: 0.88; }

        .error-msg {
          font-family: Inter, system-ui, sans-serif;
          font-size: 12px;
          color: ${T.oxide};
          margin-top: 6px;
        }

        .cat-table {
          width: 100%;
          border-collapse: collapse;
          background: ${T.panel};
          border: 1px solid ${T.rule};
          border-radius: 4px;
          overflow: hidden;
        }

        .cat-table thead th {
          font-family: Inter, system-ui, sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: ${T.steel};
          padding: 10px 16px;
          text-align: left;
          background: ${T.atelier};
          border-bottom: 1px solid ${T.rule};
        }

        .cat-table tbody tr {
          border-bottom: 1px solid ${T.rule};
          transition: background 0.1s;
        }

        .cat-table tbody tr:last-child { border-bottom: none; }
        .cat-table tbody tr:hover { background: ${T.atelier}; }

        .cat-table tbody td {
          padding: 11px 16px;
          font-family: Inter, system-ui, sans-serif;
          font-size: 13px;
          color: ${T.graphite};
          vertical-align: middle;
        }

        .btn-delete {
          font-family: Inter, system-ui, sans-serif;
          font-size: 11px;
          font-weight: 500;
          background: none;
          border: 1px solid ${T.rule};
          color: ${T.steel};
          padding: 4px 10px;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .btn-delete:hover {
          border-color: ${T.oxide};
          color: ${T.oxide};
          background: ${T.oxide}10;
        }

        .btn-delete:disabled {
          opacity: 0.4;
          cursor: default;
        }

        .count-badge {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          color: ${T.steel};
          background: ${T.atelier};
          border: 1px solid ${T.rule};
          padding: 1px 7px;
          border-radius: 10px;
        }

        /* Confirm dialog overlay */
        .confirm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(24,33,31,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .confirm-dialog {
          background: ${T.panel};
          border: 1px solid ${T.rule};
          border-radius: 6px;
          padding: 28px 32px;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 8px 40px rgba(0,0,0,0.16);
        }

        .confirm-title {
          font-family: Inter, system-ui, sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: ${T.graphite};
          margin-bottom: 8px;
        }

        .confirm-body {
          font-family: Inter, system-ui, sans-serif;
          font-size: 13px;
          color: ${T.steel};
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .confirm-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .btn-cancel {
          font-family: Inter, system-ui, sans-serif;
          font-size: 12px;
          font-weight: 500;
          background: none;
          border: 1px solid ${T.rule};
          color: ${T.steel};
          padding: 8px 18px;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-confirm-delete {
          font-family: Inter, system-ui, sans-serif;
          font-size: 12px;
          font-weight: 600;
          background: ${T.oxide};
          border: none;
          color: #fff;
          padding: 8px 18px;
          border-radius: 4px;
          cursor: pointer;
          transition: opacity 0.15s;
        }

        .btn-confirm-delete:hover { opacity: 0.88; }
      `}</style>

      <div className="cat-root">
        <div className="cat-header">
          <div className="cat-title">Catégories</div>
          <div className="cat-subtitle">
            Gérer les catégories de composants du catalogue
          </div>
        </div>

        <div className="cat-content">
          {/* Add row */}
          <div>
            <div className="add-row">
              <input
                className={`add-input${error ? " error" : ""}`}
                type="text"
                placeholder="Nouvelle catégorie…"
                value={newLibelle}
                onChange={(e) => {
                  setNewLibelle(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                }}
                aria-label="Libellé de la nouvelle catégorie"
              />
              <button className="btn-add" onClick={handleAdd}>
                Ajouter
              </button>
            </div>
            {error && <div className="error-msg">{error}</div>}
          </div>

          {/* Table */}
          <table className="cat-table">
            <thead>
              <tr>
                <th>Libellé</th>
                <th>Composants</th>
                <th style={{ width: 80 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    style={{
                      textAlign: "center",
                      padding: "40px 0",
                      color: T.steel,
                      fontSize: 13,
                    }}
                  >
                    Aucune catégorie. Ajoutez-en une ci-dessus.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id}>
                    <td style={{ fontWeight: 500 }}>{cat.libelle}</td>
                    <td>
                      <span className="count-badge">{cat.count}</span>
                    </td>
                    <td>
                      <button
                        className="btn-delete"
                        disabled={cat.count > 0}
                        title={
                          cat.count > 0
                            ? `${cat.count} composant${cat.count > 1 ? "s" : ""} utilisent cette catégorie`
                            : "Supprimer"
                        }
                        onClick={() => setConfirmDeleteId(cat.id)}
                        aria-label={`Supprimer la catégorie ${cat.libelle}`}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {categories.some((c) => c.count > 0) && (
            <p
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: 11,
                color: T.steel,
                marginTop: 10,
              }}
            >
              Les catégories en cours d'utilisation ne peuvent pas être supprimées.
            </p>
          )}
        </div>
      </div>

      {/* Confirm delete dialog */}
      {confirmDeleteId && categoryToDelete && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <div className="confirm-title">
              Supprimer « {categoryToDelete.libelle} » ?
            </div>
            <div className="confirm-body">
              Cette action est irréversible. La catégorie sera retirée de la
              liste. Les composants déjà classés sous cette catégorie ne seront
              pas affectés.
            </div>
            <div className="confirm-actions">
              <button
                className="btn-cancel"
                onClick={() => setConfirmDeleteId(null)}
              >
                Annuler
              </button>
              <button
                className="btn-confirm-delete"
                onClick={() => handleDeleteConfirm(confirmDeleteId)}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </DesktopGate>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT 2: VentesPage (FILE 5b)
// Commandes list — read-only, no actions
// ─────────────────────────────────────────────────────────────────────────────

type WarrantyState = "ACTIVE" | "EXPIREE" | "BIENTOT";

interface Commande {
  id: string;
  clientNom: string;
  clientEmail: string;
  itemNom: string;
  itemReference: string;
  date: string;
  prix: number;
  garantieMois: number;
  warrantyState: WarrantyState;
}

function WarrantyStatus({
  state,
  mois,
}: {
  state: WarrantyState;
  mois: number;
}) {
  const map: Record<
    WarrantyState,
    { label: string; bg: string; color: string }
  > = {
    ACTIVE: {
      label: `Garantie active (${mois} mois)`,
      bg: `${T.verdigris}18`,
      color: T.verdigris,
    },
    BIENTOT: {
      label: "Expire bientôt",
      bg: `${T.brass}18`,
      color: T.brass,
    },
    EXPIREE: {
      label: "Garantie expirée",
      bg: `${T.steel}18`,
      color: T.steel,
    },
  };
  const { label, bg, color } = map[state];
  return (
    <span
      style={{
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 11,
        fontWeight: 500,
        background: bg,
        color,
        padding: "3px 9px",
        borderRadius: 2,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function warrantyStateFrom(dateFinGarantie: string): WarrantyState {
  if (!dateFinGarantie) return "EXPIREE";
  const end = new Date(dateFinGarantie).getTime();
  const now = Date.now();
  if (end <= now) return "EXPIREE";
  return (end - now) / 86_400_000 <= 31 ? "BIENTOT" : "ACTIVE";
}

export function VentesPage() {
  const { data: cmds } = useCommandes();

  const commandes: Commande[] = useMemo(
    () =>
      (cmds ?? []).map((c) => ({
        id: String(c.id),
        clientNom: c.client?.nom ?? `Client #${c.clientId}`,
        clientEmail: c.client?.email ?? "",
        itemNom: c.composant?.nom ?? `Composant #${c.composantId}`,
        itemReference: c.composant?.reference ?? "",
        date: c.date,
        prix: c.prix,
        garantieMois: c.composant?.garantie ?? 0,
        warrantyState: warrantyStateFrom(c.dateFinGarantie),
      })),
    [cmds]
  );

  const total = commandes.reduce((s, c) => s + c.prix, 0);

  return (
    <DesktopGate>
      <style>{`
        ${SHARED_CSS}

        .ventes-root {
          background: ${T.atelier};
          min-height: 100vh;
          font-family: Inter, system-ui, sans-serif;
          color: ${T.graphite};
        }

        .ventes-header {
          background: ${T.panel};
          border-bottom: 1px solid ${T.rule};
          padding: 20px 40px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
        }

        .ventes-title {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 16px;
          font-weight: 600;
          color: ${T.graphite};
          margin-bottom: 3px;
        }

        .ventes-subtitle {
          font-family: Inter, system-ui, sans-serif;
          font-size: 12px;
          color: ${T.steel};
        }

        .ventes-total {
          text-align: right;
        }

        .ventes-total-label {
          font-family: Inter, system-ui, sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: ${T.steel};
          margin-bottom: 2px;
        }

        .ventes-total-value {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 22px;
          font-weight: 600;
          color: ${T.verdigris};
          letter-spacing: -0.02em;
        }

        .ventes-content {
          padding: 24px 40px;
        }

        .ventes-table {
          width: 100%;
          border-collapse: collapse;
          background: ${T.panel};
          border: 1px solid ${T.rule};
          border-radius: 4px;
          overflow: hidden;
        }

        .ventes-table thead th {
          font-family: Inter, system-ui, sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: ${T.steel};
          padding: 10px 16px;
          text-align: left;
          background: ${T.atelier};
          border-bottom: 1px solid ${T.rule};
          white-space: nowrap;
        }

        .ventes-table tbody tr {
          border-bottom: 1px solid ${T.rule};
        }

        .ventes-table tbody tr:last-child { border-bottom: none; }

        .ventes-table tbody td {
          padding: 12px 16px;
          font-family: Inter, system-ui, sans-serif;
          font-size: 12.5px;
          color: ${T.graphite};
          vertical-align: middle;
        }

        .cmd-ref {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: ${T.steel};
        }

        .cmd-prix {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          font-weight: 600;
          color: ${T.graphite};
        }

        .client-email {
          font-family: Inter, system-ui, sans-serif;
          font-size: 11px;
          color: ${T.steel};
          margin-top: 2px;
        }
      `}</style>

      <div className="ventes-root">
        {/* Header */}
        <div className="ventes-header">
          <div>
            <div className="ventes-title">Ventes</div>
            <div className="ventes-subtitle">
              Historique des commandes confirmées
            </div>
          </div>
          <div className="ventes-total">
            <div className="ventes-total-label">Revenu total</div>
            <div className="ventes-total-value">
              {total.toLocaleString("fr-FR")} €
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="ventes-content">
          {commandes.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "60px 0",
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: 13,
                color: T.steel,
                textAlign: "center",
              }}
            >
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <rect
                  x="6"
                  y="6"
                  width="24"
                  height="24"
                  rx="2"
                  stroke={T.rule}
                  strokeWidth="1.5"
                />
                <path
                  d="M12 18h12M12 13h8"
                  stroke={T.rule}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Aucune vente enregistrée.
            </div>
          ) : (
            <table className="ventes-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Composant</th>
                  <th>Référence</th>
                  <th>Date</th>
                  <th>Prix</th>
                  <th>Garantie</th>
                </tr>
              </thead>
              <tbody>
                {commandes.map((cmd) => (
                  <tr key={cmd.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{cmd.clientNom}</div>
                      <div className="client-email">{cmd.clientEmail}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{cmd.itemNom}</div>
                      <div
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 10,
                          color: T.steel,
                          marginTop: 2,
                        }}
                      >
                        {cmd.id}
                      </div>
                    </td>
                    <td className="cmd-ref">{cmd.itemReference}</td>
                    <td style={{ color: T.steel, fontSize: 12 }}>
                      {new Date(cmd.date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="cmd-prix">
                      {cmd.prix.toLocaleString("fr-FR")} €
                    </td>
                    <td>
                      <WarrantyStatus
                        state={cmd.warrantyState}
                        mois={cmd.garantieMois}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DesktopGate>
  );
}

// Default export = CategoriesPage (primary export of this file)
export default CategoriesPage;
