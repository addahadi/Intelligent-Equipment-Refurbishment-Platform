// FILE 2: OffresPage.tsx
// Offer management — list + detail split layout

import React, { useState, useMemo, useEffect } from "react";
import { useOffres, useAccepterOffre, useRejeterOffre } from "../../hooks/offres";

// ─── Types ────────────────────────────────────────────────────────────────────

type OffreStatus = "EN_ATTENTE" | "ACCEPTEE" | "REJETEE";
type TypeOffre = "VENTE" | "DON" | "ECHANGE";
type SortDir = "asc" | "desc";
type TabFilter = "TOUTES" | OffreStatus;

interface Offre {
  id: string;
  designation: string;
  entreprise: string;
  type: TypeOffre;
  prixPropose: number | null;
  date: string;
  statut: OffreStatus;
  description: string;
  quantite: number;
  contact: string;
  adresse: string;
  images: string[];
}

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

// ─── Sub-components ───────────────────────────────────────────────────────────

function DesktopGate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="admin-desktop-only">{children}</div>
      <div className="admin-mobile-message">
        <p>
          La console d'administration est conçue pour un écran large. Ouvrez-la
          sur un ordinateur.
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

function StateBadge({ statut }: { statut: OffreStatus }) {
  const map: Record<OffreStatus, { label: string; bg: string; color: string }> =
    {
      EN_ATTENTE: { label: "En attente", bg: `${T.brass}18`, color: T.brass },
      ACCEPTEE: {
        label: "Acceptée",
        bg: `${T.verdigris}18`,
        color: T.verdigris,
      },
      REJETEE: { label: "Rejetée", bg: `${T.steel}18`, color: T.steel },
    };
  const { label, bg, color } = map[statut];
  return (
    <span
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        background: bg,
        color,
        padding: "3px 8px",
        borderRadius: 2,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function TypeBadge({ type }: { type: TypeOffre }) {
  const map: Record<TypeOffre, string> = {
    VENTE: "Vente",
    DON: "Don",
    ECHANGE: "Échange",
  };
  return (
    <span
      style={{
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 11,
        color: T.steel,
        background: T.atelier,
        border: `1px solid ${T.rule}`,
        padding: "2px 7px",
        borderRadius: 2,
      }}
    >
      {map[type]}
    </span>
  );
}

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

function Toast({ message, type, onClose }: ToastProps) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        background: type === "success" ? T.verdigris : T.oxide,
        color: "#fff",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 13,
        fontWeight: 500,
        padding: "10px 20px",
        borderRadius: 4,
        boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 10,
        animation: "fadeInUp 0.2s ease",
      }}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.7)",
          cursor: "pointer",
          padding: 0,
          fontSize: 16,
          lineHeight: 1,
        }}
        aria-label="Fermer"
      >
        ×
      </button>
    </div>
  );
}

interface ImageGalleryProps {
  images: string[];
}

function ImageGallery({ images }: ImageGalleryProps) {
  if (images.length === 0) {
    return (
      <div
        style={{
          border: `1px dashed ${T.rule}`,
          borderRadius: 4,
          padding: "24px 0",
          textAlign: "center",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 12,
          color: T.steel,
        }}
      >
        Aucune photo fournie
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Photo ${i + 1}`}
          style={{
            width: 80,
            height: 80,
            objectFit: "cover",
            borderRadius: 4,
            border: `1px solid ${T.rule}`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

interface DetailPanelProps {
  offre: Offre;
  onAccepter: (id: string) => void;
  onRejeter: (id: string) => void;
}

function DetailPanel({ offre, onAccepter, onRejeter }: DetailPanelProps) {
  const isPending = offre.statut === "EN_ATTENTE";

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "24px 28px" }}>
      {/* Designation + status */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <h2
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 16,
              fontWeight: 600,
              color: T.graphite,
              lineHeight: 1.3,
            }}
          >
            {offre.designation}
          </h2>
          <StateBadge statut={offre.statut} />
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <TypeBadge type={offre.type} />
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              color: T.steel,
            }}
          >
            {offre.id}
          </span>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          height: 1,
          background: T.rule,
          marginBottom: 20,
        }}
      />

      {/* Fields grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px 20px",
          marginBottom: 20,
        }}
      >
        {[
          { label: "Entreprise", value: offre.entreprise },
          {
            label: "Prix proposé",
            value:
              offre.prixPropose !== null
                ? `${offre.prixPropose.toLocaleString("fr-FR")} €`
                : "—",
            mono: true,
          },
          {
            label: "Date de soumission",
            value: new Date(offre.date).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }),
          },
          { label: "Quantité", value: String(offre.quantite), mono: true },
          { label: "Contact", value: offre.contact },
          { label: "Adresse", value: offre.adresse },
        ].map(({ label, value, mono }) => (
          <div key={label}>
            <div
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: T.steel,
                marginBottom: 3,
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontFamily: mono
                  ? "'IBM Plex Mono', monospace"
                  : "Inter, system-ui, sans-serif",
                fontSize: 13,
                color: T.graphite,
                lineHeight: 1.4,
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Description */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: T.steel,
            marginBottom: 6,
          }}
        >
          Description
        </div>
        <p
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 13,
            color: T.graphite,
            lineHeight: 1.6,
            background: T.atelier,
            padding: "10px 12px",
            borderRadius: 4,
            border: `1px solid ${T.rule}`,
          }}
        >
          {offre.description}
        </p>
      </div>

      {/* Photos */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: T.steel,
            marginBottom: 6,
          }}
        >
          Photos
        </div>
        <ImageGallery images={offre.images} />
      </div>

      {/* Action buttons */}
      {isPending && (
        <div
          style={{
            display: "flex",
            gap: 10,
            borderTop: `1px solid ${T.rule}`,
            paddingTop: 20,
          }}
        >
          <button
            onClick={() => onRejeter(offre.id)}
            style={{
              flex: 1,
              padding: "10px 0",
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 13,
              fontWeight: 500,
              border: `1px solid ${T.oxide}50`,
              background: `${T.oxide}10`,
              color: T.oxide,
              borderRadius: 4,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                `${T.oxide}20`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                `${T.oxide}10`;
            }}
          >
            Rejeter
          </button>
          <button
            onClick={() => onAccepter(offre.id)}
            style={{
              flex: 2,
              padding: "10px 0",
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              background: T.verdigris,
              color: "#fff",
              borderRadius: 4,
              cursor: "pointer",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.opacity = "0.88")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.opacity = "1")
            }
          >
            Accepter et créer le composant
          </button>
        </div>
      )}

      {offre.statut === "ACCEPTEE" && (
        <div
          style={{
            background: `${T.verdigris}14`,
            border: `1px solid ${T.verdigris}40`,
            borderRadius: 4,
            padding: "10px 14px",
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 12,
            color: T.verdigris,
          }}
        >
          Offre acceptée — composant créé en inventaire.
        </div>
      )}

      {offre.statut === "REJETEE" && (
        <div
          style={{
            background: `${T.steel}14`,
            border: `1px solid ${T.steel}40`,
            borderRadius: 4,
            padding: "10px 14px",
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 12,
            color: T.steel,
          }}
        >
          Offre rejetée.
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OffresPage() {
  const { data: apiOffres } = useOffres();
  const accepterMut = useAccepterOffre();
  const rejeterMut = useRejeterOffre();

  // Adapt the API offre shape onto this screen's local interface.
  const offres: Offre[] = useMemo(
    () =>
      (apiOffres ?? []).map((o) => ({
        id: String(o.id),
        designation: o.designation,
        entreprise: o.entreprise?.nom ?? `Entreprise #${o.entrepriseId}`,
        type: (o.prixPropose && o.prixPropose > 0 ? "VENTE" : "DON") as TypeOffre,
        prixPropose: o.prixPropose ?? null,
        date: o.dateOffre,
        statut: o.statut,
        description: o.description ?? "",
        quantite: 1,
        contact: o.entreprise?.contact ?? "",
        adresse: o.entreprise?.adresse ?? "",
        images: o.images,
      })),
    [apiOffres]
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<TabFilter>("EN_ATTENTE");
  const [sortKey, setSortKey] = useState<keyof Offre>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Default the selection to the first pending offer once data arrives.
  useEffect(() => {
    if (selectedId === null && offres.length > 0) {
      setSelectedId(offres.find((o) => o.statut === "EN_ATTENTE")?.id ?? offres[0].id);
    }
  }, [offres, selectedId]);

  const filtered = useMemo(() => {
    const base =
      tab === "TOUTES" ? offres : offres.filter((o) => o.statut === tab);
    return [...base].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv), "fr");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [offres, tab, sortKey, sortDir]);

  const selected = offres.find((o) => o.id === selectedId) ?? null;

  function handleSort(key: keyof Offre) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function rejeterOffre(id: string) {
    rejeterMut.mutate(Number(id), {
      onSuccess: () => setToast({ message: "Offre rejetée.", type: "error" }),
      onError: (e: unknown) =>
        setToast({ message: (e as { message?: string })?.message ?? "Échec.", type: "error" }),
    });
  }

  function accepterOffre(id: string) {
    accepterMut.mutate(Number(id), {
      onSuccess: (composant) => {
        setToast({ message: `Offre acceptée — composant créé.`, type: "success" });
        if (composant?.id != null) {
          setTimeout(() => {
            window.location.href = `/admin/inventaire/${composant.id}`;
          }, 1200);
        }
      },
      onError: (e: unknown) =>
        setToast({ message: (e as { message?: string })?.message ?? "Échec.", type: "error" }),
    });
  }

  function SortIcon({ field }: { field: keyof Offre }) {
    if (sortKey !== field)
      return (
        <span style={{ color: T.rule, marginLeft: 4, fontSize: 10 }}>⇅</span>
      );
    return (
      <span style={{ color: T.verdigris, marginLeft: 4, fontSize: 10 }}>
        {sortDir === "asc" ? "↑" : "↓"}
      </span>
    );
  }

  const tabs: { key: TabFilter; label: string }[] = [
    { key: "EN_ATTENTE", label: "En attente" },
    { key: "TOUTES", label: "Toutes" },
    { key: "ACCEPTEE", label: "Acceptées" },
    { key: "REJETEE", label: "Rejetées" },
  ];

  const counts: Record<TabFilter, number> = {
    EN_ATTENTE: offres.filter((o) => o.statut === "EN_ATTENTE").length,
    TOUTES: offres.length,
    ACCEPTEE: offres.filter((o) => o.statut === "ACCEPTEE").length,
    REJETEE: offres.filter((o) => o.statut === "REJETEE").length,
  };

  return (
    <DesktopGate>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .offres-root {
          background: ${T.atelier};
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: Inter, system-ui, sans-serif;
          color: ${T.graphite};
        }

        .offres-header {
          padding: 24px 40px 0;
          border-bottom: 1px solid ${T.rule};
          background: ${T.panel};
          flex-shrink: 0;
        }

        .offres-header-top {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .offres-title {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 16px;
          font-weight: 600;
          color: ${T.graphite};
        }

        .tab-row {
          display: flex;
          gap: 0;
        }

        .tab-btn {
          font-family: Inter, system-ui, sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: ${T.steel};
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          padding: 8px 16px;
          cursor: pointer;
          transition: color 0.15s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .tab-btn:hover { color: ${T.graphite}; }

        .tab-btn.active {
          color: ${T.graphite};
          border-bottom-color: ${T.verdigris};
          font-weight: 600;
        }

        .tab-count {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          font-weight: 600;
          background: ${T.atelier};
          border: 1px solid ${T.rule};
          padding: 1px 6px;
          border-radius: 10px;
          color: ${T.steel};
        }

        .tab-btn.active .tab-count {
          background: ${T.verdigris}18;
          border-color: ${T.verdigris}40;
          color: ${T.verdigris};
        }

        .offres-body {
          display: flex;
          flex: 1;
          overflow: hidden;
          min-height: 0;
        }

        .offres-list {
          width: 52%;
          min-width: 400px;
          border-right: 1px solid ${T.rule};
          overflow-y: auto;
          background: ${T.panel};
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table thead th {
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
          position: sticky;
          top: 0;
          cursor: pointer;
          white-space: nowrap;
          user-select: none;
        }

        .data-table thead th:hover { color: ${T.graphite}; }

        .data-table tbody tr {
          cursor: pointer;
          border-bottom: 1px solid ${T.rule};
          transition: background 0.1s;
        }

        .data-table tbody tr:hover { background: ${T.atelier}; }
        .data-table tbody tr.selected { background: ${T.verdigris}0e; }

        .data-table tbody td {
          padding: 11px 16px;
          font-family: Inter, system-ui, sans-serif;
          font-size: 12.5px;
          color: ${T.graphite};
          vertical-align: middle;
        }

        .cell-mono {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          color: ${T.graphite};
        }

        .cell-muted {
          color: ${T.steel};
          font-size: 12px;
        }

        .offres-detail {
          flex: 1;
          overflow-y: auto;
          background: ${T.panel};
        }

        .empty-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 100%;
          color: ${T.steel};
          font-size: 13px;
          padding: 40px;
          text-align: center;
        }
      `}</style>

      <div className="offres-root">
        {/* Header */}
        <div className="offres-header">
          <div className="offres-header-top">
            <div className="offres-title">Gestion des offres</div>
          </div>
          <div className="tab-row">
            {tabs.map((t) => (
              <button
                key={t.key}
                className={`tab-btn${tab === t.key ? " active" : ""}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
                <span className="tab-count">{counts[t.key]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="offres-body">
          {/* List */}
          <div className="offres-list">
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("designation")}>
                    Désignation
                    <SortIcon field="designation" />
                  </th>
                  <th onClick={() => handleSort("entreprise")}>
                    Entreprise
                    <SortIcon field="entreprise" />
                  </th>
                  <th onClick={() => handleSort("type")}>
                    Type
                    <SortIcon field="type" />
                  </th>
                  <th onClick={() => handleSort("prixPropose")}>
                    Prix
                    <SortIcon field="prixPropose" />
                  </th>
                  <th onClick={() => handleSort("date")}>
                    Date
                    <SortIcon field="date" />
                  </th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        padding: "40px 0",
                        color: T.steel,
                        fontSize: 13,
                      }}
                    >
                      Aucune offre dans cette catégorie.
                    </td>
                  </tr>
                ) : (
                  filtered.map((offre) => (
                    <tr
                      key={offre.id}
                      className={selectedId === offre.id ? "selected" : ""}
                      onClick={() => setSelectedId(offre.id)}
                    >
                      <td style={{ fontWeight: 500, maxWidth: 180 }}>
                        <div
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {offre.designation}
                        </div>
                      </td>
                      <td className="cell-muted">{offre.entreprise}</td>
                      <td>
                        <TypeBadge type={offre.type} />
                      </td>
                      <td className="cell-mono">
                        {offre.prixPropose !== null
                          ? `${offre.prixPropose} €`
                          : "—"}
                      </td>
                      <td className="cell-muted">
                        {new Date(offre.date).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                        })}
                      </td>
                      <td>
                        <StateBadge statut={offre.statut} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Detail */}
          <div className="offres-detail">
            {selected ? (
              <DetailPanel
                offre={selected}
                onAccepter={accepterOffre}
                onRejeter={rejeterOffre}
              />
            ) : (
              <div className="empty-panel">
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
                    d="M12 18h12M12 13h8M12 23h6"
                    stroke={T.rule}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span>Sélectionnez une offre pour voir les détails</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </DesktopGate>
  );
}
