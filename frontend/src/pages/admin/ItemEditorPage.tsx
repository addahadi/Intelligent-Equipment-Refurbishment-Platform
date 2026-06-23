// FILE 4: ItemEditorPage.tsx
// Item editor + traceability builder with two tabs

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useComposant, useUpdateComposant, useCreateComposant, useDeclarePieces } from "../../hooks/composants";
import { useEtapes, useCreateEtape, useUpdateEtape, useDeleteEtape, useReorderEtape } from "../../hooks/etapes";
import { useCategories } from "../../hooks/categories";
import { useUploadImages } from "../../hooks/uploads";
import type { TypeEtape as ApiTypeEtape } from "../../types";
import {
  getTimelineWarnings,
  severityForEtape,
  messagesForEtape,
  type TimelineWarning,
  type WarningSeverity,
} from "../../lib/timelineWarnings";

// ─── Types ────────────────────────────────────────────────────────────────────

type EtatActuel = "EN_RECONDITIONNEMENT" | "EN_VENTE" | "VENDU" | "RECYCLE";
type TypeComposant = "ORGANE" | "PIECE";
type Qualite = "NEUF" | "BON" | "CORRECT" | "USAGE";
type TypeEtape =
  | "DECOMPOSITION"
  | "DIAGNOSTIC"
  | "NETTOYAGE"
  | "REPARATION"
  | "COMPOSITION"
  | "TEST"
  | "MISE_EN_VENTE"
  | "RECYCLAGE";
type VerdictDiagnostic = "REPARABLE" | "ENDOMMAGE" | null;

interface Etape {
  id: string;
  type: TypeEtape;
  date: string;
  description: string;
  verdict?: VerdictDiagnostic;
}

interface PieceDeclared {
  id: string;
  nom: string;
  reference: string;
  marque: string;
  modele: string;
  prix: string;
  qualite: Qualite;
  garantie: string;
  materiau: string;
  compatibilite: string;
}

interface ComposantData {
  id: string;
  nom: string;
  reference: string;
  marque: string;
  modele: string;
  categorie: string;
  typeComposant: TypeComposant;
  qualite: Qualite;
  prix: string;
  garantie: string;
  description: string;
  typeEquipement: string;
  materiau: string;
  compatibilite: string;
  etatActuel: EtatActuel;
  images: string[];
  etapes: Etape[];
  parentOrgane?: { id: string; nom: string; reference: string } | null;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_ITEM: ComposantData = {
  id: "comp-002",
  nom: "Compresseur d'air 50L",
  reference: "COMP-50L-DPT",
  marque: "Dupont",
  modele: "CA-50-10",
  categorie: "Pneumatique",
  typeComposant: "ORGANE",
  qualite: "CORRECT",
  prix: "280",
  garantie: "6",
  description:
    "Compresseur monophasé 50L, pression max 10 bar. Déposé d'un atelier de menuiserie lors d'une modernisation. État général correct.",
  typeEquipement: "PNEUMATIQUE",
  materiau: "",
  compatibilite: "",
  etatActuel: "EN_RECONDITIONNEMENT",
  images: [],
  etapes: [
    {
      id: "et-1",
      type: "NETTOYAGE",
      date: "2026-06-15",
      description: "Dépoussiérage complet, nettoyage du filtre d'air.",
    },
    {
      id: "et-2",
      type: "DIAGNOSTIC",
      date: "2026-06-16",
      description:
        "Test de pression : monte à 9,8 bar, tient 30 min. Soupape de sécurité OK. Légère usure du piston estimée à ~20%.",
      verdict: "REPARABLE",
    },
  ],
  parentOrgane: null,
};

// Blank template used when creating a new item (route id === "new").
const BLANK_ITEM: ComposantData = {
  id: "",
  nom: "",
  reference: "",
  marque: "",
  modele: "",
  categorie: "",
  typeComposant: "ORGANE",
  qualite: "BON",
  prix: "",
  garantie: "",
  description: "",
  typeEquipement: "",
  materiau: "",
  compatibilite: "",
  etatActuel: "EN_RECONDITIONNEMENT",
  images: [],
  etapes: [],
  parentOrgane: null,
};

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ETAPE_LABELS: Record<TypeEtape, string> = {
  DECOMPOSITION: "Décomposition",
  DIAGNOSTIC: "Diagnostic",
  NETTOYAGE: "Nettoyage",
  REPARATION: "Réparation",
  COMPOSITION: "Composition",
  TEST: "Test",
  MISE_EN_VENTE: "Mise en vente",
  RECYCLAGE: "Recyclage",
};

const ETAPE_COLORS: Record<TypeEtape, string> = {
  DECOMPOSITION: T.steel,
  DIAGNOSTIC: T.verdigris,
  NETTOYAGE: "#4a8fa0",
  REPARATION: T.brass,
  COMPOSITION: "#7a5ea0",
  TEST: "#3a9e7c",
  MISE_EN_VENTE: T.verdigris,
  RECYCLAGE: T.oxide,
};

const QUALITE_OPTIONS: { value: Qualite; label: string }[] = [
  { value: "NEUF", label: "Neuf" },
  { value: "BON", label: "Bon" },
  { value: "CORRECT", label: "Correct" },
  { value: "USAGE", label: "Usagé" },
];

// Soft-warning severity → colour. High reuses the destructive oxide, medium the
// brass caution tone, low the muted steel — same vocabulary as the rest of the UI.
const WARNING_COLORS: Record<WarningSeverity, string> = {
  high: T.oxide,
  medium: T.brass,
  low: T.steel,
};
const WARNING_SEVERITY_LABEL: Record<WarningSeverity, string> = {
  high: "Incohérence",
  medium: "À vérifier",
  low: "Remarque",
};

// ─── DesktopGate ──────────────────────────────────────────────────────────────

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

// ─── StateBadge ───────────────────────────────────────────────────────────────

function StateBadge({ etat }: { etat: EtatActuel }) {
  const map: Record<EtatActuel, { label: string; bg: string; color: string }> =
    {
      EN_RECONDITIONNEMENT: {
        label: "En reconditionnement",
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
      }}
    >
      {label}
    </span>
  );
}

// ─── ReferencePlate ───────────────────────────────────────────────────────────

function ReferencePlate({ reference }: { reference: string }) {
  return (
    <span
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        color: T.steel,
        background: T.atelier,
        border: `1px solid ${T.rule}`,
        borderRadius: 3,
        padding: "2px 8px",
        letterSpacing: "0.04em",
      }}
    >
      {reference}
    </span>
  );
}

// ─── Consequence message ──────────────────────────────────────────────────────

function ConsequenceBanner({ etat }: { etat: EtatActuel }) {
  const messages: Record<EtatActuel, { text: string; color: string }> = {
    EN_RECONDITIONNEMENT: {
      text: "Non visible au catalogue",
      color: T.brass,
    },
    EN_VENTE: { text: "Visible dans le catalogue", color: T.verdigris },
    VENDU: { text: "Vendu — archivé", color: T.steel },
    RECYCLE: { text: "Recyclé — retiré", color: T.oxide },
  };
  const { text, color } = messages[etat];
  return (
    <span
      style={{
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 12,
        color,
        display: "flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {text}
    </span>
  );
}

// ─── Form field helpers ───────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: T.steel,
        display: "block",
        marginBottom: 4,
      }}
    >
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  mono,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        fontFamily: mono
          ? "'IBM Plex Mono', monospace"
          : "Inter, system-ui, sans-serif",
        fontSize: 13,
        border: `1px solid ${T.rule}`,
        background: T.atelier,
        color: T.graphite,
        padding: "7px 10px",
        borderRadius: 4,
        outline: "none",
        transition: "border-color 0.15s",
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = T.verdigris)}
      onBlur={(e) => (e.currentTarget.style.borderColor = T.rule)}
    />
  );
}

// ─── TraceabilityTimeline ─────────────────────────────────────────────────────

interface TimelineProps {
  etapes: Etape[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  parentOrgane?: { id: string; nom: string; reference: string } | null;
  warnings: TimelineWarning[];
}

function TraceabilityTimeline({
  etapes,
  onEdit,
  onDelete,
  parentOrgane,
  warnings,
}: TimelineProps) {
  return (
    <div>
      {/* Parent provenance node */}
      {parentOrgane && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
            marginBottom: 4,
            opacity: 0.7,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                border: `2px solid ${T.steel}`,
                background: T.panel,
                flexShrink: 0,
              }}
            />
            <div
              style={{
                width: 1,
                flex: 1,
                minHeight: 24,
                background: T.rule,
              }}
            />
          </div>
          <div style={{ paddingBottom: 8 }}>
            <div
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: 11,
                color: T.steel,
                marginBottom: 1,
              }}
            >
              Prélevée sur
            </div>
            <div
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: 12,
                fontWeight: 500,
                color: T.graphite,
              }}
            >
              {parentOrgane.nom}
            </div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                color: T.steel,
              }}
            >
              {parentOrgane.reference}
            </div>
          </div>
        </div>
      )}

      {/* Etapes */}
      {etapes.map((etape, i) => {
        const color = ETAPE_COLORS[etape.type];
        const isLast = i === etapes.length - 1;
        return (
          <div
            key={etape.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
            }}
          >
            {/* Timeline rail */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: color,
                  flexShrink: 0,
                  marginTop: 4,
                }}
              />
              {!isLast && (
                <div
                  style={{
                    width: 1,
                    flex: 1,
                    minHeight: 32,
                    background: T.rule,
                  }}
                />
              )}
            </div>

            {/* Step card */}
            <div
              style={{
                flex: 1,
                background: T.atelier,
                border: `1px solid ${T.rule}`,
                borderRadius: 4,
                padding: "10px 12px",
                marginBottom: isLast ? 0 : 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: "Inter, system-ui, sans-serif",
                      fontSize: 12,
                      fontWeight: 600,
                      color,
                    }}
                  >
                    {ETAPE_LABELS[etape.type]}
                  </span>
                  {etape.verdict && (
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 9,
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        background:
                          etape.verdict === "REPARABLE"
                            ? `${T.verdigris}18`
                            : `${T.oxide}18`,
                        color:
                          etape.verdict === "REPARABLE" ? T.verdigris : T.oxide,
                        padding: "2px 6px",
                        borderRadius: 2,
                      }}
                    >
                      {etape.verdict === "REPARABLE" ? "Réparable" : "Endommagé"}
                    </span>
                  )}
                  {(() => {
                    const sev = severityForEtape(Number(etape.id), warnings);
                    if (!sev) return null;
                    return (
                      <span
                        title={messagesForEtape(Number(etape.id), warnings).join("\n")}
                        style={{
                          fontSize: 11,
                          lineHeight: 1,
                          color: WARNING_COLORS[sev],
                          cursor: "help",
                        }}
                        aria-label={`Avertissement : ${WARNING_SEVERITY_LABEL[sev]}`}
                      >
                        ⚠
                      </span>
                    );
                  })()}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 10,
                      color: T.steel,
                    }}
                  >
                    {new Date(etape.date).toLocaleDateString("fr-FR")}
                  </span>
                  <button
                    onClick={() => onEdit(etape.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "2px 4px",
                      color: T.steel,
                      fontSize: 11,
                    }}
                    title="Modifier"
                    aria-label="Modifier l'étape"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => onDelete(etape.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "2px 4px",
                      color: T.oxide,
                      fontSize: 11,
                    }}
                    title="Supprimer"
                    aria-label="Supprimer l'étape"
                  >
                    ×
                  </button>
                </div>
              </div>
              {etape.description && (
                <p
                  style={{
                    fontFamily: "Inter, system-ui, sans-serif",
                    fontSize: 12,
                    color: T.steel,
                    lineHeight: 1.5,
                  }}
                >
                  {etape.description}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {etapes.length === 0 && !parentOrgane && (
        <div
          style={{
            padding: "24px",
            textAlign: "center",
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 13,
            color: T.steel,
            border: `1px dashed ${T.rule}`,
            borderRadius: 4,
          }}
        >
          Aucune étape enregistrée.
        </div>
      )}
    </div>
  );
}

// ─── Step suggester logic ─────────────────────────────────────────────────────

interface SuggestedStep {
  type: TypeEtape;
  label: string;
  description: string;
  terminal?: boolean;
  terminalEffect?: string;
  warning?: string;
  verdictToggle?: boolean;
}

function getSuggestions(
  etapes: Etape[],
  typeComposant: TypeComposant
): SuggestedStep[] {
  const types = etapes.map((e) => e.type);
  const diagnostic = etapes.find((e) => e.type === "DIAGNOSTIC");
  const hasDiag = !!diagnostic;
  const verdict = diagnostic?.verdict;
  const hasReparation = types.includes("REPARATION");
  const hasTest = types.includes("TEST");
  const hasRecyclage = types.includes("RECYCLAGE");
  const hasVente = types.includes("MISE_EN_VENTE");

  if (hasVente || hasRecyclage) return [];

  const suggestions: SuggestedStep[] = [];

  if (!hasDiag) {
    if (!types.includes("NETTOYAGE")) {
      suggestions.push({
        type: "NETTOYAGE",
        label: "Nettoyage",
        description: "Nettoyer avant diagnostic.",
      });
    }
    suggestions.push({
      type: "DIAGNOSTIC",
      label: "Diagnostic",
      description: "Évaluer l'état et décider de la suite.",
      verdictToggle: true,
    });
  } else if (verdict === "REPARABLE") {
    if (!hasReparation) {
      suggestions.push({
        type: "REPARATION",
        label: "Réparation",
        description: "Corriger les défauts identifiés au diagnostic.",
      });
    }
    if (typeComposant === "ORGANE" && !types.includes("COMPOSITION")) {
      suggestions.push({
        type: "COMPOSITION",
        label: "Composition",
        description: "Assembler les pièces constitutives.",
      });
    }
    if (!hasTest) {
      suggestions.push({
        type: "TEST",
        label: "Test",
        description: "Vérifier le bon fonctionnement avant vente.",
      });
    }
    if (hasTest || hasReparation) {
      suggestions.push({
        type: "MISE_EN_VENTE",
        label: "Mise en vente",
        description: "",
        terminal: true,
        terminalEffect: "Publiera le composant au catalogue.",
      });
    }
  } else if (verdict === "ENDOMMAGE") {
    suggestions.push({
      type: "RECYCLAGE",
      label: "Recyclage",
      description: "",
      terminal: true,
      terminalEffect: "Retirera le composant (Recyclé).",
      warning:
        typeComposant === "ORGANE"
          ? "Après recyclage d'un ORGANE, vous pourrez déclarer les pièces récupérables."
          : undefined,
    });
  }

  return suggestions;
}

// ─── DeclarePiecesDialog ──────────────────────────────────────────────────────

interface DeclarePiecesDialogProps {
  parentNom: string;
  parentMarque: string;
  parentModele: string;
  parentCategorie: string;
  onConfirm: (pieces: PieceDeclared[]) => void;
  onClose: () => void;
}

function DeclarePiecesDialog({
  parentNom,
  parentMarque,
  parentModele,
  parentCategorie,
  onConfirm,
  onClose,
}: DeclarePiecesDialogProps) {
  const [pieces, setPieces] = useState<PieceDeclared[]>([
    {
      id: `p-${Date.now()}`,
      nom: "",
      reference: "",
      marque: parentMarque,
      modele: parentModele,
      prix: "",
      qualite: "BON",
      garantie: "",
      materiau: "",
      compatibilite: "",
    },
  ]);

  function addRow() {
    setPieces((prev) => [
      ...prev,
      {
        id: `p-${Date.now()}`,
        nom: "",
        reference: "",
        marque: parentMarque,
        modele: parentModele,
        prix: "",
        qualite: "BON",
        garantie: "",
        materiau: "",
        compatibilite: "",
      },
    ]);
  }

  function updateRow(id: string, field: keyof PieceDeclared, value: string) {
    setPieces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  }

  function removeRow(id: string) {
    setPieces((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(24,33,31,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: T.panel,
          border: `1px solid ${T.rule}`,
          borderRadius: 6,
          width: "min(900px, 95vw)",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
        }}
      >
        {/* Dialog header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: `1px solid ${T.rule}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: 15,
                fontWeight: 600,
                color: T.graphite,
                marginBottom: 3,
              }}
            >
              Déclarer les pièces récupérables
            </div>
            <div
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: 12,
                color: T.steel,
              }}
            >
              Organe source : {parentNom} — {parentCategorie}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              color: T.steel,
              cursor: "pointer",
              lineHeight: 1,
            }}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowY: "auto", flex: 1, padding: "16px 24px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 12,
            }}
          >
            <thead>
              <tr>
                {[
                  "Nom *",
                  "Référence *",
                  "Marque",
                  "Modèle",
                  "Prix *",
                  "Qualité *",
                  "Garantie (mois) *",
                  "Matériau *",
                  "Compatibilité *",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      fontFamily: "Inter, system-ui, sans-serif",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: T.steel,
                      padding: "6px 8px",
                      textAlign: "left",
                      background: T.atelier,
                      borderBottom: `1px solid ${T.rule}`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pieces.map((p) => (
                <tr key={p.id}>
                  {(
                    [
                      { field: "nom", placeholder: "ex. Piston" },
                      { field: "reference", placeholder: "REF-001", mono: true },
                      { field: "marque", placeholder: "" },
                      { field: "modele", placeholder: "" },
                      {
                        field: "prix",
                        placeholder: "0",
                        mono: true,
                        type: "number",
                      },
                    ] as {
                      field: keyof PieceDeclared;
                      placeholder: string;
                      mono?: boolean;
                      type?: string;
                    }[]
                  ).map(({ field, placeholder, mono }) => (
                    <td
                      key={field}
                      style={{ padding: "4px 4px", verticalAlign: "middle" }}
                    >
                      <input
                        value={String(p[field])}
                        onChange={(e) => updateRow(p.id, field, e.target.value)}
                        placeholder={placeholder}
                        style={{
                          width: "100%",
                          fontFamily: mono
                            ? "'IBM Plex Mono', monospace"
                            : "Inter, system-ui, sans-serif",
                          fontSize: 12,
                          border: `1px solid ${T.rule}`,
                          background: T.atelier,
                          color: T.graphite,
                          padding: "5px 7px",
                          borderRadius: 3,
                          outline: "none",
                          minWidth: 80,
                        }}
                      />
                    </td>
                  ))}
                  <td style={{ padding: "4px 4px", verticalAlign: "middle" }}>
                    <select
                      value={p.qualite}
                      onChange={(e) =>
                        updateRow(p.id, "qualite", e.target.value)
                      }
                      style={{
                        fontFamily: "Inter, system-ui, sans-serif",
                        fontSize: 12,
                        border: `1px solid ${T.rule}`,
                        background: T.atelier,
                        color: T.graphite,
                        padding: "5px 7px",
                        borderRadius: 3,
                        outline: "none",
                      }}
                    >
                      {QUALITE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  {(
                    [
                      { field: "garantie", placeholder: "6" },
                      { field: "materiau", placeholder: "Acier" },
                      { field: "compatibilite", placeholder: "Universel" },
                    ] as { field: keyof PieceDeclared; placeholder: string }[]
                  ).map(({ field, placeholder }) => (
                    <td
                      key={field}
                      style={{ padding: "4px 4px", verticalAlign: "middle" }}
                    >
                      <input
                        value={String(p[field])}
                        onChange={(e) => updateRow(p.id, field, e.target.value)}
                        placeholder={placeholder}
                        style={{
                          width: "100%",
                          fontFamily: "Inter, system-ui, sans-serif",
                          fontSize: 12,
                          border: `1px solid ${T.rule}`,
                          background: T.atelier,
                          color: T.graphite,
                          padding: "5px 7px",
                          borderRadius: 3,
                          outline: "none",
                          minWidth: 80,
                        }}
                      />
                    </td>
                  ))}
                  <td style={{ padding: "4px 4px", verticalAlign: "middle" }}>
                    <button
                      onClick={() => removeRow(p.id)}
                      disabled={pieces.length === 1}
                      style={{
                        background: "none",
                        border: "none",
                        color: pieces.length === 1 ? T.rule : T.oxide,
                        cursor: pieces.length === 1 ? "default" : "pointer",
                        fontSize: 16,
                        lineHeight: 1,
                      }}
                      aria-label="Supprimer la ligne"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: `1px solid ${T.rule}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <button
            onClick={addRow}
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 12,
              fontWeight: 500,
              background: "none",
              border: `1px solid ${T.rule}`,
              color: T.graphite,
              padding: "7px 14px",
              borderRadius: 4,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 14 }}>+</span> Ajouter une pièce
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: 12,
                fontWeight: 500,
                background: "none",
                border: `1px solid ${T.rule}`,
                color: T.steel,
                padding: "8px 18px",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Annuler
            </button>
            <button
              onClick={() => onConfirm(pieces)}
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: 12,
                fontWeight: 600,
                background: T.verdigris,
                border: "none",
                color: "#fff",
                padding: "8px 20px",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Créer {pieces.length} pièce{pieces.length > 1 ? "s" : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TimelineWarningsPanel ──────────────────────────────────────────────────
// Passive coherence advisor: lists soft warnings, highest severity first. It
// never blocks anything — the admin reads it and decides whether to act.

const SEVERITY_ORDER: WarningSeverity[] = ["high", "medium", "low"];

function TimelineWarningsPanel({ warnings }: { warnings: TimelineWarning[] }) {
  if (warnings.length === 0) return null;

  const sorted = [...warnings].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
  );

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: T.steel,
          marginBottom: 12,
        }}
      >
        Cohérence de la traçabilité
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map((w, i) => {
          const color = WARNING_COLORS[w.severity];
          return (
            <div
              key={`${w.code}-${i}`}
              style={{
                display: "flex",
                gap: 9,
                padding: "9px 11px",
                background: `${color}10`,
                border: `1px solid ${color}40`,
                borderRadius: 4,
              }}
            >
              <span style={{ fontSize: 12, lineHeight: 1.3, color, flexShrink: 0 }}>⚠</span>
              <div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 9,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color,
                    marginBottom: 2,
                  }}
                >
                  {WARNING_SEVERITY_LABEL[w.severity]}
                </div>
                <div
                  style={{
                    fontFamily: "Inter, system-ui, sans-serif",
                    fontSize: 12,
                    color: T.graphite,
                    lineHeight: 1.45,
                  }}
                >
                  {w.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── StepPanel ────────────────────────────────────────────────────────────────

interface StepPanelProps {
  etapes: Etape[];
  typeComposant: TypeComposant;
  onAdd: (etape: Omit<Etape, "id">) => void;
  showDeclarePieces: boolean;
  onDeclarePieces: () => void;
}

function StepPanel({
  etapes,
  typeComposant,
  onAdd,
  showDeclarePieces,
  onDeclarePieces,
}: StepPanelProps) {
  const suggestions = getSuggestions(etapes, typeComposant);
  const [selectedType, setSelectedType] = useState<TypeEtape | null>(null);
  const [customDate, setCustomDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [customDesc, setCustomDesc] = useState("");
  const [verdict, setVerdict] = useState<VerdictDiagnostic>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customType, setCustomType] = useState<TypeEtape>("DECOMPOSITION");

  const selectedSuggestion = suggestions.find((s) => s.type === selectedType);

  function handleAdd() {
    if (!selectedType) return;
    const etape: Omit<Etape, "id"> = {
      type: selectedType,
      date: customDate,
      description: customDesc,
      ...(selectedType === "DIAGNOSTIC" && verdict ? { verdict } : {}),
    };
    onAdd(etape);
    setSelectedType(null);
    setCustomDesc("");
    setVerdict(null);
  }

  function handleAddCustom() {
    const etape: Omit<Etape, "id"> = {
      type: customType,
      date: customDate,
      description: customDesc,
    };
    onAdd(etape);
    setShowCustomForm(false);
    setCustomDesc("");
  }

  if (suggestions.length === 0 && !showDeclarePieces) {
    const hasTerminal = etapes.some(
      (e) => e.type === "MISE_EN_VENTE" || e.type === "RECYCLAGE"
    );
    if (hasTerminal) {
      return (
        <div
          style={{
            padding: 16,
            background: T.atelier,
            border: `1px solid ${T.rule}`,
            borderRadius: 4,
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 13,
            color: T.steel,
            textAlign: "center",
          }}
        >
          Traçabilité complète.
        </div>
      );
    }
  }

  return (
    <div>
      <div
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: T.steel,
          marginBottom: 12,
        }}
      >
        Prochaine étape suggérée
      </div>

      {/* DeclarePieces trigger */}
      {showDeclarePieces && (
        <button
          onClick={onDeclarePieces}
          style={{
            width: "100%",
            padding: "12px 14px",
            background: `${T.verdigris}14`,
            border: `1px solid ${T.verdigris}50`,
            borderRadius: 4,
            cursor: "pointer",
            textAlign: "left",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 12,
              fontWeight: 600,
              color: T.verdigris,
            }}
          >
            Déclarer les pièces récupérables
          </span>
          <span
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 11,
              color: T.steel,
            }}
          >
            Cet organe recyclé peut fournir des pièces.
          </span>
        </button>
      )}

      {/* Suggestions */}
      {suggestions.map((s) => (
        <div
          key={s.type}
          onClick={() => {
            setSelectedType(selectedType === s.type ? null : s.type);
            setCustomDesc(s.description);
          }}
          style={{
            border: `1px solid ${selectedType === s.type ? ETAPE_COLORS[s.type] : T.rule}`,
            borderRadius: 4,
            padding: "10px 12px",
            marginBottom: 8,
            cursor: "pointer",
            background:
              selectedType === s.type
                ? `${ETAPE_COLORS[s.type]}0e`
                : T.atelier,
            transition: "border-color 0.15s, background 0.15s",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: 12,
                fontWeight: 600,
                color: ETAPE_COLORS[s.type],
              }}
            >
              {s.label}
            </span>
            {s.terminal && (
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 9,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: T.steel,
                }}
              >
                Terminal
              </span>
            )}
          </div>
          {s.description && (
            <div
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: 11,
                color: T.steel,
                marginTop: 2,
              }}
            >
              {s.description}
            </div>
          )}
          {s.terminalEffect && (
            <div
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: 11,
                color: s.type === "RECYCLAGE" ? T.oxide : T.verdigris,
                marginTop: 4,
                fontWeight: 500,
              }}
            >
              → {s.terminalEffect}
            </div>
          )}
          {s.warning && (
            <div
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: 11,
                color: T.brass,
                marginTop: 4,
                padding: "4px 8px",
                background: `${T.brass}10`,
                borderRadius: 3,
                border: `1px solid ${T.brass}30`,
              }}
            >
              {s.warning}
            </div>
          )}
        </div>
      ))}

      {/* Verdict toggle for DIAGNOSTIC */}
      {selectedSuggestion?.verdictToggle && selectedType === "DIAGNOSTIC" && (
        <div
          style={{
            background: T.panel,
            border: `1px solid ${T.rule}`,
            borderRadius: 4,
            padding: "10px 12px",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 11,
              color: T.steel,
              marginBottom: 8,
            }}
          >
            Verdict du diagnostic
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {(
              [
                { v: "REPARABLE", label: "Réparable", color: T.verdigris },
                { v: "ENDOMMAGE", label: "Endommagé", color: T.oxide },
              ] as { v: VerdictDiagnostic; label: string; color: string }[]
            ).map(({ v, label, color }) => (
              <button
                key={String(v)}
                onClick={() => setVerdict(verdict === v ? null : v)}
                style={{
                  flex: 1,
                  padding: "7px 0",
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontSize: 12,
                  fontWeight: 500,
                  border: `1px solid ${verdict === v ? color : T.rule}`,
                  background: verdict === v ? `${color}18` : T.atelier,
                  color: verdict === v ? color : T.steel,
                  borderRadius: 4,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Expanded add form for selected suggestion */}
      {selectedType && (
        <div
          style={{
            background: T.panel,
            border: `1px solid ${T.rule}`,
            borderRadius: 4,
            padding: "12px",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div>
              <FieldLabel>Date</FieldLabel>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                style={{
                  width: "100%",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  border: `1px solid ${T.rule}`,
                  background: T.atelier,
                  color: T.graphite,
                  padding: "6px 8px",
                  borderRadius: 4,
                  outline: "none",
                }}
              />
            </div>
            <div>
              <FieldLabel>Description</FieldLabel>
              <textarea
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                rows={2}
                style={{
                  width: "100%",
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontSize: 12,
                  border: `1px solid ${T.rule}`,
                  background: T.atelier,
                  color: T.graphite,
                  padding: "6px 8px",
                  borderRadius: 4,
                  outline: "none",
                  resize: "vertical",
                  minHeight: 52,
                }}
              />
            </div>
          </div>
          <button
            onClick={handleAdd}
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 12,
              fontWeight: 600,
              background: ETAPE_COLORS[selectedType],
              color: "#fff",
              border: "none",
              padding: "8px 20px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Ajouter
          </button>
        </div>
      )}

      {/* Autre étape */}
      <div style={{ marginTop: 8 }}>
        <button
          onClick={() => setShowCustomForm(!showCustomForm)}
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 11,
            color: T.steel,
            background: "none",
            border: `1px dashed ${T.rule}`,
            borderRadius: 4,
            padding: "6px 14px",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Autre étape…
        </button>
        {showCustomForm && (
          <div
            style={{
              marginTop: 8,
              background: T.panel,
              border: `1px solid ${T.rule}`,
              borderRadius: 4,
              padding: 12,
            }}
          >
            <div style={{ display: "grid", gap: 8, marginBottom: 10 }}>
              <div>
                <FieldLabel>Type</FieldLabel>
                <select
                  value={customType}
                  onChange={(e) =>
                    setCustomType(e.target.value as TypeEtape)
                  }
                  style={{
                    fontFamily: "Inter, system-ui, sans-serif",
                    fontSize: 12,
                    border: `1px solid ${T.rule}`,
                    background: T.atelier,
                    color: T.graphite,
                    padding: "6px 8px",
                    borderRadius: 4,
                    outline: "none",
                    width: "100%",
                  }}
                >
                  {(Object.keys(ETAPE_LABELS) as TypeEtape[]).map((k) => (
                    <option key={k} value={k}>
                      {ETAPE_LABELS[k]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>Date</FieldLabel>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12,
                    border: `1px solid ${T.rule}`,
                    background: T.atelier,
                    color: T.graphite,
                    padding: "6px 8px",
                    borderRadius: 4,
                    outline: "none",
                    width: "100%",
                  }}
                />
              </div>
              <div>
                <FieldLabel>Description</FieldLabel>
                <textarea
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    fontFamily: "Inter, system-ui, sans-serif",
                    fontSize: 12,
                    border: `1px solid ${T.rule}`,
                    background: T.atelier,
                    color: T.graphite,
                    padding: "6px 8px",
                    borderRadius: 4,
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>
            <button
              onClick={handleAddCustom}
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: 12,
                fontWeight: 600,
                background: T.steel,
                color: "#fff",
                border: "none",
                padding: "7px 16px",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Ajouter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ImageUpload ──────────────────────────────────────────────────────────────

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

function ImageUpload({ images, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMut = useUploadImages();
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    // Reset input so the same file can be re-selected after this run.
    if (inputRef.current) inputRef.current.value = "";
    if (files.length === 0) return;

    setUploadError(null);
    // Upload to the backend (→ Cloudinary); store the returned URLs.
    uploadMut.mutate(
      { files, folder: "composants" },
      {
        onSuccess: (urls) => onChange([...images, ...urls]),
        onError: (err: unknown) =>
          setUploadError((err as { message?: string })?.message ?? "Échec du téléversement des photos."),
      },
    );
  };

  const uploading = uploadMut.isPending;
  const removeImage = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <FieldLabel>Photos</FieldLabel>

      {images.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {images.map((src, i) => (
            <div
              key={`${src}-${i}`}
              style={{
                position: "relative",
                width: 84,
                height: 84,
                borderRadius: 4,
                overflow: "hidden",
                border: `1px solid ${T.rule}`,
                background: T.atelier,
                flexShrink: 0,
              }}
            >
              <img
                src={src}
                alt={`Photo ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                aria-label={`Supprimer la photo ${i + 1}`}
                style={{
                  position: "absolute",
                  top: 3,
                  right: 3,
                  background: "rgba(24,33,31,0.7)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                  fontSize: 11,
                  lineHeight: 1,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={{
          background: T.atelier,
          border: `1px dashed ${T.rule}`,
          borderRadius: 4,
          padding: "12px 16px",
          cursor: uploading ? "wait" : "pointer",
          opacity: uploading ? 0.6 : 1,
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 13,
          color: T.steel,
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
        }}
        onMouseEnter={(e) => {
          if (uploading) return;
          e.currentTarget.style.borderColor = T.verdigris;
          e.currentTarget.style.color = T.verdigris;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = T.rule;
          e.currentTarget.style.color = T.steel;
        }}
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
        {uploading ? "Téléversement…" : "Ajouter des photos"}
      </button>

      {uploadError && (
        <span style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 12, color: T.oxide }}>
          {uploadError}
        </span>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        style={{ display: "none" }}
        aria-hidden="true"
      />
    </div>
  );
}

// ─── AttributsTab ─────────────────────────────────────────────────────────────

interface AttributsTabProps {
  item: ComposantData;
  onUpdate: (updates: Partial<ComposantData>) => void;
  onSave: () => void;
  error?: string | null;
  readOnly?: boolean;
}

function AttributsTab({ item, onUpdate, onSave, error, readOnly = false }: AttributsTabProps) {
  return (
    <div style={{ padding: "24px 32px", maxWidth: 720 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px 24px",
          marginBottom: 20,
          // Frozen sold item: visibly inert until the admin enters correction mode.
          pointerEvents: readOnly ? "none" : "auto",
          opacity: readOnly ? 0.55 : 1,
        }}
      >
        <div>
          <FieldLabel>Nom</FieldLabel>
          <TextInput
            value={item.nom}
            onChange={(v) => onUpdate({ nom: v })}
            placeholder="Nom du composant"
          />
        </div>
        <div>
          <FieldLabel>Référence</FieldLabel>
          <TextInput
            value={item.reference}
            onChange={(v) => onUpdate({ reference: v })}
            placeholder="REF-001"
            mono
          />
        </div>
        <div>
          <FieldLabel>Marque</FieldLabel>
          <TextInput
            value={item.marque}
            onChange={(v) => onUpdate({ marque: v })}
            placeholder="Fabricant"
          />
        </div>
        <div>
          <FieldLabel>Modèle</FieldLabel>
          <TextInput
            value={item.modele}
            onChange={(v) => onUpdate({ modele: v })}
            placeholder="Référence fabricant"
            mono
          />
        </div>
        <div>
          <FieldLabel>Catégorie</FieldLabel>
          <TextInput
            value={item.categorie}
            onChange={(v) => onUpdate({ categorie: v })}
            placeholder="ex. Hydraulique"
          />
        </div>

        {/* Type composant segmented control */}
        <div>
          <FieldLabel>Type</FieldLabel>
          <div
            style={{
              display: "flex",
              border: `1px solid ${T.rule}`,
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            {(["ORGANE", "PIECE"] as TypeComposant[]).map((t) => (
              <button
                key={t}
                onClick={() => onUpdate({ typeComposant: t })}
                style={{
                  flex: 1,
                  padding: "7px 0",
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontSize: 12,
                  fontWeight: item.typeComposant === t ? 600 : 400,
                  border: "none",
                  background:
                    item.typeComposant === t ? T.graphite : T.atelier,
                  color: item.typeComposant === t ? "#fff" : T.steel,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {t === "ORGANE" ? "Organe" : "Pièce"}
              </button>
            ))}
          </div>
        </div>

        {/* Qualite */}
        <div>
          <FieldLabel>Qualité</FieldLabel>
          <div style={{ display: "flex", gap: 6 }}>
            {QUALITE_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => onUpdate({ qualite: o.value })}
                style={{
                  flex: 1,
                  padding: "6px 0",
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontSize: 11,
                  fontWeight: item.qualite === o.value ? 600 : 400,
                  border: `1px solid ${item.qualite === o.value ? T.verdigris : T.rule}`,
                  background:
                    item.qualite === o.value
                      ? `${T.verdigris}14`
                      : T.atelier,
                  color: item.qualite === o.value ? T.verdigris : T.steel,
                  borderRadius: 4,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Prix (€)</FieldLabel>
          <TextInput
            value={item.prix}
            onChange={(v) => onUpdate({ prix: v })}
            placeholder="0"
            mono
          />
        </div>
        <div>
          <FieldLabel>Garantie (mois)</FieldLabel>
          <TextInput
            value={item.garantie}
            onChange={(v) => onUpdate({ garantie: v })}
            placeholder="6"
            mono
          />
        </div>

        {/* ORGANE-specific */}
        {item.typeComposant === "ORGANE" && (
          <div>
            <FieldLabel>Type d'équipement</FieldLabel>
            <TextInput
              value={item.typeEquipement}
              onChange={(v) => onUpdate({ typeEquipement: v })}
              placeholder="ex. PNEUMATIQUE"
              mono
            />
          </div>
        )}

        {/* PIECE-specific */}
        {item.typeComposant === "PIECE" && (
          <>
            <div>
              <FieldLabel>Matériau</FieldLabel>
              <TextInput
                value={item.materiau}
                onChange={(v) => onUpdate({ materiau: v })}
                placeholder="ex. Acier inoxydable"
              />
            </div>
            <div>
              <FieldLabel>Compatibilité</FieldLabel>
              <TextInput
                value={item.compatibilite}
                onChange={(v) => onUpdate({ compatibilite: v })}
                placeholder="ex. Bosch 0124655xxx"
              />
            </div>
          </>
        )}
      </div>

      {/* Description */}
      <div style={{ marginBottom: 24, pointerEvents: readOnly ? "none" : "auto", opacity: readOnly ? 0.55 : 1 }}>
        <FieldLabel>Description</FieldLabel>
        <textarea
          value={item.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          rows={4}
          placeholder="Description détaillée du composant…"
          style={{
            width: "100%",
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 13,
            border: `1px solid ${T.rule}`,
            background: T.atelier,
            color: T.graphite,
            padding: "8px 10px",
            borderRadius: 4,
            outline: "none",
            resize: "vertical",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = T.verdigris)}
          onBlur={(e) => (e.currentTarget.style.borderColor = T.rule)}
        />
      </div>

      {/* Photos */}
      <div style={{ marginBottom: 24, pointerEvents: readOnly ? "none" : "auto", opacity: readOnly ? 0.55 : 1 }}>
        <ImageUpload
          images={item.images}
          onChange={(imgs) => onUpdate({ images: imgs })}
        />
      </div>

      {error && (
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 12,
            color: T.oxide,
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      <button
        onClick={onSave}
        disabled={readOnly}
        title={readOnly ? "Article vendu — entrez en mode correction pour modifier." : undefined}
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 600,
          background: readOnly ? T.steel : T.verdigris,
          color: "#fff",
          border: "none",
          padding: "10px 28px",
          borderRadius: 4,
          cursor: readOnly ? "not-allowed" : "pointer",
          opacity: readOnly ? 0.6 : 1,
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!readOnly) (e.currentTarget as HTMLButtonElement).style.opacity = "0.88";
        }}
        onMouseLeave={(e) => {
          if (!readOnly) (e.currentTarget as HTMLButtonElement).style.opacity = "1";
        }}
      >
        Enregistrer
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

// ─── API ⇄ local mapping helpers ────────────────────────────────────────────
const QUALITE_API_TO_LOCAL: Record<string, Qualite> = {
  COMME_NEUF: "NEUF", TRES_BON: "BON", BON: "BON", CORRECT: "CORRECT",
};
const QUALITE_LOCAL_TO_API: Record<Qualite, string> = {
  NEUF: "COMME_NEUF", BON: "BON", CORRECT: "CORRECT", USAGE: "CORRECT",
};
// The local TypeEtape now mirrors the backend enum exactly, so the mapping is a
// straight pass-through. Kept as named helpers so the API⇄local boundary stays
// explicit at the call sites.
function etapeApiToLocal(t: ApiTypeEtape): TypeEtape {
  return t as TypeEtape;
}
function etapeLocalToApi(t: TypeEtape): ApiTypeEtape {
  return t as ApiTypeEtape;
}

// ─── Sold-item freeze: lock banner + correction-reason dialog ───────────────

function SoldLockBanner({
  unlocked,
  motif,
  onEnter,
  onExit,
}: {
  unlocked: boolean;
  motif: string | null;
  onEnter: () => void;
  onExit: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        margin: "0 40px 14px",
        borderRadius: 4,
        border: `1px solid ${unlocked ? T.oxide : T.rule}`,
        background: unlocked ? `${T.oxide}10` : `${T.steel}10`,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <span style={{ fontSize: 16 }}>{unlocked ? "✎" : "🔒"}</span>
      <div style={{ flex: 1, fontSize: 12.5, color: T.graphite, lineHeight: 1.4 }}>
        {unlocked ? (
          <>
            <strong>Mode correction actif.</strong> Chaque modification de cet article
            vendu est enregistrée dans le journal d'audit.
            {motif && (
              <div style={{ color: T.steel, marginTop: 2 }}>Motif : « {motif} »</div>
            )}
          </>
        ) : (
          <>
            <strong>Article vendu — traçabilité verrouillée.</strong> Un client possède
            cet article. Pour corriger une erreur, passez en mode correction (un motif
            est requis et l'action est auditée).
          </>
        )}
      </div>
      <button
        onClick={unlocked ? onExit : onEnter}
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 12,
          fontWeight: 600,
          background: unlocked ? "none" : T.oxide,
          color: unlocked ? T.steel : "#fff",
          border: unlocked ? `1px solid ${T.rule}` : "none",
          padding: "7px 16px",
          borderRadius: 4,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {unlocked ? "Terminer la correction" : "Apporter une correction"}
      </button>
    </div>
  );
}

function MotifDialog({
  onConfirm,
  onClose,
}: {
  onConfirm: (motif: string) => void;
  onClose: () => void;
}) {
  const [motif, setMotif] = useState("");
  const trimmed = motif.trim();
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.panel,
          borderRadius: 6,
          padding: 24,
          width: 440,
          maxWidth: "90vw",
          fontFamily: "Inter, system-ui, sans-serif",
          boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, color: T.graphite, marginBottom: 6 }}>
          Corriger un article vendu
        </div>
        <div style={{ fontSize: 12.5, color: T.steel, lineHeight: 1.45, marginBottom: 14 }}>
          Cet article appartient à un client. Indiquez le motif de la correction — il
          sera consigné dans le journal d'audit avec votre identité.
        </div>
        <textarea
          autoFocus
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          rows={3}
          placeholder="ex. Erreur de saisie sur la garantie, corrigée à la demande du client"
          style={{
            width: "100%",
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 13,
            border: `1px solid ${T.rule}`,
            background: T.atelier,
            color: T.graphite,
            padding: "8px 10px",
            borderRadius: 4,
            outline: "none",
            resize: "vertical",
            marginBottom: 16,
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              fontSize: 12.5,
              fontWeight: 500,
              color: T.steel,
              background: "none",
              border: `1px solid ${T.rule}`,
              padding: "8px 16px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Annuler
          </button>
          <button
            onClick={() => trimmed && onConfirm(trimmed)}
            disabled={!trimmed}
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: "#fff",
              background: trimmed ? T.oxide : T.steel,
              border: "none",
              padding: "8px 18px",
              borderRadius: 4,
              cursor: trimmed ? "pointer" : "not-allowed",
              opacity: trimmed ? 1 : 0.6,
            }}
          >
            Activer le mode correction
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit-étape dialog ──────────────────────────────────────────────────────
// Inline editor for an existing timeline step: type, date, description and (for
// DIAGNOSTIC) the verdict. The verdict is parsed from / written back into the
// description prefix `[REPARABLE] …` / `[ENDOMMAGE] …` to match how steps are
// created (BR-08).
function parseVerdict(description: string): { verdict: VerdictDiagnostic; text: string } {
  const m = description.match(/^\[(REPARABLE|ENDOMMAGE)\]\s?(.*)$/s);
  if (m) return { verdict: m[1] as VerdictDiagnostic, text: m[2] };
  return { verdict: null, text: description };
}

function EditEtapeDialog({
  etape,
  onSave,
  onClose,
}: {
  etape: Etape;
  onSave: (updated: Etape) => void;
  onClose: () => void;
}) {
  const initial = parseVerdict(etape.description);
  const [type, setType] = useState<TypeEtape>(etape.type);
  const [date, setDate] = useState(etape.date ? etape.date.split("T")[0] : "");
  const [description, setDescription] = useState(initial.text);
  const [verdict, setVerdict] = useState<VerdictDiagnostic>(etape.verdict ?? initial.verdict);

  function handleSave() {
    onSave({
      ...etape,
      type,
      date,
      description,
      verdict: type === "DIAGNOSTIC" ? verdict : null,
    });
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.panel,
          borderRadius: 6,
          padding: 24,
          width: 480,
          maxWidth: "90vw",
          fontFamily: "Inter, system-ui, sans-serif",
          boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, color: T.graphite, marginBottom: 14 }}>
          Modifier l'étape
        </div>

        <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
          <div>
            <FieldLabel>Type</FieldLabel>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TypeEtape)}
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: 12,
                border: `1px solid ${T.rule}`,
                background: T.atelier,
                color: T.graphite,
                padding: "6px 8px",
                borderRadius: 4,
                outline: "none",
                width: "100%",
              }}
            >
              {(Object.keys(ETAPE_LABELS) as TypeEtape[]).map((k) => (
                <option key={k} value={k}>
                  {ETAPE_LABELS[k]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel>Date</FieldLabel>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12,
                border: `1px solid ${T.rule}`,
                background: T.atelier,
                color: T.graphite,
                padding: "6px 8px",
                borderRadius: 4,
                outline: "none",
                width: "100%",
              }}
            />
          </div>

          {type === "DIAGNOSTIC" && (
            <div>
              <FieldLabel>Verdict</FieldLabel>
              <div style={{ display: "flex", gap: 8 }}>
                {(
                  [
                    { v: "REPARABLE", label: "Réparable", color: T.verdigris },
                    { v: "ENDOMMAGE", label: "Endommagé", color: T.oxide },
                  ] as { v: VerdictDiagnostic; label: string; color: string }[]
                ).map(({ v, label, color }) => (
                  <button
                    key={String(v)}
                    onClick={() => setVerdict(verdict === v ? null : v)}
                    style={{
                      flex: 1,
                      padding: "7px 0",
                      fontFamily: "Inter, system-ui, sans-serif",
                      fontSize: 12,
                      fontWeight: 500,
                      border: `1px solid ${verdict === v ? color : T.rule}`,
                      background: verdict === v ? `${color}18` : T.atelier,
                      color: verdict === v ? color : T.steel,
                      borderRadius: 4,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <FieldLabel>Description</FieldLabel>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: 12,
                border: `1px solid ${T.rule}`,
                background: T.atelier,
                color: T.graphite,
                padding: "6px 8px",
                borderRadius: 4,
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              fontSize: 12.5,
              fontWeight: 500,
              color: T.steel,
              background: "none",
              border: `1px solid ${T.rule}`,
              padding: "8px 16px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: "#fff",
              background: ETAPE_COLORS[type],
              border: "none",
              padding: "8px 18px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ItemEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const composantId = Number(id);
  const isValidId = Number.isFinite(composantId) && composantId > 0;
  const isNotFound = !isNew && !isValidId; // e.g. /admin/inventaire/abc or /0

  const { data: composant, isLoading } = useComposant(composantId);
  const { data: etapesData } = useEtapes(composantId);
  const { data: categoriesData } = useCategories();
  const updateMut = useUpdateComposant();
  const createMut = useCreateComposant();
  const createEtapeMut = useCreateEtape();
  const updateEtapeMut = useUpdateEtape();
  const deleteEtapeMut = useDeleteEtape();
  const reorderMut = useReorderEtape();
  const declarePiecesMut = useDeclarePieces();

  const [item, setItem] = useState<ComposantData>(isNew ? BLANK_ITEM : MOCK_ITEM);
  const [activeTab, setActiveTab] = useState<"attributs" | "tracabilite">(
    "attributs"
  );
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showDeclarePieces, setShowDeclarePieces] = useState(false);
  const [editingEtapeId, setEditingEtapeId] = useState<string | null>(null);

  // ── Sold-item freeze ──────────────────────────────────────────────────────
  // A VENDU composant is locked. Entering "correction mode" captures a motif
  // that is attached (override + motif) to every edit until the admin exits, so
  // each change lands in the backend audit log.
  const isSold = item.etatActuel === "VENDU";
  const [correctionMotif, setCorrectionMotif] = useState<string | null>(null);
  const [showMotifDialog, setShowMotifDialog] = useState(false);
  const locked = isSold && !correctionMotif;
  const overrideArgs = () =>
    isSold && correctionMotif ? { override: true, motif: correctionMotif } : {};
  // Safety net: if an edit is rejected because the item is (now) sold, drop into
  // correction mode by prompting for a motif instead of showing a raw error.
  const isSoldConflict = (e: unknown) => (e as { code?: string })?.code === "COMPOSANT_VENDU";

  const categories = categoriesData ?? [];
  const catLibelle = (cid?: number | null) =>
    cid != null ? categories.find((c) => c.id === cid)?.libelle ?? "" : "";
  const catId = (libelle: string) =>
    categories.find((c) => c.libelle.toLowerCase() === libelle.trim().toLowerCase())?.id;

  // Load editable attribute fields once; re-sync server-derived state thereafter.
  const loadedRef = useRef(false);
  useEffect(() => {
    if (isNew || !composant) return;
    // After the first load, only re-sync server-derived state. The ref flip must
    // live OUTSIDE the updater: StrictMode invokes updaters twice in dev, and a
    // ref mutation inside would make the 2nd call take the wrong branch and keep
    // the initial MOCK_ITEM (an ORGANE) instead of the fetched item.
    if (loadedRef.current) {
      setItem((prev) => ({ ...prev, etatActuel: composant.etatActuel }));
      return;
    }
    loadedRef.current = true;
    setItem((prev) => {
      return {
        id: String(composant.id),
        nom: composant.nom,
        reference: composant.reference,
        marque: composant.marque ?? "",
        modele: composant.modele ?? "",
        categorie: catLibelle(composant.categorieId),
        typeComposant: composant.typeComposant,
        qualite: composant.qualite ? QUALITE_API_TO_LOCAL[composant.qualite] ?? "USAGE" : "USAGE",
        prix: String(composant.prix ?? ""),
        garantie: String(composant.garantie ?? ""),
        description: composant.description ?? "",
        typeEquipement: (composant as { typeEquipement?: string }).typeEquipement ?? "",
        materiau: (composant as { materiau?: string }).materiau ?? "",
        compatibilite: (composant as { compatibilite?: string }).compatibilite ?? "",
        etatActuel: composant.etatActuel,
        images: composant.images ?? [],
        etapes: prev.etapes,
        parentOrgane: null,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composant, categoriesData]);

  // Étapes are persisted immediately, so always mirror the server timeline.
  useEffect(() => {
    if (isNew || !etapesData) return;
    setItem((prev) => ({
      ...prev,
      etapes: etapesData.map((e) => {
        // BR-08: a DIAGNOSTIC verdict is stored as a `[REPARABLE] …` prefix in
        // the description — split it back out so the badge and the next-step
        // suggestions (which read diagnostic.verdict) work on persisted data.
        const { verdict, text } = parseVerdict(e.description);
        return {
          id: String(e.id),
          type: etapeApiToLocal(e.type),
          date: e.date,
          description: text,
          verdict: e.type === "DIAGNOSTIC" ? verdict : null,
        };
      }),
    }));
  }, [etapesData, isNew]);

  const hasRecyclage =
    item.typeComposant === "ORGANE" &&
    item.etapes.some((e) => e.type === "RECYCLAGE");

  // Soft coherence warnings, derived from the RAW API étapes (backend enum
  // intact — not the lossy local copy). Purely advisory; never gates an edit.
  const timelineWarnings = useMemo(
    () => getTimelineWarnings(etapesData ?? [], item.typeComposant),
    [etapesData, item.typeComposant],
  );

  function handleUpdate(updates: Partial<ComposantData>) {
    setItem((prev) => ({ ...prev, ...updates }));
    setSaved(false);
  }

  function handleSave() {
    const baseInput = {
      typeComposant: item.typeComposant,
      nom: item.nom,
      reference: item.reference,
      marque: item.marque,
      modele: item.modele,
      categorieId: catId(item.categorie),
      qualite: QUALITE_LOCAL_TO_API[item.qualite],
      garantie: item.garantie ? Number(item.garantie) : undefined,
      images: item.images,
      description: item.description,
      typeEquipement: item.typeComposant === "ORGANE" ? item.typeEquipement : undefined,
      materiau: item.typeComposant === "PIECE" ? item.materiau : undefined,
      compatibilite: item.typeComposant === "PIECE" ? item.compatibilite : undefined,
    };

    if (isNew) {
      // Backend requires nom, reference and a valid prix on creation.
      const prixNum = Number(item.prix);
      if (!item.nom.trim() || !item.reference.trim() || item.prix === "" || Number.isNaN(prixNum) || prixNum < 0) {
        setFormError("Nom, référence et prix sont obligatoires.");
        return;
      }
      setFormError(null);
      createMut.mutate(
        { ...baseInput, prix: prixNum },
        {
          onSuccess: (created) => {
            window.location.href = `/admin/inventaire/${created.id}`;
          },
          onError: (e: unknown) =>
            setFormError((e as { message?: string })?.message ?? "Échec de l'enregistrement."),
        },
      );
      return;
    }

    updateMut.mutate(
      {
        id: composantId,
        input: { ...baseInput, prix: item.prix ? Number(item.prix) : undefined, ...overrideArgs() },
      },
      {
        onSuccess: () => {
          setSaved(true);
          setFormError(null);
          setTimeout(() => setSaved(false), 2500);
        },
        onError: (e: unknown) => {
          if (isSoldConflict(e)) {
            setShowMotifDialog(true);
            return;
          }
          setFormError((e as { message?: string })?.message ?? "Échec de l'enregistrement.");
        },
      },
    );
  }

  // A locked (sold, not yet in correction mode) item prompts for a motif instead
  // of mutating — so the timeline actions can't silently no-op.
  function onSoldEdit(e: unknown) {
    if (isSoldConflict(e)) setShowMotifDialog(true);
  }

  function handleAddEtape(etape: Omit<Etape, "id">) {
    if (locked) { setShowMotifDialog(true); return; }
    // BR-08: a DIAGNOSTIC verdict is carried in the description text.
    const description = etape.verdict ? `[${etape.verdict}] ${etape.description}` : etape.description;
    createEtapeMut.mutate(
      {
        composantId,
        input: { type: etapeLocalToApi(etape.type), date: etape.date, description, ...overrideArgs() },
      },
      { onError: onSoldEdit },
    );
  }

  function handleDeleteEtape(id: string) {
    if (locked) { setShowMotifDialog(true); return; }
    deleteEtapeMut.mutate({ etapeId: Number(id), ...overrideArgs() }, { onError: onSoldEdit });
  }

  function handleEditEtape(id: string) {
    if (locked) { setShowMotifDialog(true); return; }
    setEditingEtapeId(id);
  }

  function handleEditEtapeSave(updated: Etape) {
    if (locked) { setShowMotifDialog(true); return; }
    // BR-08: a DIAGNOSTIC verdict is carried in the description text.
    const description = updated.verdict
      ? `[${updated.verdict}] ${updated.description}`
      : updated.description;
    updateEtapeMut.mutate(
      {
        etapeId: Number(updated.id),
        input: { type: etapeLocalToApi(updated.type), date: updated.date, description, ...overrideArgs() },
      },
      {
        onSuccess: () => setEditingEtapeId(null),
        onError: onSoldEdit,
      },
    );
  }

  function handleReorder(from: number, to: number) {
    const target = item.etapes[from];
    if (!target || from === to) return;
    if (locked) { setShowMotifDialog(true); return; }
    reorderMut.mutate(
      { etapeId: Number(target.id), direction: to < from ? "up" : "down", ...overrideArgs() },
      { onError: onSoldEdit },
    );
  }

  function handleDeclarePiecesConfirm(pieces: PieceDeclared[]) {
    setShowDeclarePieces(false);
    declarePiecesMut.mutate({
      parentId: composantId,
      pieces: pieces.map((p) => ({
        nom: p.nom,
        reference: p.reference,
        marque: p.marque,
        modele: p.modele,
        prix: p.prix ? Number(p.prix) : 0,
        garantie: p.garantie ? Number(p.garantie) : 0,
        qualite: QUALITE_LOCAL_TO_API[p.qualite],
        materiau: p.materiau,
        compatibilite: p.compatibilite,
        categorieId: catId(item.categorie),
      })),
    });
  }

  const centered = (children: React.ReactNode) => (
    <DesktopGate>
      <div style={{ padding: 64, textAlign: "center", color: T.steel, fontFamily: "Inter, system-ui, sans-serif" }}>
        {children}
      </div>
    </DesktopGate>
  );

  const notFound = centered(
    <div>
      <div style={{ marginBottom: 16 }}>Article introuvable.</div>
      <button
        className="back-btn"
        onClick={() => (window.location.href = "/admin/inventaire")}
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 600,
          background: T.verdigris,
          color: "#fff",
          border: "none",
          padding: "8px 20px",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        ← Retour à l'inventaire
      </button>
    </div>
  );

  if (isNotFound) return notFound;
  if (!isNew && isLoading) return centered("Chargement…");
  if (!isNew && !composant) return notFound;

  const tabs = isNew
    ? [{ key: "attributs" as const, label: "Attributs" }]
    : [
        { key: "attributs" as const, label: "Attributs" },
        { key: "tracabilite" as const, label: "Traçabilité" },
      ];

  return (
    <DesktopGate>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .editor-root {
          background: ${T.atelier};
          min-height: 100vh;
          font-family: Inter, system-ui, sans-serif;
          color: ${T.graphite};
        }

        .editor-header {
          background: ${T.panel};
          border-bottom: 1px solid ${T.rule};
          padding: 20px 40px 0;
        }

        .editor-header-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 14px;
          gap: 20px;
        }

        .editor-nom {
          font-family: Inter, system-ui, sans-serif;
          font-size: 18px;
          font-weight: 600;
          color: ${T.graphite};
          margin-bottom: 6px;
        }

        .editor-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .back-btn {
          font-family: Inter, system-ui, sans-serif;
          font-size: 12px;
          color: ${T.steel};
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0;
          margin-bottom: 12px;
          transition: color 0.15s;
        }

        .back-btn:hover { color: ${T.graphite}; }

        .tab-row { display: flex; gap: 0; }

        .tab-btn {
          font-family: Inter, system-ui, sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: ${T.steel};
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          padding: 8px 18px;
          cursor: pointer;
        }

        .tab-btn:hover { color: ${T.graphite}; }
        .tab-btn.active { color: ${T.graphite}; border-bottom-color: ${T.verdigris}; font-weight: 600; }

        .trace-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 0;
          min-height: calc(100vh - 120px);
        }

        .trace-left {
          padding: 24px 32px;
          border-right: 1px solid ${T.rule};
          overflow-y: auto;
        }

        .trace-right {
          padding: 24px 24px;
          background: ${T.panel};
          overflow-y: auto;
        }

        .section-title {
          font-family: Inter, system-ui, sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: ${T.steel};
          margin-bottom: 16px;
        }

        .save-toast {
          position: fixed;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          background: ${T.verdigris};
          color: #fff;
          font-family: Inter, system-ui, sans-serif;
          font-size: 13px;
          font-weight: 500;
          padding: 10px 20px;
          border-radius: 4px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
          z-index: 9999;
          animation: fadeInUp 0.2s ease;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <div className="editor-root">
        {/* Header */}
        <div className="editor-header">
          <button
            className="back-btn"
            onClick={() => (window.location.href = "/admin/inventaire")}
          >
            ← Inventaire
          </button>
          <div className="editor-header-top">
            <div>
              <div className="editor-nom">{item.nom || (isNew ? "Nouvel article" : "")}</div>
              <div className="editor-meta">
                {item.reference && <ReferencePlate reference={item.reference} />}
                <StateBadge etat={item.etatActuel} />
                <ConsequenceBanner etat={item.etatActuel} />
              </div>
            </div>
          </div>
          <div className="tab-row">
            {tabs.map((t) => (
              <button
                key={t.key}
                className={`tab-btn${activeTab === t.key ? " active" : ""}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sold-item freeze banner */}
        {!isNew && isSold && (
          <div style={{ paddingTop: 14 }}>
            <SoldLockBanner
              unlocked={!locked}
              motif={correctionMotif}
              onEnter={() => setShowMotifDialog(true)}
              onExit={() => setCorrectionMotif(null)}
            />
          </div>
        )}

        {/* Tab content */}
        {activeTab === "attributs" ? (
          <AttributsTab item={item} onUpdate={handleUpdate} onSave={handleSave} error={formError} readOnly={locked} />
        ) : isNew ? (
          <div style={{ padding: "24px 32px", maxWidth: 720 }}>
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: 13,
                color: T.steel,
                border: `1px dashed ${T.rule}`,
                borderRadius: 4,
              }}
            >
              Enregistrez d'abord l'article pour suivre sa traçabilité.
            </div>
          </div>
        ) : (
          <div className="trace-layout">
            {/* Left: timeline */}
            <div
              className="trace-left"
              style={{ pointerEvents: locked ? "none" : "auto", opacity: locked ? 0.55 : 1 }}
            >
              <div className="section-title">Historique</div>
              <TraceabilityTimeline
                etapes={item.etapes}
                onEdit={handleEditEtape}
                onDelete={handleDeleteEtape}
                onReorder={handleReorder}
                parentOrgane={item.parentOrgane}
                warnings={timelineWarnings}
              />
            </div>

            {/* Right: step panel */}
            <div
              className="trace-right"
              style={{ pointerEvents: locked ? "none" : "auto", opacity: locked ? 0.55 : 1 }}
            >
              <TimelineWarningsPanel warnings={timelineWarnings} />
              <StepPanel
                etapes={item.etapes}
                typeComposant={item.typeComposant}
                onAdd={handleAddEtape}
                showDeclarePieces={hasRecyclage}
                onDeclarePieces={() => setShowDeclarePieces(true)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Save toast */}
      {saved && (
        <div className="save-toast">Modifications enregistrées.</div>
      )}

      {/* Correction-reason dialog (sold item) */}
      {showMotifDialog && (
        <MotifDialog
          onConfirm={(motif) => {
            setCorrectionMotif(motif);
            setShowMotifDialog(false);
          }}
          onClose={() => setShowMotifDialog(false)}
        />
      )}

      {/* Edit-étape dialog */}
      {editingEtapeId &&
        (() => {
          const target = item.etapes.find((e) => e.id === editingEtapeId);
          if (!target) return null;
          return (
            <EditEtapeDialog
              etape={target}
              onSave={handleEditEtapeSave}
              onClose={() => setEditingEtapeId(null)}
            />
          );
        })()}

      {/* DeclarePieces dialog */}
      {showDeclarePieces && (
        <DeclarePiecesDialog
          parentNom={item.nom}
          parentMarque={item.marque}
          parentModele={item.modele}
          parentCategorie={item.categorie}
          onConfirm={handleDeclarePiecesConfirm}
          onClose={() => setShowDeclarePieces(false)}
        />
      )}
    </DesktopGate>
  );
}
