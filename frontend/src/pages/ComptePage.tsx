import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';

// ─── ComptePage ───────────────────────────────────────────────────────────────

export default function ComptePage() {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  // Redirect to /connexion if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/connexion', { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const { nom, email } = user;
  const prenom: string | undefined = undefined;
  const displayName = nom;

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div style={{ backgroundColor: 'var(--atelier)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 16px' }}>

        {/* Page header */}
        <div style={{ marginBottom: '32px' }}>
          <span
            style={{
              display: 'block',
              fontSize: '11px',
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              color: 'var(--steel)',
              marginBottom: '8px',
            }}
          >
            Mon compte
          </span>
          <h1
            style={{
              fontFamily: "'Archivo', sans-serif",
              fontSize: 'clamp(1.4rem, 4vw, 1.75rem)',
              fontWeight: 700,
              color: 'var(--graphite)',
              margin: 0,
            }}
          >
            Compte
          </h1>
        </div>

        {/* Identity card */}
        <div
          style={{
            backgroundColor: 'var(--panel)',
            border: '1px solid var(--rule)',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '24px',
          }}
        >
          {/* Avatar band */}
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--rule)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--verdigris-50)',
                border: '1px solid rgba(28,122,98,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Archivo', sans-serif",
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--verdigris)',
                flexShrink: 0,
                userSelect: 'none',
              }}
            >
              {(prenom?.[0] ?? nom?.[0] ?? '?').toUpperCase()}
            </div>
            <div>
              <div
                style={{
                  fontSize: '15px',
                  fontFamily: "'Archivo', sans-serif",
                  fontWeight: 700,
                  color: 'var(--graphite)',
                  lineHeight: 1.2,
                }}
              >
                {displayName}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: 'var(--steel)',
                  marginTop: '3px',
                }}
              >
                {email}
              </div>
            </div>
          </div>

          {/* Detail rows */}
          <dl style={{ margin: 0, padding: '0' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '13px 24px',
                borderBottom: '1px solid var(--rule)',
              }}
            >
              <dt
                style={{
                  fontSize: '11px',
                  fontFamily: "'IBM Plex Mono', monospace",
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--steel)',
                }}
              >
                Nom
              </dt>
              <dd
                style={{
                  fontSize: '13px',
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  color: 'var(--graphite)',
                  margin: 0,
                }}
              >
                {displayName}
              </dd>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '13px 24px',
              }}
            >
              <dt
                style={{
                  fontSize: '11px',
                  fontFamily: "'IBM Plex Mono', monospace",
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--steel)',
                }}
              >
                E-mail
              </dt>
              <dd
                style={{
                  fontSize: '13px',
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: 'var(--graphite)',
                  margin: 0,
                }}
              >
                {email}
              </dd>
            </div>
          </dl>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '14px',
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontWeight: 500,
            backgroundColor: 'transparent',
            color: 'var(--steel)',
            border: '1px solid var(--rule)',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.borderColor = 'var(--oxide)';
            btn.style.color = 'var(--oxide)';
          }}
          onMouseLeave={e => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.borderColor = 'var(--rule)';
            btn.style.color = 'var(--steel)';
          }}
        >
          Déconnexion
        </button>

      </div>
    </div>
  );
}
