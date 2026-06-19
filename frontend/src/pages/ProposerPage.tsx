import React, { useState, useRef, useCallback, type ChangeEvent } from 'react';
import { useApp } from '../store/AppContext';
import { mockCategories } from '../data/mock';

type TypeComposant = 'Organe' | 'Piece';
type EtatDeclare = 'FONCTIONNEL' | 'PARTIELLEMENT_FONCTIONNEL' | 'DEFECTUEUX';

// ─── Design tokens (inline, consistent with index.css) ───────────────────────

const T = {
  atelier: '#EEF1F2',
  panel: '#FAFBFB',
  graphite: '#18211F',
  verdigris: '#1C7A62',
  verdigris700: '#155C4B',
  verdigris50: '#E7F2EE',
  steel: '#6E7A80',
  rule: '#DCE1E2',
  brass: '#A87C2A',
  brass50: '#F4EDDD',
  oxide: '#9C4A2C',
  oxide50: '#F2E4DD',
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  // Entreprise
  entrepriseNom: string;
  entrepriseContact: string;
  entrepriseAdresse: string;
  // Équipement
  designation: string;
  typePropose: TypeComposant;
  marque: string;
  modele: string;
  reference: string;
  categorieId: number | '';
  etatDeclare: EtatDeclare | '';
  // Prix & détails
  prixPropose: string;
  description: string;
  images: string[];
}

type FieldErrors = Partial<Record<keyof FormData, string>>;

const INITIAL_FORM: FormData = {
  entrepriseNom: '',
  entrepriseContact: '',
  entrepriseAdresse: '',
  designation: '',
  typePropose: 'Organe',
  marque: '',
  modele: '',
  reference: '',
  categorieId: '',
  etatDeclare: '',
  prixPropose: '',
  description: '',
  images: [],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
      }}
    >
      <span
        style={{
          fontFamily: "'Archivo', sans-serif",
          fontSize: 13,
          fontWeight: 700,
          color: T.graphite,
          letterSpacing: '-0.01em',
        }}
      >
        {children}
      </span>
      <span
        style={{
          flex: 1,
          height: 1,
          background: T.rule,
        }}
      />
    </div>
  );
}

interface FieldProps {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}

function Field({
  label,
  id,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required,
  autoComplete,
}: FieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label
        htmlFor={id}
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: error ? T.oxide : T.steel,
        }}
      >
        {label}
        {required && (
          <span aria-hidden="true" style={{ color: T.verdigris, marginLeft: 3 }}>
            *
          </span>
        )}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          background: T.panel,
          border: `1px solid ${error ? T.oxide : T.rule}`,
          borderRadius: 4,
          padding: '10px 12px',
          fontSize: 14,
          fontFamily: "'IBM Plex Sans', sans-serif",
          color: T.graphite,
          outline: 'none',
          transition: 'border-color 0.12s',
          width: '100%',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = T.verdigris; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = error ? T.oxide : T.rule; }}
      />
      {error && (
        <span style={{ fontSize: 12, color: T.oxide, fontFamily: "'IBM Plex Sans', sans-serif" }}>
          {error}
        </span>
      )}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  id: string;
  value: string | number;
  onChange: (v: string) => void;
  options: { value: string | number; label: string }[];
  error?: string;
  required?: boolean;
  placeholder?: string;
}

function SelectField({ label, id, value, onChange, options, error, required, placeholder }: SelectFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label
        htmlFor={id}
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: error ? T.oxide : T.steel,
        }}
      >
        {label}
        {required && (
          <span aria-hidden="true" style={{ color: T.verdigris, marginLeft: 3 }}>
            *
          </span>
        )}
      </label>
      <div style={{ position: 'relative' }}>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            appearance: 'none',
            background: T.panel,
            border: `1px solid ${error ? T.oxide : T.rule}`,
            borderRadius: 4,
            padding: '10px 36px 10px 12px',
            fontSize: 14,
            fontFamily: "'IBM Plex Sans', sans-serif",
            color: value === '' ? T.steel : T.graphite,
            outline: 'none',
            width: '100%',
            cursor: 'pointer',
            transition: 'border-color 0.12s',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = T.verdigris; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = error ? T.oxide : T.rule; }}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {/* Custom chevron */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: T.steel,
            fontSize: 11,
          }}
        >
          ▾
        </span>
      </div>
      {error && (
        <span style={{ fontSize: 12, color: T.oxide, fontFamily: "'IBM Plex Sans', sans-serif" }}>
          {error}
        </span>
      )}
    </div>
  );
}

// ─── Segmented toggle for type ────────────────────────────────────────────────

interface SegmentedToggleProps {
  value: TypeComposant;
  onChange: (v: TypeComposant) => void;
}

function SegmentedToggle({ value, onChange }: SegmentedToggleProps) {
  const options: { value: TypeComposant; label: string; sub: string }[] = [
    { value: 'Organe', label: 'Organe', sub: 'Ensemble fonctionnel' },
    { value: 'Piece', label: 'Pièce', sub: 'Composant isolé' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: T.steel,
        }}
      >
        Type proposé{' '}
        <span aria-hidden="true" style={{ color: T.verdigris }}>
          *
        </span>
      </span>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          border: `1px solid ${T.rule}`,
          borderRadius: 4,
          overflow: 'hidden',
          background: T.panel,
        }}
      >
        {options.map((opt, i) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              style={{
                background: active ? T.verdigris50 : 'transparent',
                border: 'none',
                borderLeft: i > 0 ? `1px solid ${T.rule}` : 'none',
                padding: '10px 14px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.12s',
              }}
            >
              <div
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? T.verdigris : T.graphite,
                  lineHeight: 1.2,
                }}
              >
                {opt.label}
              </div>
              <div
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: 11,
                  color: T.steel,
                  marginTop: 2,
                }}
              >
                {opt.sub}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Etat declared radio group ────────────────────────────────────────────────

const ETAT_OPTIONS: { value: EtatDeclare; label: string; desc: string; color: string }[] = [
  {
    value: 'FONCTIONNEL',
    label: 'Fonctionnel',
    desc: "L'équipement fonctionne normalement, sans défaut connu.",
    color: T.verdigris,
  },
  {
    value: 'PARTIELLEMENT_FONCTIONNEL',
    label: 'Partiellement fonctionnel',
    desc: 'Fonctionnement dégradé ou présence de défauts mineurs.',
    color: T.brass,
  },
  {
    value: 'DEFECTUEUX',
    label: 'Défectueux',
    desc: "L'équipement ne fonctionne plus ou présente un défaut majeur.",
    color: T.oxide,
  },
];

interface EtatRadioGroupProps {
  value: EtatDeclare | '';
  onChange: (v: EtatDeclare) => void;
  error?: string;
}

function EtatRadioGroup({ value, onChange, error }: EtatRadioGroupProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: error ? T.oxide : T.steel,
        }}
      >
        État déclaré{' '}
        <span aria-hidden="true" style={{ color: T.verdigris }}>
          *
        </span>
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {ETAT_OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <label
              key={opt.value}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '10px 12px',
                background: active ? T.panel : 'transparent',
                border: `1px solid ${active ? opt.color : T.rule}`,
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'border-color 0.12s, background 0.12s',
              }}
            >
              <input
                type="radio"
                name="etatDeclare"
                value={opt.value}
                checked={active}
                onChange={() => onChange(opt.value)}
                style={{
                  marginTop: 2,
                  accentColor: opt.color,
                  flexShrink: 0,
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span
                  style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    color: active ? opt.color : T.graphite,
                  }}
                >
                  {opt.label}
                </span>
                <span
                  style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: 12,
                    color: T.steel,
                    lineHeight: 1.4,
                  }}
                >
                  {opt.desc}
                </span>
              </div>
            </label>
          );
        })}
      </div>
      {error && (
        <span style={{ fontSize: 12, color: T.oxide, fontFamily: "'IBM Plex Sans', sans-serif" }}>
          {error}
        </span>
      )}
    </div>
  );
}

// ─── Image upload ─────────────────────────────────────────────────────────────

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

function ImageUpload({ images, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        onChange([...images, result]);
      };
      reader.readAsDataURL(file);
    });
    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: T.steel,
        }}
      >
        Photos
      </span>

      {/* Thumbnails */}
      {images.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {images.map((src, i) => (
            <div
              key={i}
              style={{
                position: 'relative',
                width: 72,
                height: 72,
                borderRadius: 4,
                overflow: 'hidden',
                border: `1px solid ${T.rule}`,
                background: T.atelier,
                flexShrink: 0,
              }}
            >
              <img
                src={src}
                alt={`Photo ${i + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                aria-label={`Supprimer la photo ${i + 1}`}
                style={{
                  position: 'absolute',
                  top: 3,
                  right: 3,
                  background: 'rgba(24,33,31,0.7)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                  fontSize: 11,
                  lineHeight: 1,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload trigger */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        style={{
          background: T.atelier,
          border: `1px dashed ${T.rule}`,
          borderRadius: 4,
          padding: '12px 16px',
          cursor: 'pointer',
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 13,
          color: T.steel,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          transition: 'border-color 0.12s, color 0.12s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = T.verdigris;
          e.currentTarget.style.color = T.verdigris;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = T.rule;
          e.currentTarget.style.color = T.steel;
        }}
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
        Ajouter des photos
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        style={{ display: 'none' }}
        aria-hidden="true"
      />
    </div>
  );
}

// ─── Confirmation screen ──────────────────────────────────────────────────────

function ConfirmationScreen() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        padding: '48px 32px',
        textAlign: 'center',
      }}
    >
      {/* Check mark */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: T.verdigris50,
          border: `2px solid ${T.verdigris}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12.5L9.5 17L19 8"
            stroke={T.verdigris}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h2
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontSize: 20,
            fontWeight: 700,
            color: T.graphite,
            letterSpacing: '-0.015em',
            margin: 0,
          }}
        >
          Offre reçue
        </h2>
        <p
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 14,
            color: T.steel,
            lineHeight: 1.55,
            margin: 0,
            maxWidth: 320,
          }}
        >
          Nous examinons votre dossier et reviendrons vers vous dans les meilleurs délais.
        </p>
      </div>

      {/* Subtle reference line */}
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          color: T.steel,
          letterSpacing: '0.04em',
          background: T.atelier,
          border: `1px solid ${T.rule}`,
          borderRadius: 3,
          padding: '5px 10px',
        }}
      >
        Réf. offre — {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProposerPage() {
  const { submitOffre } = useApp();

  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const set = useCallback(
    <K extends keyof FormData>(key: K) =>
      (value: FormData[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
      },
    []
  );

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!form.entrepriseNom.trim()) e.entrepriseNom = 'Requis.';
    if (!form.entrepriseContact.trim()) e.entrepriseContact = 'Requis.';
    if (!form.entrepriseAdresse.trim()) e.entrepriseAdresse = 'Requis.';
    if (!form.designation.trim()) e.designation = 'Requis.';
    if (!form.marque.trim()) e.marque = 'Requis.';
    if (!form.modele.trim()) e.modele = 'Requis.';
    if (!form.reference.trim()) e.reference = 'Requis.';
    if (form.categorieId === '') e.categorieId = 'Sélectionnez une catégorie.';
    if (!form.etatDeclare) e.etatDeclare = 'Sélectionnez un état.';
    if (!form.prixPropose || isNaN(Number(form.prixPropose)) || Number(form.prixPropose) <= 0) {
      e.prixPropose = 'Indiquez un prix valide.';
    }
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    submitOffre({
      designation: form.designation.trim(),
      description: form.description.trim(),
      typePropose: form.typePropose.toUpperCase() as any,
      categorieId: form.categorieId as number,
      prixPropose: Number(form.prixPropose),
      marque: form.marque.trim(),
      modele: form.modele.trim(),
      reference: form.reference.trim(),
      etatDeclare: form.etatDeclare as EtatDeclare,
      images: form.images
    }, {
      nom: form.entrepriseNom.trim(),
      contact: form.entrepriseContact.trim(),
      adresse: form.entrepriseAdresse.trim(),
    });

    setSubmitted(true);
  };

  const categoryOptions = mockCategories.map((c) => ({ value: c.id, label: c.libelle }));

  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.atelier,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 16px 64px',
      }}
    >
      {/* Logo strip */}
      <header
        style={{
          width: '100%',
          maxWidth: 640,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 36,
        }}
      >
        <span
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontSize: 15,
            fontWeight: 700,
            color: T.graphite,
            letterSpacing: '-0.015em',
          }}
        >
          Reconditionnement
        </span>
        <span
          style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: T.verdigris,
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            color: T.steel,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Proposer un équipement
        </span>
      </header>

      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 640,
          background: T.panel,
          border: `1px solid ${T.rule}`,
          borderRadius: 8,
          boxShadow: '0 2px 16px rgba(24,33,31,0.07)',
          overflow: 'hidden',
        }}
      >
        {submitted ? (
          <ConfirmationScreen />
        ) : (
          <>
            {/* Page heading */}
            <div
              style={{
                padding: '28px 32px 24px',
                borderBottom: `1px solid ${T.rule}`,
              }}
            >
              <h1
                style={{
                  fontFamily: "'Archivo', sans-serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: T.graphite,
                  letterSpacing: '-0.02em',
                  margin: '0 0 6px',
                }}
              >
                Proposer un équipement
              </h1>
              <p
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: 14,
                  color: T.steel,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Proposez un équipement à reconditionner. Nous examinons chaque offre.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 32 }}>

                {/* Fieldset 1 — Entreprise */}
                <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
                  <legend style={{ display: 'contents' }}>
                    <SectionLabel>Votre entreprise</SectionLabel>
                  </legend>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <Field
                      label="Nom de l'entreprise"
                      id="ent-nom"
                      value={form.entrepriseNom}
                      onChange={set('entrepriseNom')}
                      error={errors.entrepriseNom}
                      required
                      autoComplete="organization"
                    />
                    <Field
                      label="Contact (e-mail)"
                      id="ent-contact"
                      type="email"
                      value={form.entrepriseContact}
                      onChange={set('entrepriseContact')}
                      error={errors.entrepriseContact}
                      required
                      autoComplete="email"
                    />
                    <Field
                      label="Adresse"
                      id="ent-adresse"
                      value={form.entrepriseAdresse}
                      onChange={set('entrepriseAdresse')}
                      error={errors.entrepriseAdresse}
                      required
                      autoComplete="street-address"
                      placeholder="Rue, code postal, ville"
                    />
                  </div>
                </fieldset>

                {/* Fieldset 2 — Équipement */}
                <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
                  <legend style={{ display: 'contents' }}>
                    <SectionLabel>L'équipement</SectionLabel>
                  </legend>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <Field
                      label="Désignation"
                      id="eq-designation"
                      value={form.designation}
                      onChange={set('designation')}
                      error={errors.designation}
                      required
                      placeholder="Ex. : Moteur asynchrone triphasé 7,5 kW"
                    />
                    <SegmentedToggle
                      value={form.typePropose}
                      onChange={set('typePropose')}
                    />
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 12,
                      }}
                    >
                      <Field
                        label="Marque"
                        id="eq-marque"
                        value={form.marque}
                        onChange={set('marque')}
                        error={errors.marque}
                        required
                        placeholder="Ex. : ABB"
                      />
                      <Field
                        label="Modèle"
                        id="eq-modele"
                        value={form.modele}
                        onChange={set('modele')}
                        error={errors.modele}
                        required
                        placeholder="Ex. : M2BAX 132MA4"
                      />
                    </div>
                    <Field
                      label="Référence fabricant"
                      id="eq-reference"
                      value={form.reference}
                      onChange={set('reference')}
                      error={errors.reference}
                      required
                      placeholder="Numéro de série ou référence catalogue"
                    />
                    <SelectField
                      label="Catégorie"
                      id="eq-categorie"
                      value={form.categorieId}
                      onChange={(v) => set('categorieId')(v === '' ? '' : Number(v))}
                      options={categoryOptions}
                      error={errors.categorieId}
                      required
                      placeholder="Sélectionnez une catégorie"
                    />
                    <EtatRadioGroup
                      value={form.etatDeclare}
                      onChange={set('etatDeclare')}
                      error={errors.etatDeclare}
                    />
                  </div>
                </fieldset>

                {/* Fieldset 3 — Prix & détails */}
                <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
                  <legend style={{ display: 'contents' }}>
                    <SectionLabel>Prix &amp; détails</SectionLabel>
                  </legend>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <Field
                      label="Prix proposé (€)"
                      id="prix-propose"
                      type="number"
                      value={form.prixPropose}
                      onChange={set('prixPropose')}
                      error={errors.prixPropose}
                      required
                      placeholder="0"
                    />

                    {/* Textarea — description */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <label
                        htmlFor="description"
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 11,
                          fontWeight: 500,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: T.steel,
                        }}
                      >
                        Description
                        <span
                          style={{
                            fontFamily: "'IBM Plex Sans', sans-serif",
                            fontSize: 11,
                            letterSpacing: 0,
                            textTransform: 'none',
                            marginLeft: 6,
                            color: T.steel,
                            opacity: 0.7,
                          }}
                        >
                          (facultatif)
                        </span>
                      </label>
                      <textarea
                        id="description"
                        value={form.description}
                        onChange={(e) => set('description')(e.target.value)}
                        rows={4}
                        placeholder="Contexte, historique de service, anomalies connues…"
                        style={{
                          background: T.panel,
                          border: `1px solid ${T.rule}`,
                          borderRadius: 4,
                          padding: '10px 12px',
                          fontSize: 14,
                          fontFamily: "'IBM Plex Sans', sans-serif",
                          color: T.graphite,
                          outline: 'none',
                          resize: 'vertical',
                          minHeight: 90,
                          lineHeight: 1.55,
                          transition: 'border-color 0.12s',
                          width: '100%',
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = T.verdigris; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = T.rule; }}
                      />
                    </div>

                    <ImageUpload images={form.images} onChange={set('images')} />
                  </div>
                </fieldset>

                {/* Global error summary if any */}
                {Object.keys(errors).length > 0 && (
                  <div
                    role="alert"
                    style={{
                      background: T.oxide50,
                      border: `1px solid #e0b8ac`,
                      borderRadius: 4,
                      padding: '10px 14px',
                      fontSize: 13,
                      color: T.oxide,
                      fontFamily: "'IBM Plex Sans', sans-serif",
                    }}
                  >
                    Certains champs obligatoires sont incomplets ou invalides.
                  </div>
                )}

                {/* Submit */}
                <div style={{ paddingTop: 4 }}>
                  <button
                    type="submit"
                    style={{
                      background: T.verdigris,
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      padding: '13px 24px',
                      fontSize: 14,
                      fontWeight: 600,
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      cursor: 'pointer',
                      width: '100%',
                      letterSpacing: '0.01em',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = T.verdigris700; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = T.verdigris; }}
                  >
                    Soumettre l'offre
                  </button>
                  <p
                    style={{
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      fontSize: 12,
                      color: T.steel,
                      textAlign: 'center',
                      marginTop: 10,
                      marginBottom: 0,
                    }}
                  >
                    Les champs marqués{' '}
                    <span style={{ color: T.verdigris }}>*</span> sont obligatoires.
                  </p>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
