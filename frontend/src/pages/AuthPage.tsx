import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLogin, useRegister } from '../hooks/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'connexion' | 'inscription';

interface AuthFormState {
  email: string;
  password: string;
  nom: string;
}

interface AuthSheetProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

// ─── Shared field component ───────────────────────────────────────────────────

interface FieldProps {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  hint?: React.ReactNode;
}

function Field({ label, id, type = 'text', value, onChange, autoComplete, hint }: FieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        htmlFor={id}
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--steel)',
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--rule)',
          borderRadius: 4,
          padding: '10px 12px',
          fontSize: 14,
          fontFamily: "'IBM Plex Sans', sans-serif",
          color: 'var(--graphite)',
          outline: 'none',
          transition: 'border-color 0.15s',
          width: '100%',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--verdigris)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--rule)'; }}
      />
      {hint && (
        <span
          style={{
            fontSize: 12,
            color: 'var(--steel)',
            fontFamily: "'IBM Plex Sans', sans-serif",
            lineHeight: 1.4,
          }}
        >
          {hint}
        </span>
      )}
    </div>
  );
}

// ─── Error message ────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      style={{
        background: 'var(--oxide-50)',
        border: '1px solid #e0b8ac',
        borderRadius: 4,
        padding: '10px 12px',
        fontSize: 13,
        color: 'var(--oxide)',
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      {message}
    </div>
  );
}

// ─── Submit button ────────────────────────────────────────────────────────────

function SubmitButton({ label, onClick, disabled }: { label: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type={onClick ? 'button' : 'submit'}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? 'var(--steel)' : 'var(--verdigris)',
        color: '#fff',
        border: 'none',
        borderRadius: 4,
        padding: '12px 20px',
        fontSize: 14,
        fontWeight: 600,
        fontFamily: "'IBM Plex Sans', sans-serif",
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: '100%',
        transition: 'background 0.15s',
        letterSpacing: '0.01em',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--verdigris-700)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--verdigris)'; }}
    >
      {label}
    </button>
  );
}

// ─── Auth form logic ──────────────────────────────────────────────────────────

interface AuthFormsProps {
  defaultTab?: Tab;
  onSuccess?: () => void;
  compact?: boolean;
}

function AuthForms({ defaultTab = 'connexion', onSuccess, compact = false }: AuthFormsProps) {
  const loginMut = useLogin();
  const registerMut = useRegister();
  const navigate = useNavigate();
  const location = useLocation();

  const [tab, setTab] = useState<Tab>(defaultTab);
  const [form, setForm] = useState<AuthFormState>({ email: '', password: '', nom: '' });
  const [error, setError] = useState('');

  const busy = loginMut.isPending || registerMut.isPending;

  const set = useCallback((key: keyof AuthFormState) => (v: string) => {
    setForm((prev) => ({ ...prev, [key]: v }));
    setError('');
  }, []);

  const afterAuth = (isAdmin: boolean) => {
    if (onSuccess) return onSuccess();
    if (isAdmin) return navigate('/admin');
    const from = (location.state as { from?: string })?.from ?? '/';
    navigate(from);
  };

  const handleConnexion = () => {
    if (!form.email.trim() || !form.password) {
      setError('Renseignez votre adresse e-mail et votre mot de passe.');
      return;
    }
    loginMut.mutate(
      { email: form.email.trim(), password: form.password },
      {
        onSuccess: ({ user }) => afterAuth(user.role === 'ADMINISTRATEUR'),
        onError: (e: unknown) => setError((e as { message?: string })?.message ?? 'Échec de la connexion.'),
      },
    );
  };

  const handleInscription = () => {
    if (!form.nom.trim()) {
      setError('Indiquez votre nom.');
      return;
    }
    if (!form.email.trim()) {
      setError('Indiquez votre adresse e-mail.');
      return;
    }
    if (form.password.length < 8) {
      setError('Le mot de passe doit comporter au moins 8 caractères.');
      return;
    }
    registerMut.mutate(
      { nom: form.nom.trim(), email: form.email.trim(), password: form.password },
      {
        onSuccess: () => afterAuth(false),
        onError: (e: unknown) => setError((e as { message?: string })?.message ?? "Échec de l'inscription."),
      },
    );
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: compact ? '9px 12px' : '11px 16px',
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    fontFamily: "'IBM Plex Sans', sans-serif",
    color: active ? 'var(--graphite)' : 'var(--steel)',
    background: active ? 'var(--panel)' : 'transparent',
    border: 'none',
    borderBottom: active ? '2px solid var(--verdigris)' : '2px solid transparent',
    cursor: 'pointer',
    transition: 'color 0.12s, border-color 0.12s',
    letterSpacing: '0.005em',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 16 : 24 }}>
      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--rule)',
          background: 'var(--atelier)',
          borderRadius: compact ? '4px 4px 0 0' : '6px 6px 0 0',
          overflow: 'hidden',
        }}
      >
        <button style={tabStyle(tab === 'connexion')} onClick={() => { setTab('connexion'); setError(''); }}>
          Connexion
        </button>
        <button style={tabStyle(tab === 'inscription')} onClick={() => { setTab('inscription'); setError(''); }}>
          Inscription
        </button>
      </div>

      {/* Form body */}
      <div style={{ padding: compact ? '0 4px' : '0 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && <ErrorBanner message={error} />}

        {tab === 'connexion' && (
          <>
            <Field
              label="Adresse e-mail"
              id="auth-email"
              type="email"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
            />
            <Field
              label="Mot de passe"
              id="auth-password"
              type="password"
              value={form.password}
              onChange={set('password')}
              autoComplete="current-password"
            />

            {/* Demo hint */}
            <div
              style={{
                background: 'var(--atelier)',
                border: '1px solid var(--rule)',
                borderRadius: 4,
                padding: '8px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--steel)',
                }}
              >
                Démo admin
              </span>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  color: 'var(--graphite)',
                  lineHeight: 1.6,
                }}
              >
                admin@reconditionnement.fr&nbsp;/&nbsp;admin
              </span>
            </div>

            <SubmitButton label={busy ? 'Connexion…' : 'Se connecter'} onClick={handleConnexion} disabled={busy} />
          </>
        )}

        {tab === 'inscription' && (
          <>
            <Field
              label="Nom"
              id="reg-nom"
              value={form.nom}
              onChange={set('nom')}
              autoComplete="name"
            />
            <Field
              label="Adresse e-mail"
              id="reg-email"
              type="email"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
            />
            <Field
              label="Mot de passe"
              id="reg-password"
              type="password"
              value={form.password}
              onChange={set('password')}
              autoComplete="new-password"
              hint="8 caractères minimum."
            />
            <SubmitButton label={busy ? 'Création…' : "S'inscrire"} onClick={handleInscription} disabled={busy} />
          </>
        )}
      </div>
    </div>
  );
}

// ─── AuthSheet ────────────────────────────────────────────────────────────────

export function AuthSheet({ isOpen, onClose, reason }: AuthSheetProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(24,33,31,0.45)',
          backdropFilter: 'blur(2px)',
          zIndex: 400,
        }}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Connexion requise"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: 420,
          background: 'var(--panel)',
          borderRadius: 8,
          boxShadow: '0 8px 32px rgba(24,33,31,0.22)',
          zIndex: 401,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid var(--rule)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span
              style={{
                fontFamily: "'Archivo', sans-serif",
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--graphite)',
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }}
            >
              Connexion requise
            </span>
            {reason && (
              <span
                style={{
                  fontSize: 13,
                  color: 'var(--steel)',
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  lineHeight: 1.4,
                }}
              >
                Connectez-vous pour {reason}.
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--steel)',
              padding: '4px',
              borderRadius: 4,
              lineHeight: 1,
              fontSize: 20,
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: '20px 24px 24px' }}>
          <AuthForms compact onSuccess={onClose} />
        </div>
      </div>
    </>
  );
}

// ─── AuthPage ─────────────────────────────────────────────────────────────────

export default function AuthPage() {
  const location = useLocation();
  const defaultTab: Tab = (location.state as { tab?: Tab })?.tab ?? 'connexion';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--atelier)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          marginBottom: 32,
        }}
      >
        {/* Gear/recondition symbol — canvas-drawn, no external SVG */}
        <GearMark />
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: "'Archivo', sans-serif",
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--graphite)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            Reconditionnement
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              color: 'var(--steel)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginTop: 3,
            }}
          >
            Équipement industriel
          </div>
        </div>
      </div>

      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'var(--panel)',
          border: '1px solid var(--rule)',
          borderRadius: 8,
          boxShadow: '0 2px 12px rgba(24,33,31,0.08)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '24px 24px 28px' }}>
          <AuthForms defaultTab={defaultTab} />
        </div>
      </div>

      {/* Footer */}
      <p
        style={{
          marginTop: 24,
          fontSize: 12,
          color: 'var(--steel)',
          fontFamily: "'IBM Plex Sans', sans-serif",
          textAlign: 'center',
        }}
      >
        Plateforme réservée aux professionnels et clients enregistrés.
      </p>
    </div>
  );
}

// ─── Gear mark — rendered via inline SVG, no external paths ──────────────────

function GearMark() {
  // 8-tooth gear shape built from a circle + rotated rectangles, pure geometric
  const cx = 28;
  const cy = 28;
  const r = 10;
  const teeth = 8;
  const toothW = 4;
  const toothH = 5;

  const toothRects = Array.from({ length: teeth }, (_, i) => {
    const angle = (i / teeth) * 360;
    return (
      <rect
        key={i}
        x={cx - toothW / 2}
        y={cy - r - toothH}
        width={toothW}
        height={toothH}
        rx={1}
        fill="var(--verdigris)"
        transform={`rotate(${angle} ${cx} ${cy})`}
      />
    );
  });

  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r + 1} fill="none" stroke="var(--verdigris)" strokeWidth="2" />
      {/* Teeth */}
      {toothRects}
      {/* Inner circle (bore) */}
      <circle cx={cx} cy={cy} r={4} fill="var(--panel)" stroke="var(--verdigris)" strokeWidth="1.5" />
      {/* Recondition arc — a partial arc top-right indicating renewal */}
      <path
        d="M 36 20 A 12 12 0 0 1 40 28"
        fill="none"
        stroke="var(--brass)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
