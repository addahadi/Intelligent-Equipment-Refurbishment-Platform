import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { WarrantyStatus } from '../components/shared/WarrantyStatus';
import PriceTag from '../components/shared/PriceTag';

// ─── AuthPrompt ───────────────────────────────────────────────────────────────

function AuthPrompt() {
  const { login } = useApp();
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
    login(email, password);
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
          Mes commandes
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
          Connectez-vous pour consulter vos commandes.
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

// ─── CommandeRow ──────────────────────────────────────────────────────────────

interface CommandeRowProps {
  composantNom: string;
  composantReference: string;
  composantImage: string | undefined;
  prix: number;
  date: string;
  dateFinGarantie: string;
  onDossierClick: () => void;
}

function CommandeRow({
  composantNom,
  composantReference,
  composantImage,
  prix,
  date,
  dateFinGarantie,
  onDossierClick,
}: CommandeRowProps) {
  const dateFormatted = new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <article
      style={{
        backgroundColor: 'var(--panel)',
        border: '1px solid var(--rule)',
        borderRadius: '6px',
        overflow: 'hidden',
      }}
    >
      {/* Top: identity + price */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          gap: '14px',
          alignItems: 'flex-start',
          padding: '16px',
          borderBottom: '1px solid var(--rule)',
        }}
      >
        {/* Thumbnail */}
        <div
          style={{
            width: '64px',
            height: '52px',
            flexShrink: 0,
            backgroundColor: 'var(--atelier)',
            border: '1px solid var(--rule)',
            borderRadius: '4px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-hidden="true"
        >
          {composantImage ? (
            <img
              src={composantImage}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
            />
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="8" stroke="#DCE1E2" strokeWidth="1.5" />
              <line x1="2" y1="10" x2="18" y2="10" stroke="#DCE1E2" strokeWidth="1" />
              <line x1="10" y1="2" x2="10" y2="18" stroke="#DCE1E2" strokeWidth="1" />
            </svg>
          )}
        </div>

        {/* Nom + reference */}
        <div>
          <div
            style={{
              fontSize: '14px',
              fontFamily: "'Archivo', sans-serif",
              fontWeight: 600,
              color: 'var(--graphite)',
              marginBottom: '4px',
              lineHeight: 1.3,
            }}
          >
            {composantNom}
          </div>
          <code
            style={{
              fontSize: '11px',
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: '0.07em',
              color: 'var(--steel)',
              backgroundColor: 'var(--atelier)',
              padding: '2px 6px',
              borderRadius: '3px',
              border: '1px solid var(--rule)',
            }}
          >
            {composantReference}
          </code>
        </div>

        {/* Price */}
        <PriceTag prix={prix} size="md" />
      </div>

      {/* Bottom: date + warranty + dossier link */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <time
            dateTime={date}
            style={{
              fontSize: '12px',
              fontFamily: "'IBM Plex Mono', monospace",
              color: 'var(--steel)',
              letterSpacing: '0.04em',
            }}
          >
            Acheté le {dateFormatted}
          </time>
          <WarrantyStatus dateFinGarantie={dateFinGarantie} showIcon={true} />
        </div>

        <button
          onClick={onDossierClick}
          style={{
            fontSize: '12px',
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--verdigris)',
            backgroundColor: 'transparent',
            border: '1px solid rgba(28,122,98,0.3)',
            borderRadius: '4px',
            padding: '6px 12px',
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'background-color 0.15s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--verdigris-50)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
        >
          Voir le dossier →
        </button>
      </div>
    </article>
  );
}

// ─── CommandesPage ────────────────────────────────────────────────────────────

export default function CommandesPage() {
  const { state } = useApp();
  const navigate = useNavigate();

  if (!state.currentClient) {
    return (
      <div style={{ backgroundColor: 'var(--atelier)', minHeight: '100vh' }}>
        <AuthPrompt />
      </div>
    );
  }

  const clientCommandeIds = state.currentClient.commandes ?? [];
  const commandes = state.commandes
    .filter(cmd => clientCommandeIds.includes(cmd.id))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div style={{ backgroundColor: 'var(--atelier)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>

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
            Mes commandes
          </h1>
          {commandes.length > 0 && (
            <p
              style={{
                fontSize: '13px',
                color: 'var(--steel)',
                margin: '6px 0 0',
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              {commandes.length} commande{commandes.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {commandes.length === 0 ? (
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
            <p
              style={{
                fontSize: '14px',
                color: 'var(--steel)',
                fontFamily: "'IBM Plex Sans', sans-serif",
                margin: 0,
              }}
            >
              Aucune commande pour le moment.
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {commandes.map(commande => {
              const composant = state.composants.find(c => c.id === commande.composantId);
              if (!composant) return null;
              return (
                <CommandeRow
                  key={commande.id}
                  composantNom={composant.nom}
                  composantReference={composant.modele || composant.marque}
                  composantImage={composant.images?.[0]}
                  prix={commande.prix}
                  date={commande.date}
                  dateFinGarantie={commande.dateFinGarantie}
                  onDossierClick={() => navigate(`/equipement/${composant.id}`)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
