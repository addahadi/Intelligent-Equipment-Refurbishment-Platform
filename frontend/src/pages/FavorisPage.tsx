import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { useLogin } from '../hooks/auth';
import { useFavoris, useToggleFavori } from '../hooks/favoris';
import { useCategories } from '../hooks/categories';
import EquipmentCard from '../components/shared/EquipmentCard';

// ─── AuthPrompt ───────────────────────────────────────────────────────────────

function AuthPrompt() {
  const loginMut = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    fontSize: '14px',
    fontFamily: "'IBM Plex Sans', sans-serif",
    color: 'var(--graphite)',
    backgroundColor: 'var(--atelier)',
    border: '1px solid var(--rule)',
    borderRadius: '4px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMut.mutate({ email, password });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '40px 24px',
      }}
    >
      <div
        style={{
          width: 'min(400px, 100%)',
          backgroundColor: 'var(--panel)',
          border: '1px solid var(--rule)',
          borderRadius: '8px',
          padding: '32px 28px',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: 'var(--steel)',
            marginBottom: '10px',
          }}
        >
          Favoris
        </div>
        <h1
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontSize: '1.4rem',
            fontWeight: 700,
            color: 'var(--graphite)',
            margin: '0 0 6px',
          }}
        >
          Connexion requise
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--steel)', margin: '0 0 24px', fontFamily: "'IBM Plex Sans', sans-serif" }}>
          Connectez-vous pour accéder à vos favoris.
        </p>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="email"
            placeholder="Adresse e-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={inputStyle}
            aria-label="Adresse e-mail"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={inputStyle}
            aria-label="Mot de passe"
          />
          <button
            type="submit"
            style={{
              padding: '12px',
              fontSize: '14px',
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: 600,
              backgroundColor: 'var(--verdigris)',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── FavorisPage ──────────────────────────────────────────────────────────────

export default function FavorisPage() {
  const { isAuthenticated } = useApp();
  const navigate = useNavigate();
  const { data: favorisData, isLoading } = useFavoris();
  const { data: categoriesData } = useCategories();
  const toggleFavoriMut = useToggleFavori();

  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: 'var(--atelier)', minHeight: '100vh' }}>
        <AuthPrompt />
      </div>
    );
  }

  const favorisComposants = favorisData ?? [];
  const categories = categoriesData ?? [];

  if (isLoading) {
    return (
      <div style={{ backgroundColor: 'var(--atelier)', minHeight: '100vh', padding: '64px 24px', textAlign: 'center', color: 'var(--steel)', fontFamily: "'IBM Plex Sans', sans-serif" }}>
        Chargement de vos favoris…
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--atelier)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '32px 16px' }}>

        {/* Page header */}
        <div style={{ marginBottom: '28px' }}>
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
            Mes favoris
          </h1>
          {favorisComposants.length > 0 && (
            <p
              style={{
                fontSize: '13px',
                color: 'var(--steel)',
                margin: '6px 0 0',
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              {favorisComposants.length} équipement{favorisComposants.length !== 1 ? 's' : ''} suivi{favorisComposants.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {favorisComposants.length === 0 ? (
          /* Empty state */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '72px 24px',
              textAlign: 'center',
              gap: '14px',
            }}
          >
            <span
              style={{
                fontSize: '32px',
                lineHeight: 1,
                opacity: 0.3,
                userSelect: 'none',
              }}
              aria-hidden="true"
            >
              ♡
            </span>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--steel)',
                fontFamily: "'IBM Plex Sans', sans-serif",
                margin: 0,
                maxWidth: '300px',
              }}
            >
              Aucun favori. Touchez ♡ sur un équipement pour le suivre.
            </p>
            <button
              onClick={() => navigate('/catalogue')}
              style={{
                padding: '9px 20px',
                fontSize: '13px',
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontWeight: 500,
                backgroundColor: 'var(--verdigris)',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Explorer le catalogue
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
            }}
            className="md:grid-cols-3 lg:grid-cols-4"
          >
            {favorisComposants.map(composant => {
              const isVendu = composant.etatActuel === 'VENDU';
              return (
                <div key={composant.id} style={{ position: 'relative' }}>
                  <EquipmentCard
                    composant={composant}
                    categorie={categories.find(c => c.id === composant.categorieId)}
                    isFavori={true}
                    onToggleFavori={() => toggleFavoriMut.mutate({ id: composant.id, isFavori: true })}
                    onClick={() => navigate(`/equipement/${composant.id}`)}
                  />
                  {isVendu && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        padding: '3px 8px',
                        backgroundColor: 'rgba(24,33,31,0.65)',
                        color: '#fff',
                        fontSize: '10px',
                        fontFamily: "'IBM Plex Mono', monospace",
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        borderRadius: '3px',
                        pointerEvents: 'none',
                      }}
                      aria-label="Cet équipement a été vendu"
                    >
                      Vendu
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
