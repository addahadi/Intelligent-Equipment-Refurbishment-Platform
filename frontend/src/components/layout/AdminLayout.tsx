import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  Package,
  Tag,
  Receipt,
  LogOut,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';

// ─── Token constants (match index.css vars) ───────────────────────────────────

const T = {
  atelier:      '#EEF1F2',
  panel:        '#FAFBFB',
  graphite:     '#18211F',
  steel:        '#6E7A80',
  rule:         '#DCE1E2',
  verdigris:    '#1C7A62',
  verdigris700: '#155C4B',
  verdigris50:  '#E7F2EE',
  brass:        '#A87C2A',
  brass50:      '#F4EDDD',
} as const;

// ─── Nav item definition ──────────────────────────────────────────────────────

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
  badge?: number;
  exact?: boolean;
}

// ─── Sidebar nav link ─────────────────────────────────────────────────────────

function SideNavItem({ item }: { item: NavItem }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.exact}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 12px',
        borderRadius: 4,
        textDecoration: 'none',
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontSize: 13,
        fontWeight: isActive ? 600 : 400,
        color: isActive ? T.verdigris : T.graphite,
        background: isActive ? T.verdigris50 : 'transparent',
        transition: 'background 0.12s ease, color 0.12s ease',
        position: 'relative',
      })}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        if (!el.getAttribute('aria-current')) {
          el.style.background = T.atelier;
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        if (!el.getAttribute('aria-current')) {
          el.style.background = 'transparent';
        }
      }}
    >
      {({ isActive }) => (
        <>
          <Icon
            size={15}
            strokeWidth={isActive ? 2.25 : 1.75}
            style={{ flexShrink: 0, color: isActive ? T.verdigris : T.steel }}
          />
          <span style={{ flex: 1, lineHeight: '1.25' }}>{item.label}</span>
          {item.badge !== undefined && item.badge > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 18,
                height: 18,
                padding: '0 5px',
                borderRadius: 9,
                background: T.brass,
                color: '#fff',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                fontWeight: 600,
                lineHeight: '1',
                letterSpacing: '0.02em',
                flexShrink: 0,
              }}
            >
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

// ─── AdminLayout ──────────────────────────────────────────────────────────────

export default function AdminLayout() {
  const { state, logout } = useApp();
  const navigate = useNavigate();

  const enAttenteCount = state.offres.filter(
    (o) => o.statut === 'EN_ATTENTE',
  ).length;

  const handleLogout = () => {
    logout();
    navigate('/auth', { replace: true });
  };

  const navItems: NavItem[] = [
    {
      label: 'Tableau de bord',
      to: '/admin',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: 'Offres',
      to: '/admin/offres',
      icon: Inbox,
      badge: enAttenteCount,
    },
    {
      label: 'Inventaire',
      to: '/admin/inventaire',
      icon: Package,
    },
    {
      label: 'Catégories',
      to: '/admin/categories',
      icon: Tag,
    },
    {
      label: 'Ventes',
      to: '/admin/ventes',
      icon: Receipt,
    },
  ];

  return (
    <>
      {/* ── Desktop gate: below 1024px ──────────────────────────────────────── */}
      <div
        className="admin-narrow-msg"
        style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          background: T.atelier,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 15,
            color: T.steel,
            maxWidth: 360,
            lineHeight: 1.6,
          }}
        >
          La console d'administration est conçue pour un écran large. Ouvrez-la
          sur un ordinateur.
        </p>
      </div>

      {/* ── Desktop shell: 1024px and above ─────────────────────────────────── */}
      <div
        className="admin-shell"
        style={{
          display: 'flex',
          minHeight: '100vh',
          background: T.atelier,
        }}
      >
        {/* Sidebar */}
        <aside
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: 240,
            height: '100vh',
            background: T.panel,
            borderRight: `1px solid ${T.rule}`,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 40,
          }}
        >
          {/* Logo */}
          <div
            style={{
              padding: '24px 16px 20px',
              borderBottom: `1px solid ${T.rule}`,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontFamily: "'Archivo', sans-serif",
                fontSize: 14,
                fontWeight: 700,
                color: T.graphite,
                letterSpacing: '-0.01em',
                lineHeight: '1.25',
              }}
            >
              Le Passeport
            </div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                fontWeight: 500,
                color: T.steel,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginTop: 3,
              }}
            >
              Admin
            </div>
          </div>

          {/* Navigation */}
          <nav
            aria-label="Navigation administration"
            style={{
              flex: 1,
              padding: '12px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              overflowY: 'auto',
            }}
          >
            {navItems.map((item) => (
              <SideNavItem key={item.to} item={item} />
            ))}
          </nav>

          {/* Déconnexion */}
          <div
            style={{
              padding: '12px 8px 16px',
              borderTop: `1px solid ${T.rule}`,
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '9px 12px',
                borderRadius: 4,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: 13,
                fontWeight: 400,
                color: T.steel,
                transition: 'background 0.12s ease, color 0.12s ease',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = T.atelier;
                (e.currentTarget as HTMLButtonElement).style.color = T.graphite;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = T.steel;
              }}
            >
              <LogOut size={15} strokeWidth={1.75} style={{ flexShrink: 0 }} />
              Déconnexion
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main
          style={{
            marginLeft: 240,
            flex: 1,
            minHeight: '100vh',
            background: T.atelier,
            padding: '32px',
            overflowY: 'auto',
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* ── Responsive gate styles ───────────────────────────────────────────── */}
      <style>{`
        @media (max-width: 1023px) {
          .admin-shell   { display: none !important; }
          .admin-narrow-msg { display: flex !important; }
        }
        @media (min-width: 1024px) {
          .admin-narrow-msg { display: none !important; }
        }
      `}</style>
    </>
  );
}
