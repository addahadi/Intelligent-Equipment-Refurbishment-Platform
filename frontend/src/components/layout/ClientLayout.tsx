import type { ReactNode } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Heart, ShoppingBag, User } from 'lucide-react';
import { useApp } from '../../store/AppContext';

// ─── Tab definition ───────────────────────────────────────────────────────────

interface Tab {
  to: string;
  label: string;
  icon: React.ElementType;
}

const TABS: Tab[] = [
  { to: '/',         label: 'Catalogue', icon: Home        },
  { to: '/favoris',  label: 'Favoris',   icon: Heart       },
  { to: '/commandes',label: 'Commandes', icon: ShoppingBag },
  { to: '/compte',   label: 'Compte',    icon: User        },
];

// ─── ClientLayout ─────────────────────────────────────────────────────────────

export default function ClientLayout() {
  const { state } = useApp();
  const location = useLocation();

  const favoriCount = state.favoris.length;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--atelier)',
      }}
    >
      {/* ── Desktop top nav ───────────────────────────────────────────── */}
      <header
        className="hidden md:flex"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: 'var(--panel)',
          borderBottom: '1px solid var(--rule)',
          height: '56px',
          alignItems: 'center',
          padding: '0 32px',
          gap: '24px',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontWeight: 700,
            fontSize: '17px',
            letterSpacing: '-0.02em',
            color: 'var(--graphite)',
            textDecoration: 'none',
            flexShrink: 0,
            lineHeight: 1,
          }}
          aria-label="Le Passeport — accueil"
        >
          Le Passeport
        </Link>

        {/* Center placeholder — search lives on the catalogue page */}
        <div style={{ flex: 1 }} aria-hidden="true" />

        {/* Right nav links */}
        <nav
          aria-label="Navigation principale"
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <NavDesktopLink to="/favoris" count={favoriCount}>
            <Heart size={15} strokeWidth={1.75} aria-hidden="true" />
            Favoris
          </NavDesktopLink>

          <NavDesktopLink to="/compte">
            <User size={15} strokeWidth={1.75} aria-hidden="true" />
            {state.currentClient ? state.currentClient.prenom : 'Compte'}
          </NavDesktopLink>
        </nav>
      </header>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          /* On mobile, leave room for the fixed bottom tab bar (56px + 1px border) */
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
        className="pb-[57px] md:pb-0"
      >
        <Outlet />
      </main>

      {/* ── Desktop-only footer ───────────────────────────────────────── */}
      <footer
        className="hidden md:flex"
        style={{
          borderTop: '1px solid var(--rule)',
          padding: '14px 32px',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'var(--panel)',
        }}
      >
        <Link
          to="/proposer"
          style={{
            fontSize: '12px',
            fontFamily: "'IBM Plex Sans', sans-serif",
            color: 'var(--steel)',
            textDecoration: 'none',
            borderBottom: '1px solid var(--rule)',
            paddingBottom: '1px',
            transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--verdigris)';
            (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = 'var(--verdigris)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--steel)';
            (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = 'var(--rule)';
          }}
        >
          Vous êtes une entreprise&nbsp;? Proposez un équipement.
        </Link>
      </footer>

      {/* ── Mobile bottom tab bar ─────────────────────────────────────── */}
      <nav
        aria-label="Navigation"
        className="md:hidden"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: 'var(--panel)',
          borderTop: '1px solid var(--rule)',
          display: 'flex',
          alignItems: 'stretch',
          height: '56px',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {TABS.map(({ to, label, icon: Icon }) => {
          const isActive =
            to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(to);

          const badge =
            to === '/favoris' && favoriCount > 0
              ? favoriCount
              : null;

          return (
            <Link
              key={to}
              to={to}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                textDecoration: 'none',
                color: isActive ? 'var(--verdigris)' : 'var(--steel)',
                position: 'relative',
                transition: 'color 0.12s',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {/* Active indicator: thin top line */}
              {isActive && (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '20%',
                    right: '20%',
                    height: '2px',
                    backgroundColor: 'var(--verdigris)',
                    borderRadius: '0 0 2px 2px',
                  }}
                />
              )}

              {/* Icon wrapper with optional badge */}
              <span style={{ position: 'relative', display: 'flex' }}>
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2 : 1.5}
                  aria-hidden="true"
                />
                {badge !== null && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-6px',
                      minWidth: '14px',
                      height: '14px',
                      borderRadius: '7px',
                      backgroundColor: 'var(--verdigris)',
                      color: 'var(--panel)',
                      fontSize: '9px',
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 3px',
                      lineHeight: 1,
                    }}
                  >
                    {badge > 99 ? '99' : badge}
                  </span>
                )}
              </span>

              <span
                style={{
                  fontSize: '10px',
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontWeight: isActive ? 500 : 400,
                  letterSpacing: '0.02em',
                  lineHeight: 1,
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

// ─── NavDesktopLink ───────────────────────────────────────────────────────────

interface NavDesktopLinkProps {
  to: string;
  count?: number;
  children: ReactNode;
}

function NavDesktopLink({ to, count, children }: NavDesktopLinkProps) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '5px 10px',
        fontSize: '13px',
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontWeight: 500,
        color: isActive ? 'var(--verdigris)' : 'var(--steel)',
        textDecoration: 'none',
        borderRadius: '4px',
        backgroundColor: isActive ? 'var(--verdigris-50)' : 'transparent',
        transition: 'color 0.12s, background-color 0.12s',
        position: 'relative',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          (e.currentTarget as HTMLAnchorElement).style.color = 'var(--graphite)';
          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--atelier)';
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          (e.currentTarget as HTMLAnchorElement).style.color = 'var(--steel)';
          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent';
        }
      }}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
      {count !== undefined && count > 0 && (
        <span
          aria-label={`${count} élément${count > 1 ? 's' : ''}`}
          style={{
            minWidth: '16px',
            height: '16px',
            borderRadius: '8px',
            backgroundColor: isActive ? 'var(--verdigris)' : 'var(--rule)',
            color: isActive ? '#fff' : 'var(--steel)',
            fontSize: '10px',
            fontFamily: "'IBM Plex Mono', monospace",
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            lineHeight: 1,
            transition: 'background-color 0.12s, color 0.12s',
          }}
        >
          {count > 99 ? '99' : count}
        </span>
      )}
    </Link>
  );
}
