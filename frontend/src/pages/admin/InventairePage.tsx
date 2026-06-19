// FILE 3: InventairePage.tsx
// Inventory list with filter tabs and navigation

import React, { useState, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type EtatActuel =
  | "EN_RECONDITIONNEMENT"
  | "EN_VENTE"
  | "VENDU"
  | "RECYCLE";
type TypeComposant = "ORGANE" | "PIECE";
type Qualite = "NEUF" | "BON" | "CORRECT" | "USAGE";
type TabFilter = "TOUS" | EtatActuel;
type SortDir = "asc" | "desc";

interface Composant {
  id: string;
  nom: string;
  reference: string;
  marque: string;
  modele: string;
  categorie: string;
  typeComposant: TypeComposant;
  qualite: Qualite;
  prix: number;
  etatActuel: EtatActuel;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_COMPOSANTS: Composant[] = [
  {
    id: "comp-001",
    nom: "Alternateur 24V 100A",
    reference: "ALT-24V-100A-BSH",
    marque: "Bosch",
    modele: "0124655174",
    categorie: "Électrique",
    typeComposant: "PIECE",
    qualite: "BON",
    prix: 145,
    etatActuel: "EN_VENTE",
  },
  {
    id: "comp-002",
    nom: "Compresseur d'air 50L",
    reference: "COMP-50L-DPT",
    marque: "Dupont",
    modele: "CA-50-10",
    categorie: "Pneumatique",
    typeComposant: "ORGANE",
    qualite: "CORRECT",
    prix: 280,
    etatActuel: "EN_RECONDITIONNEMENT",
  },
  {
    id: "comp-003",
    nom: "Moteur électrique 1.5kW",
    reference: "MOT-1K5-SIE",
    marque: "Siemens",
    modele: "1LA7083-2AA10",
    categorie: "Motorisation",
    typeComposant: "ORGANE",
    qualite: "BON",
    prix: 190,
    etatActuel: "EN_VENTE",
  },
  {
    id: "comp-004",
    nom: "Radiateur hydraulique 120×60",
    reference: "RAD-HYD-120X60",
    marque: "Thermia",
    modele: "TH-HYD-120",
    categorie: "Hydraulique",
    typeComposant: "PIECE",
    qualite: "USAGE",
    prix: 95,
    etatActuel: "EN_RECONDITIONNEMENT",
  },
  {
    id: "comp-005",
    nom: "Démarreur 12V",
    reference: "DEM-12V-VAL",
    marque: "Valeo",
    modele: "TS14E4",
    categorie: "Électrique",
    typeComposant: "PIECE",
    qualite: "USAGE",
    prix: 0,
    etatActuel: "RECYCLE",
  },
  {
    id: "comp-006",
    nom: "Pompe hydraulique à pistons",
    reference: "PMP-HYD-BOH-A10",
    marque: "Bosch Rexroth",
    modele: "A10VSO28DFR",
    categorie: "Hydraulique",
    typeComposant: "ORGANE",
    qualite: "BON",
    prix: 420,
    etatActuel: "VENDU",
  },
  {
    id: "comp-007",
    nom: "Variateur de fréquence 7.5kW",
    reference: "VFD-7K5-SCH-ATV",
    marque: "Schneider",
    modele: "ATV320U75N4C",
    categorie: "Électrique",
    typeComposant: "ORGANE",
    qualite: "NEUF",
    prix: 680,
    etatActuel: "EN_VENTE",
  },
  {
    id: "comp-008",
    nom: "Réducteur de vitesse 1:20",
    reference: "RED-1-20-SEW",
    marque: "SEW-Eurodrive",
    modele: "R57DT100L4",
    categorie: "Transmission",
    typeComposant: "ORGANE",
    qualite: "BON",
    prix: 310,
    etatActuel: "VENDU",
  },
];

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

function StateBadge({ etat }: { etat: EtatActuel }) {
  const map: Record<EtatActuel, { label: string; bg: string; color: string }> =
    {
      EN_RECONDITIONNEMENT: {
        label: "En recond.",
        bg: `${T.brass}18`,
        color: T.brass,
      },
      EN_VENTE: {
        label: "En vente",
        bg: `${T.verdigris}18`,
        color: T.verdigris,
      },
      VENDU: { label: "Vendu", bg: `${T.steel}18`, color: T.steel },
      RECYCLE: { label: "Recyclé", bg: `${T.oxide}18`, color: T.oxide },
    };
  const { label, bg, color } = map[etat];
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

const QUALITE_LABELS: Record<Qualite, string> = {
  NEUF: "Neuf",
  BON: "Bon",
  CORRECT: "Correct",
  USAGE: "Usagé",
};

const QUALITE_SCORE: Record<Qualite, number> = {
  NEUF: 4,
  BON: 3,
  CORRECT: 2,
  USAGE: 1,
};

const QUALITE_COLOR: Record<Qualite, string> = {
  NEUF: T.verdigris,
  BON: "#3a9e7c",
  CORRECT: T.brass,
  USAGE: T.oxide,
};

function QualityGauge({ qualite }: { qualite: Qualite }) {
  const score = QUALITE_SCORE[qualite];
  const color = QUALITE_COLOR[qualite];
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 6 }}
      title={QUALITE_LABELS[qualite]}
    >
      <div style={{ display: "flex", gap: 2 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              width: 5,
              height: 12,
              borderRadius: 1,
              background: i <= score ? color : T.rule,
            }}
          />
        ))}
      </div>
      <span
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 11,
          color,
        }}
      >
        {QUALITE_LABELS[qualite]}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function InventairePage() {
  const [tab, setTab] = useState<TabFilter>("TOUS");
  const [sortKey, setSortKey] = useState<keyof Composant>("nom");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let base =
      tab === "TOUS"
        ? MOCK_COMPOSANTS
        : MOCK_COMPOSANTS.filter((c) => c.etatActuel === tab);

    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter(
        (c) =>
          c.nom.toLowerCase().includes(q) ||
          c.reference.toLowerCase().includes(q) ||
          c.marque.toLowerCase().includes(q) ||
          c.categorie.toLowerCase().includes(q)
      );
    }

    return [...base].sort((a, b) => {
      const av = String(a[sortKey] ?? "");
      const bv = String(b[sortKey] ?? "");
      const cmp = av.localeCompare(bv, "fr");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [tab, sortKey, sortDir, search]);

  function handleSort(key: keyof Composant) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function SortIcon({ field }: { field: keyof Composant }) {
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

  const counts: Record<TabFilter, number> = {
    TOUS: MOCK_COMPOSANTS.length,
    EN_RECONDITIONNEMENT: MOCK_COMPOSANTS.filter(
      (c) => c.etatActuel === "EN_RECONDITIONNEMENT"
    ).length,
    EN_VENTE: MOCK_COMPOSANTS.filter((c) => c.etatActuel === "EN_VENTE").length,
    VENDU: MOCK_COMPOSANTS.filter((c) => c.etatActuel === "VENDU").length,
    RECYCLE: MOCK_COMPOSANTS.filter((c) => c.etatActuel === "RECYCLE").length,
  };

  const tabs: { key: TabFilter; label: string }[] = [
    { key: "TOUS", label: "Tous" },
    { key: "EN_RECONDITIONNEMENT", label: "En reconditionnement" },
    { key: "EN_VENTE", label: "En vente" },
    { key: "VENDU", label: "Vendu" },
    { key: "RECYCLE", label: "Recyclé" },
  ];

  function navigateTo(path: string) {
    window.location.href = path;
  }

  return (
    <DesktopGate>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .inv-root {
          background: ${T.atelier};
          min-height: 100vh;
          font-family: Inter, system-ui, sans-serif;
          color: ${T.graphite};
        }

        .inv-header {
          background: ${T.panel};
          border-bottom: 1px solid ${T.rule};
          padding: 20px 40px 0;
        }

        .inv-header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .inv-title {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 16px;
          font-weight: 600;
          color: ${T.graphite};
        }

        .inv-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .search-input {
          font-family: Inter, system-ui, sans-serif;
          font-size: 12px;
          border: 1px solid ${T.rule};
          background: ${T.atelier};
          color: ${T.graphite};
          padding: 7px 12px;
          border-radius: 4px;
          width: 220px;
          outline: none;
          transition: border-color 0.15s;
        }

        .search-input:focus { border-color: ${T.verdigris}; }
        .search-input::placeholder { color: ${T.steel}; }

        .btn-new {
          font-family: Inter, system-ui, sans-serif;
          font-size: 12px;
          font-weight: 600;
          background: ${T.verdigris};
          color: #fff;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: opacity 0.15s;
        }

        .btn-new:hover { opacity: 0.88; }

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
          padding: 8px 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .tab-btn:hover { color: ${T.graphite}; }
        .tab-btn.active { color: ${T.graphite}; border-bottom-color: ${T.verdigris}; font-weight: 600; }

        .tab-count {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
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

        .inv-content {
          padding: 24px 40px;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          background: ${T.panel};
          border: 1px solid ${T.rule};
          border-radius: 4px;
          overflow: hidden;
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

        .data-table tbody tr:last-child { border-bottom: none; }
        .data-table tbody tr:hover { background: ${T.atelier}; }

        .data-table tbody td {
          padding: 11px 16px;
          font-family: Inter, system-ui, sans-serif;
          font-size: 12.5px;
          color: ${T.graphite};
          vertical-align: middle;
        }

        .cell-ref {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: ${T.steel};
        }

        .cell-prix {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          color: ${T.graphite};
          font-weight: 600;
        }

        .type-chip {
          font-family: Inter, system-ui, sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          background: ${T.atelier};
          border: 1px solid ${T.rule};
          color: ${T.steel};
          padding: 2px 7px;
          border-radius: 2px;
        }

        .empty-table {
          text-align: center;
          padding: 48px;
          color: ${T.steel};
          font-size: 13px;
        }

        .row-count {
          font-family: Inter, system-ui, sans-serif;
          font-size: 12px;
          color: ${T.steel};
          margin-bottom: 12px;
        }
      `}</style>

      <div className="inv-root">
        {/* Header */}
        <div className="inv-header">
          <div className="inv-header-top">
            <div className="inv-title">Inventaire</div>
            <div className="inv-actions">
              <input
                className="search-input"
                type="text"
                placeholder="Rechercher par nom, référence…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Rechercher un composant"
              />
              <button
                className="btn-new"
                onClick={() => navigateTo("/admin/inventaire/new")}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M6 1v10M1 6h10"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Nouveau composant
              </button>
            </div>
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

        {/* Content */}
        <div className="inv-content">
          <div className="row-count">
            {filtered.length} composant{filtered.length !== 1 ? "s" : ""}
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("nom")}>
                  Nom <SortIcon field="nom" />
                </th>
                <th onClick={() => handleSort("reference")}>
                  Référence <SortIcon field="reference" />
                </th>
                <th onClick={() => handleSort("typeComposant")}>
                  Type <SortIcon field="typeComposant" />
                </th>
                <th onClick={() => handleSort("categorie")}>
                  Catégorie <SortIcon field="categorie" />
                </th>
                <th onClick={() => handleSort("qualite")}>
                  Qualité <SortIcon field="qualite" />
                </th>
                <th onClick={() => handleSort("prix")}>
                  Prix <SortIcon field="prix" />
                </th>
                <th onClick={() => handleSort("etatActuel")}>
                  État <SortIcon field="etatActuel" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-table">
                    {search
                      ? `Aucun composant ne correspond à « ${search} ».`
                      : "Aucun composant dans cette catégorie."}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => navigateTo(`/admin/inventaire/${c.id}`)}
                  >
                    <td>
                      <div style={{ fontWeight: 500 }}>{c.nom}</div>
                      <div
                        style={{
                          fontSize: 11,
                          color: T.steel,
                          marginTop: 2,
                        }}
                      >
                        {c.marque} {c.modele}
                      </div>
                    </td>
                    <td className="cell-ref">{c.reference}</td>
                    <td>
                      <span className="type-chip">{c.typeComposant}</span>
                    </td>
                    <td style={{ color: T.steel, fontSize: 12 }}>
                      {c.categorie}
                    </td>
                    <td>
                      <QualityGauge qualite={c.qualite} />
                    </td>
                    <td className="cell-prix">
                      {c.prix > 0
                        ? `${c.prix.toLocaleString("fr-FR")} €`
                        : "—"}
                    </td>
                    <td>
                      <StateBadge etat={c.etatActuel} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DesktopGate>
  );
}
