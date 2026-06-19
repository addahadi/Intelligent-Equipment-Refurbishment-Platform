// FILE 1: DashboardPage.tsx
// Admin dashboard — metric overview + conversion funnel

import React from "react";
import { useStats } from "../../hooks/stats";

// ─── Types ────────────────────────────────────────────────────────────────────

type OffreStatus = "EN_ATTENTE" | "ACCEPTEE" | "REJETEE";
type EtatActuel =
  | "EN_RECONDITIONNEMENT"
  | "EN_VENTE"
  | "VENDU"
  | "RECYCLE";

interface MetricsData {
  offres: Record<OffreStatus, number>;
  inventaire: Record<EtatActuel, number>;
  revenuSimule: number;
  enVente: number;
}

// ─── Mock data (replace with real API calls) ──────────────────────────────────

const EMPTY_METRICS: MetricsData = {
  offres: { EN_ATTENTE: 0, ACCEPTEE: 0, REJETEE: 0 },
  inventaire: { EN_RECONDITIONNEMENT: 0, EN_VENTE: 0, VENDU: 0, RECYCLE: 0 },
  revenuSimule: 0,
  enVente: 0,
};

// ─── Palette tokens ───────────────────────────────────────────────────────────

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
        @media (min-width: 1024px) {
          .admin-mobile-message { display: none !important; }
        }
        @media (max-width: 1023px) {
          .admin-desktop-only { display: none !important; }
          .admin-mobile-message {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 2rem;
            background: ${T.atelier};
            font-family: Inter, system-ui, sans-serif;
            color: ${T.steel};
            font-size: 1rem;
            text-align: center;
          }
        }
      `}</style>
    </>
  );
}

interface TodoBandProps {
  count: number;
}

function TodoBand({ count }: TodoBandProps) {
  if (count === 0) {
    return (
      <div
        style={{
          background: `${T.verdigris}14`,
          border: `1px solid ${T.verdigris}40`,
          borderRadius: 4,
          padding: "10px 16px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 13,
          color: T.verdigris,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke={T.verdigris} strokeWidth="1.5" />
          <path
            d="M4.5 7l1.8 1.8L9.5 5"
            stroke={T.verdigris}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Aucune offre en attente de revue.
      </div>
    );
  }

  return (
    <div
      style={{
        background: `${T.brass}12`,
        border: `1px solid ${T.brass}50`,
        borderRadius: 4,
        padding: "10px 16px",
        marginBottom: 24,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" stroke={T.brass} strokeWidth="1.5" />
        <path
          d="M7 4.5v3"
          stroke={T.brass}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="7" cy="9.5" r="0.75" fill={T.brass} />
      </svg>
      <span
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 13,
          color: T.graphite,
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 600,
            color: T.brass,
          }}
        >
          {count}
        </span>{" "}
        offre{count > 1 ? "s" : ""} en attente de revue —{" "}
        <a
          href="/admin/offres"
          style={{
            color: T.brass,
            textDecoration: "underline",
            textUnderlineOffset: 3,
            fontWeight: 500,
          }}
        >
          Examiner
        </a>
      </span>
    </div>
  );
}

interface MetricTileProps {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}

function MetricTile({ label, children, wide }: MetricTileProps) {
  return (
    <div
      style={{
        background: T.panel,
        border: `1px solid ${T.rule}`,
        borderRadius: 4,
        padding: "20px 24px",
        gridColumn: wide ? "span 2" : undefined,
        minHeight: 120,
      }}
    >
      <div
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: T.steel,
          marginBottom: 16,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

interface StatusRowProps {
  label: string;
  value: number;
  color: string;
}

function StatusRow({ label, value, color }: StatusRowProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: color,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 12,
            color: T.steel,
          }}
        >
          {label}
        </span>
      </div>
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 13,
          fontWeight: 600,
          color,
        }}
      >
        {value}
      </span>
    </div>
  );
}

interface FunnelBarProps {
  label: string;
  count: number;
  max: number;
  color: string;
  sublabel?: string;
}

function FunnelBar({ label, count, max, color, sublabel }: FunnelBarProps) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 5,
        }}
      >
        <div>
          <span
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 12,
              color: T.graphite,
              fontWeight: 500,
            }}
          >
            {label}
          </span>
          {sublabel && (
            <span
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: 11,
                color: T.steel,
                marginLeft: 6,
              }}
            >
              {sublabel}
            </span>
          )}
        </div>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 13,
            fontWeight: 600,
            color,
          }}
        >
          {count}
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: T.rule,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: 3,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data } = useStats();
  const metrics: MetricsData = data ?? EMPTY_METRICS;
  const { offres, inventaire, revenuSimule, enVente } = metrics;
  const totalOffres = offres.EN_ATTENTE + offres.ACCEPTEE + offres.REJETEE;
  const funnelMax = Math.max(
    inventaire.EN_RECONDITIONNEMENT,
    inventaire.EN_VENTE,
    inventaire.VENDU,
    1
  );
  const noSales = inventaire.VENDU === 0 && revenuSimule === 0;

  return (
    <DesktopGate>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Inter:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .dash-root {
          background: ${T.atelier};
          min-height: 100vh;
          padding: 32px 40px;
          font-family: Inter, system-ui, sans-serif;
          color: ${T.graphite};
        }

        .dash-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 28px;
          padding-bottom: 20px;
          border-bottom: 1px solid ${T.rule};
        }

        .dash-title {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 18px;
          font-weight: 600;
          color: ${T.graphite};
          letter-spacing: -0.02em;
        }

        .dash-subtitle {
          font-family: Inter, system-ui, sans-serif;
          font-size: 12px;
          color: ${T.steel};
          margin-top: 2px;
        }

        .dash-date {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: ${T.steel};
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        .funnel-section {
          background: ${T.panel};
          border: 1px solid ${T.rule};
          border-radius: 4px;
          padding: 20px 24px;
          margin-bottom: 24px;
        }

        .section-label {
          font-family: Inter, system-ui, sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: ${T.steel};
          margin-bottom: 20px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 48px;
          background: ${T.panel};
          border: 1px dashed ${T.rule};
          border-radius: 4px;
          font-family: Inter, system-ui, sans-serif;
          font-size: 13px;
          color: ${T.steel};
          text-align: center;
        }

        .revenu-big {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 28px;
          font-weight: 600;
          color: ${T.verdigris};
          letter-spacing: -0.03em;
          line-height: 1;
          margin-bottom: 4px;
        }

        .revenu-label {
          font-family: Inter, system-ui, sans-serif;
          font-size: 11px;
          color: ${T.steel};
        }

        .envente-big {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 36px;
          font-weight: 600;
          color: ${T.graphite};
          letter-spacing: -0.04em;
          line-height: 1;
          margin-bottom: 4px;
        }

        .funnel-cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
      `}</style>

      <div className="dash-root">
        {/* Header */}
        <div className="dash-header">
          <div>
            <div className="dash-title">Console d'administration</div>
            <div className="dash-subtitle">
              Plateforme de reconditionnement intelligent
            </div>
          </div>
          <div className="dash-date">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* To-do band */}
        <TodoBand count={offres.EN_ATTENTE} />

        {/* Metric tiles */}
        <div className="metrics-grid">
          {/* Offres by status */}
          <MetricTile label="Offres">
            <StatusRow
              label="En attente"
              value={offres.EN_ATTENTE}
              color={T.brass}
            />
            <StatusRow
              label="Acceptées"
              value={offres.ACCEPTEE}
              color={T.verdigris}
            />
            <StatusRow
              label="Rejetées"
              value={offres.REJETEE}
              color={T.steel}
            />
            <div
              style={{
                borderTop: `1px solid ${T.rule}`,
                marginTop: 8,
                paddingTop: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontSize: 11,
                  color: T.steel,
                }}
              >
                Total
              </span>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 13,
                  fontWeight: 600,
                  color: T.graphite,
                }}
              >
                {totalOffres}
              </span>
            </div>
          </MetricTile>

          {/* Inventaire by état */}
          <MetricTile label="Inventaire">
            <StatusRow
              label="En reconditionnement"
              value={inventaire.EN_RECONDITIONNEMENT}
              color={T.brass}
            />
            <StatusRow
              label="En vente"
              value={inventaire.EN_VENTE}
              color={T.verdigris}
            />
            <StatusRow
              label="Vendus"
              value={inventaire.VENDU}
              color={T.steel}
            />
            <StatusRow
              label="Recyclés"
              value={inventaire.RECYCLE}
              color={T.oxide}
            />
          </MetricTile>

          {/* Revenu simulé */}
          <MetricTile label="Revenu simulé">
            <div className="revenu-big">
              {revenuSimule.toLocaleString("fr-FR")} €
            </div>
            <div className="revenu-label">
              Somme des commandes confirmées
            </div>
          </MetricTile>

          {/* Items en vente */}
          <MetricTile label="Actuellement en vente">
            <div className="envente-big">{enVente}</div>
            <div className="revenu-label">composants au catalogue</div>
          </MetricTile>
        </div>

        {/* Conversion funnel */}
        {noSales ? (
          <div className="empty-state">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect
                x="4"
                y="4"
                width="24"
                height="24"
                rx="2"
                stroke={T.rule}
                strokeWidth="1.5"
              />
              <path
                d="M10 22l4-6 3 4 2-3 3 5"
                stroke={T.rule}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Aucune vente enregistrée pour l'instant.</span>
            <span
              style={{
                fontSize: 12,
                color: T.steel,
              }}
            >
              Le tunnel de conversion s'affichera dès les premières commandes.
            </span>
          </div>
        ) : (
          <div className="funnel-section">
            <div className="section-label">Tunnel de reconditionnement</div>
            <div className="funnel-cols">
              <div>
                <FunnelBar
                  label="En reconditionnement"
                  count={inventaire.EN_RECONDITIONNEMENT}
                  max={funnelMax}
                  color={T.brass}
                />
                <FunnelBar
                  label="En vente"
                  count={inventaire.EN_VENTE}
                  max={funnelMax}
                  color={T.verdigris}
                />
                <FunnelBar
                  label="Vendus"
                  count={inventaire.VENDU}
                  max={funnelMax}
                  color={T.steel}
                />
                <FunnelBar
                  label="Recyclés"
                  count={inventaire.RECYCLE}
                  max={funnelMax}
                  color={T.oxide}
                  sublabel="hors cycle"
                />
              </div>
              <div>
                {/* Conversion rate summary */}
                <div
                  style={{
                    marginBottom: 16,
                    padding: "12px 16px",
                    background: T.atelier,
                    border: `1px solid ${T.rule}`,
                    borderRadius: 4,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "Inter, system-ui, sans-serif",
                      fontSize: 11,
                      color: T.steel,
                      marginBottom: 6,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      fontWeight: 600,
                    }}
                  >
                    Taux de conversion
                  </div>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 22,
                      fontWeight: 600,
                      color: T.verdigris,
                    }}
                  >
                    {inventaire.VENDU + inventaire.EN_VENTE > 0
                      ? Math.round(
                          (inventaire.VENDU /
                            (inventaire.VENDU +
                              inventaire.EN_VENTE +
                              inventaire.EN_RECONDITIONNEMENT)) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div
                    style={{
                      fontFamily: "Inter, system-ui, sans-serif",
                      fontSize: 11,
                      color: T.steel,
                      marginTop: 2,
                    }}
                  >
                    items entrés → vendus
                  </div>
                </div>
                <div
                  style={{
                    padding: "12px 16px",
                    background: T.atelier,
                    border: `1px solid ${T.rule}`,
                    borderRadius: 4,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "Inter, system-ui, sans-serif",
                      fontSize: 11,
                      color: T.steel,
                      marginBottom: 6,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      fontWeight: 600,
                    }}
                  >
                    Taux de recyclage
                  </div>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 22,
                      fontWeight: 600,
                      color: T.oxide,
                    }}
                  >
                    {inventaire.RECYCLE + inventaire.VENDU > 0
                      ? Math.round(
                          (inventaire.RECYCLE /
                            (inventaire.RECYCLE +
                              inventaire.VENDU +
                              inventaire.EN_VENTE +
                              inventaire.EN_RECONDITIONNEMENT)) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div
                    style={{
                      fontFamily: "Inter, system-ui, sans-serif",
                      fontSize: 11,
                      color: T.steel,
                      marginTop: 2,
                    }}
                  >
                    items déclarés recyclés
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DesktopGate>
  );
}
