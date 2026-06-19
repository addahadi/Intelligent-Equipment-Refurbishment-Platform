import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import type { Composant, Categorie } from '../../types';

interface EquipmentCardProps {
  composant: Composant;
  categorie?: Categorie;
  isFavori: boolean;
  onToggleFavori: () => void;
  etapesCount?: number;
  onClick: () => void;
}

export default function EquipmentCard({
  composant,
  categorie,
  isFavori,
  onToggleFavori,
  etapesCount,
  onClick,
}: EquipmentCardProps) {
  const [favoriLocal, setFavoriLocal] = useState(isFavori);

  const handleToggleFavori = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriLocal(!favoriLocal);
    onToggleFavori();
  };

  const isEnVente = composant.etatActuel === 'EN_VENTE';
  const isVendu = composant.etatActuel === 'VENDU';
  const isRecycle = composant.etatActuel === 'RECYCLE';
  const isReconditionnement = composant.etatActuel === 'EN_RECONDITIONNEMENT';

  const isDimmed = isVendu || isRecycle;

  const imageSrc = composant.images?.[0];

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'var(--panel)',
        border: '1px solid var(--rule)',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        filter: isDimmed ? 'grayscale(0.8) opacity(0.6)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
      }}
      onMouseEnter={(e) => {
        if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
      }}
    >
      {/* Dimmed status stamp over image */}
      {isDimmed && (
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-15deg)',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '18px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--graphite)',
            border: '2px solid var(--graphite)',
            padding: '4px 12px',
            borderRadius: '4px',
            zIndex: 10,
            pointerEvents: 'none',
            background: 'rgba(250,251,251,0.8)',
            backdropFilter: 'blur(2px)',
          }}
        >
          {isVendu ? 'Vendu' : 'Recyclé'}
        </div>
      )}

      {/* Heart toggle */}
      <button
        onClick={handleToggleFavori}
        aria-label="Toggle favori"
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 10,
          background: 'var(--panel)',
          border: '1px solid var(--rule)',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: favoriLocal ? '#9C4A2C' : 'var(--steel)',
          transition: 'all 0.15s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        }}
        onMouseEnter={e => {
          if (!favoriLocal) (e.currentTarget as HTMLButtonElement).style.color = 'var(--graphite)';
        }}
        onMouseLeave={e => {
          if (!favoriLocal) (e.currentTarget as HTMLButtonElement).style.color = 'var(--steel)';
        }}
      >
        <Heart size={16} fill={favoriLocal ? '#9C4A2C' : 'none'} strokeWidth={2} />
      </button>

      {/* Image Zone */}
      <div
        style={{
          aspectRatio: '4/3',
          backgroundColor: 'var(--atelier)',
          borderBottom: '1px solid var(--rule)',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={composant.nom}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            loading="lazy"
          />
        ) : (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--rule)" strokeWidth="1">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2v20M2 12h20" />
          </svg>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        
        {/* Eyebrow: Type badge + Category */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '9px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'white',
              backgroundColor: composant.typeComposant === 'ORGANE' ? 'var(--verdigris)' : 'var(--brass)',
              padding: '2px 6px',
              borderRadius: '2px',
            }}
          >
            {composant.typeComposant}
          </span>
          {categorie && (
            <span
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '11px',
                color: 'var(--steel)',
              }}
            >
              {categorie.libelle}
            </span>
          )}
        </div>

        {/* Nom */}
        <div
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'var(--graphite)',
            lineHeight: 1.3,
          }}
        >
          {composant.nom}
        </div>

        {/* Reference Plate */}
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            color: 'var(--graphite)',
            backgroundColor: 'var(--atelier)',
            border: '1px solid var(--rule)',
            padding: '4px 8px',
            borderRadius: '4px',
            alignSelf: 'flex-start',
            letterSpacing: '0.02em',
          }}
        >
          {composant.reference}
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--rule)', margin: '4px 0' }} />

        {/* Quality Gauge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '12px',
              color: 'var(--steel)',
            }}
          >
            Qualité
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--graphite)',
            }}
          >
            {composant.qualite.replace('_', ' ')}
          </span>
        </div>

        {/* Price Tag */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '12px',
              color: 'var(--steel)',
            }}
          >
            Prix
          </span>
          <span
            style={{
              fontFamily: "'Archivo', sans-serif",
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--graphite)',
            }}
          >
            {composant.prix > 0 ? `${composant.prix} €` : 'Sur devis'}
          </span>
        </div>

        {/* Trust cue */}
        {isEnVente && etapesCount !== undefined && etapesCount > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: 'auto',
              paddingTop: '8px',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--verdigris)',
              }}
            />
            <span
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '11px',
                color: 'var(--steel)',
              }}
            >
              Dossier tracé ({etapesCount} étapes)
            </span>
          </div>
        )}
        {isReconditionnement && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: 'auto',
              paddingTop: '8px',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--brass)',
              }}
            />
            <span
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '11px',
                color: 'var(--steel)',
              }}
            >
              En reconditionnement
            </span>
          </div>
        )}
      </div>
    </div>
  );
}