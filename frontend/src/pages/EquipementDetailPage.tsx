import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { useLogin } from '../hooks/auth';
import { useComposant, useComposants, useAcheter } from '../hooks/composants';
import { useCategories } from '../hooks/categories';
import { useEtapes } from '../hooks/etapes';
import { useFavorisIds, useToggleFavori } from '../hooks/favoris';
import ImageGallery from '../components/shared/ImageGallery';
import ReferencePlate from '../components/shared/ReferencePlate';
import StateBadge from '../components/shared/StateBadge';
import QualityGauge from '../components/shared/QualityGauge';
import PriceTag from '../components/shared/PriceTag';
import TraceabilityTimeline from '../components/shared/TraceabilityTimeline';
import EquipmentCard from '../components/shared/EquipmentCard';

// ─── AuthSheet ────────────────────────────────────────────────────────────────

function AuthSheet({ onClose }: { onClose: () => void }) {
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
    loginMut.mutate({ email, password }, { onSuccess: () => onClose() });
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(24,33,31,0.45)', zIndex: 50 }}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Connexion requise"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 51,
          backgroundColor: 'var(--panel)',
          borderRadius: '12px 12px 0 0',
          padding: '28px 24px 36px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '16px', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: 'var(--graphite)' }}>
              Connexion requise
            </div>
            <div style={{ fontSize: '13px', color: 'var(--steel)', marginTop: '4px' }}>
              Connectez-vous pour continuer.
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{ background: 'none', border: 'none', fontSize: '22px', color: 'var(--steel)', cursor: 'pointer', padding: '2px', lineHeight: 1 }}
          >
            ×
          </button>
        </div>
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
    </>
  );
}

// ─── ConfirmPurchaseDialog ────────────────────────────────────────────────────

interface ConfirmPurchaseDialogProps {
  nom: string;
  reference: string;
  prix: number;
  garantie: number;
  onClose: () => void;
  onConfirm: () => Promise<{ success: boolean; message: string }>;
}

function ConfirmPurchaseDialog({
  nom,
  reference,
  prix,
  garantie,
  onClose,
  onConfirm,
}: ConfirmPurchaseDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const dateFinGarantie = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + garantie);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }, [garantie]);

  const handleConfirm = async () => {
    setBusy(true);
    setError(null);
    const result = await onConfirm();
    setBusy(false);
    if (!result.success) {
      setError(result.message);
    } else {
      onClose();
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(24,33,31,0.5)', zIndex: 60 }}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Confirmer l'achat"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 61,
          backgroundColor: 'var(--panel)',
          border: '1px solid var(--rule)',
          borderRadius: '8px',
          padding: '28px',
          width: 'min(460px, calc(100vw - 32px))',
          boxShadow: '0 8px 32px rgba(24,33,31,0.15)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '15px', fontFamily: "'Archivo', sans-serif", fontWeight: 700, color: 'var(--graphite)' }}>
              Confirmer l'achat
            </div>
            <div
              style={{
                marginTop: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                backgroundColor: 'var(--brass-50)',
                border: '1px solid rgba(168,124,42,0.25)',
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: "'IBM Plex Mono', monospace",
                color: 'var(--brass)',
                letterSpacing: '0.06em',
              }}
            >
              Achat simulé — aucun paiement réel
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{ background: 'none', border: 'none', fontSize: '22px', color: 'var(--steel)', cursor: 'pointer', padding: '2px', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* Item identity */}
        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--atelier)',
            border: '1px solid var(--rule)',
            borderRadius: '5px',
            marginBottom: '16px',
          }}
        >
          <div style={{ fontSize: '15px', fontFamily: "'Archivo', sans-serif", fontWeight: 600, color: 'var(--graphite)', marginBottom: '8px' }}>
            {nom}
          </div>
          <ReferencePlate reference={reference} size="sm" />
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <PriceTag prix={prix} size="lg" />
          </div>
          <div
            style={{
              marginTop: '10px',
              fontSize: '12px',
              fontFamily: "'IBM Plex Sans', sans-serif",
              color: 'var(--verdigris)',
            }}
          >
            {garantie} mois — valable jusqu'au {dateFinGarantie}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--oxide-50)',
              border: '1px solid rgba(156,74,44,0.25)',
              borderRadius: '4px',
              color: 'var(--oxide)',
              fontSize: '13px',
              marginBottom: '14px',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '11px',
              fontSize: '13px',
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: 500,
              backgroundColor: 'transparent',
              color: 'var(--steel)',
              border: '1px solid var(--rule)',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={busy}
            style={{
              flex: 2,
              padding: '11px',
              fontSize: '14px',
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: 600,
              backgroundColor: busy ? 'var(--steel)' : 'var(--verdigris)',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: busy ? 'not-allowed' : 'pointer',
            }}
          >
            {busy ? 'Achat en cours…' : "Confirmer l'achat"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── HeartButton ──────────────────────────────────────────────────────────────

function HeartButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={active ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      aria-pressed={active}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '1px solid var(--rule)',
        backgroundColor: active ? 'var(--oxide-50)' : 'var(--panel)',
        color: active ? 'var(--oxide)' : 'var(--steel)',
        cursor: 'pointer',
        fontSize: '18px',
        transition: 'all 0.15s',
        flexShrink: 0,
      }}
    >
      {active ? '♥' : '♡'}
    </button>
  );
}

// ─── EquipementDetailPage ─────────────────────────────────────────────────────

export default function EquipementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, showToast } = useApp();

  const composantId = Number(id);
  const { data: composant, isLoading, isError } = useComposant(composantId);
  const { data: categoriesData } = useCategories();
  const { data: etapesData } = useEtapes(composantId);
  const { data: enVenteData } = useComposants({ etat: 'EN_VENTE' });
  const { data: parent } = useComposant(composant?.parentOrganeId ?? 0);
  const favorisIds = useFavorisIds();
  const toggleFavoriMut = useToggleFavori();
  const acheterMut = useAcheter();

  const [authSheetOpen, setAuthSheetOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const categorie = composant ? (categoriesData ?? []).find(c => c.id === composant.categorieId) : undefined;
  const etapes = etapesData ?? [];
  const parentOrgane = composant?.parentOrganeId ? parent : undefined;
  const categories = categoriesData ?? [];

  const recommendations = useMemo(() => {
    if (!composant) return [];
    return (enVenteData ?? [])
      .filter(c =>
        c.id !== composant.id &&
        c.etatActuel === 'EN_VENTE' &&
        (
          c.categorieId === composant.categorieId ||
          (composant.prix && c.prix && Math.abs(c.prix - composant.prix) / composant.prix <= 0.30)
        )
      )
      .slice(0, 3);
  }, [composant, enVenteData]);

  if (isLoading) {
    return (
      <div style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--steel)', fontFamily: "'IBM Plex Sans', sans-serif" }}>
        Chargement…
      </div>
    );
  }

  if (isError || !composant) {
    return (
      <div style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--steel)', fontFamily: "'IBM Plex Sans', sans-serif" }}>
        Équipement introuvable.
      </div>
    );
  }

  const isEnVente = composant.etatActuel === 'EN_VENTE';
  const prix = composant.prix ?? 0;
  const garantie = composant.garantie ?? 12;
  const favoriLocal = favorisIds.has(composantId);

  const handleFavoriToggle = (targetId: number = composantId) => {
    if (!isAuthenticated) {
      setAuthSheetOpen(true);
      return;
    }
    toggleFavoriMut.mutate({ id: targetId, isFavori: favorisIds.has(targetId) });
  };

  const handleBuyClick = () => {
    if (!isAuthenticated) {
      setAuthSheetOpen(true);
      return;
    }
    setConfirmDialogOpen(true);
  };

  const handleConfirmPurchase = async (): Promise<{ success: boolean; message: string }> => {
    try {
      await acheterMut.mutateAsync(composantId);
      showToast('Achat confirmé. Retrouvez votre commande dans Mes commandes.', 'success');
      navigate('/commandes');
      return { success: true, message: '' };
    } catch (e: unknown) {
      return { success: false, message: (e as { message?: string })?.message ?? "Cet article vient d'être vendu." };
    }
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: '11px',
    fontFamily: "'IBM Plex Mono', monospace",
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--steel)',
    display: 'block',
    marginBottom: '16px',
    paddingBottom: '10px',
    borderBottom: '1px solid var(--rule)',
  };

  return (
    <div style={{ backgroundColor: 'var(--atelier)', minHeight: '100vh', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 16px' }}>

        {/* Back link */}
        <div style={{ padding: '16px 0 8px' }}>
          <button
            onClick={() => navigate('/catalogue')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontFamily: "'IBM Plex Mono', monospace',",
              color: 'var(--steel)',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            ← Catalogue
          </button>
        </div>

        {/* MOVEMENT 1 — Identity nameplate */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '0',
          }}
          className="md:grid-cols-[1fr_340px] md:gap-8"
        >
          {/* Left column: gallery + identity */}
          <div>
            <ImageGallery images={composant.images || []} />

            <div style={{ padding: '24px 0 0' }}>
              {/* Category eyebrow */}
              {categorie && (
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
                  {categorie?.libelle}
                </span>
              )}

              {/* Nom */}
              <h1
                style={{
                  fontFamily: "'Archivo', sans-serif",
                  fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                  fontWeight: 700,
                  color: 'var(--graphite)',
                  margin: '0 0 12px',
                  lineHeight: 1.15,
                  letterSpacing: '-0.01em',
                }}
              >
                {composant.nom}
              </h1>

              {/* Reference plate */}
              <div style={{ marginBottom: '14px' }}>
                <ReferencePlate
                  reference={composant.modele || composant.marque}
                  marque={composant.marque}
                  modele={composant.modele}
                  size="md"
                />
              </div>

              {/* State + quality row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
                <StateBadge state={composant.etatActuel} size="md" />
                {composant.qualite && <QualityGauge qualite={composant.qualite} size="md" />}
              </div>

              {/* Price */}
              <div style={{ marginBottom: '10px' }}>
                <PriceTag prix={prix} size="lg" />
              </div>

              {/* Warranty preview */}
              <div
                style={{
                  fontSize: '13px',
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  color: 'var(--verdigris)',
                  marginBottom: '20px',
                }}
              >
                Garantie {garantie} mois — active à l'achat.
              </div>

              {/* Heart toggle (mobile visible) */}
              <div className="md:hidden" style={{ marginBottom: '24px' }}>
                <HeartButton active={favoriLocal} onClick={handleFavoriToggle} />
              </div>

              {/* Description */}
              {composant.description && (
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--steel)',
                    lineHeight: 1.65,
                    margin: '0 0 24px',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                  }}
                >
                  {composant.description}
                </p>
              )}

              {/* Parent organe note */}
              {parentOrgane && (
                <div
                  style={{
                    padding: '10px 14px',
                    backgroundColor: 'var(--brass-50)',
                    border: '1px solid rgba(168,124,42,0.2)',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    color: 'var(--brass)',
                    marginBottom: '24px',
                  }}
                >
                  Pièce issue de l'organe : <strong>{parentOrgane.nom}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Right column: desktop buy module */}
          <aside
            className="hidden md:block"
            style={{ alignSelf: 'flex-start', position: 'sticky', top: '24px' }}
          >
            <div
              style={{
                backgroundColor: 'var(--panel)',
                border: '1px solid var(--rule)',
                borderRadius: '8px',
                padding: '24px',
                marginTop: '0',
              }}
            >
              <PriceTag prix={prix} size="lg" />
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--verdigris)',
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  margin: '8px 0 20px',
                }}
              >
                Garantie {garantie} mois — active à l'achat.
              </div>

              {isEnVente ? (
                <button
                  onClick={handleBuyClick}
                  style={{
                    width: '100%',
                    padding: '13px',
                    fontSize: '15px',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontWeight: 600,
                    backgroundColor: 'var(--verdigris)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginBottom: '12px',
                  }}
                >
                  Acheter
                </button>
              ) : (
                <div
                  style={{
                    width: '100%',
                    padding: '13px',
                    fontSize: '14px',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    color: 'var(--steel)',
                    backgroundColor: 'var(--atelier)',
                    border: '1px solid var(--rule)',
                    borderRadius: '5px',
                    textAlign: 'center',
                    marginBottom: '12px',
                  }}
                >
                  Indisponible
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <HeartButton active={favoriLocal} onClick={handleFavoriToggle} />
              </div>
            </div>
          </aside>
        </div>

        {/* MOVEMENT 2 — Dossier de traçabilité */}
        <section style={{ marginTop: '48px' }}>
          <span style={sectionLabel}>Dossier de traçabilité</span>
          {etapes.length > 0 ? (
            <TraceabilityTimeline etapes={etapes} parentOrganeNom={parentOrgane?.nom} />
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--steel)', fontFamily: "'IBM Plex Sans', sans-serif" }}>
              Aucune étape enregistrée pour cet équipement.
            </p>
          )}
        </section>

        {/* MOVEMENT 3 — Recommendations */}
        {recommendations.length > 0 && (
          <section style={{ marginTop: '56px' }}>
            <span
              style={{
                ...sectionLabel,
                color: 'var(--steel)',
                opacity: 0.7,
              }}
            >
              Équipements similaires
            </span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '16px',
              }}
            >
              {recommendations.map(rec => (
                <EquipmentCard
                  key={rec.id}
                  composant={rec}
                  categorie={categories.find(c => c.id === rec.categorieId)}
                  isFavori={favorisIds.has(rec.id)}
                  onToggleFavori={() => handleFavoriToggle(rec.id)}
                  onClick={() => navigate(`/equipement/${rec.id}`)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky buy bar */}
      {isEnVente && (
        <div
          className="md:hidden"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 30,
            backgroundColor: 'var(--panel)',
            borderTop: '1px solid var(--rule)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <PriceTag prix={prix} size="lg" />
          <button
            onClick={handleBuyClick}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '15px',
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: 600,
              backgroundColor: 'var(--verdigris)',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Acheter
          </button>
        </div>
      )}

      {/* AuthSheet */}
      {authSheetOpen && <AuthSheet onClose={() => setAuthSheetOpen(false)} />}

      {/* ConfirmPurchaseDialog */}
      {confirmDialogOpen && (
        <ConfirmPurchaseDialog
          nom={composant.nom}
          reference={composant.modele || composant.marque}
          prix={prix}
          garantie={garantie}
          onClose={() => setConfirmDialogOpen(false)}
          onConfirm={handleConfirmPurchase}
        />
      )}
    </div>
  );
}
