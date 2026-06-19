import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import EquipmentCard from '../components/shared/EquipmentCard';
import type { QualiteEtat as QualiteGrade } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

type SortOption = 'prix_asc' | 'prix_desc' | 'recent';

interface Filters {
  search: string;
  categorieId: number | null;
  typeComposant: 'ORGANE' | 'PIECE' | null;
  marque: string | null;
  qualite: QualiteGrade | null;
  prixMin: string;
  prixMax: string;
}

const EMPTY_FILTERS: Filters = {
  search: '',
  categorieId: null,
  typeComposant: null,
  marque: null,
  qualite: null,
  prixMin: '',
  prixMax: '',
};

const QUALITE_LABELS: Record<QualiteGrade, string> = {
  COMME_NEUF: 'Comme neuf',
  TRES_BON: 'Très bon',
  BON: 'Bon',
  CORRECT: 'Correct',
};

// ─── FilterPanel ──────────────────────────────────────────────────────────────

interface FilterPanelProps {
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
  categories: { id: number; libelle: string }[];
  marques: string[];
}

function FilterPanel({ filters, onFiltersChange, categories, marques }: FilterPanelProps) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onFiltersChange({ ...filters, [key]: value });

  const inputBase: React.CSSProperties = {
    width: '100%',
    padding: '6px 10px',
    fontSize: '13px',
    fontFamily: "'IBM Plex Sans', sans-serif",
    color: 'var(--graphite)',
    backgroundColor: 'var(--panel)',
    border: '1px solid var(--rule)',
    borderRadius: '4px',
    outline: 'none',
  };

  const selectBase: React.CSSProperties = { ...inputBase, appearance: 'none', cursor: 'pointer' };
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    fontFamily: "'IBM Plex Mono', monospace",
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--steel)',
    marginBottom: '6px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <span style={labelStyle}>Catégorie</span>
        <select
          style={selectBase}
          value={filters.categorieId ?? ''}
          onChange={e => set('categorieId', e.target.value ? Number(e.target.value) : null)}
          aria-label="Filtrer par catégorie"
        >
          <option value="">Toutes les catégories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.libelle}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span style={labelStyle}>Type</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['ORGANE', 'PIECE'] as const).map(t => {
            const active = filters.typeComposant === t;
            return (
              <button
                key={t}
                onClick={() => set('typeComposant', active ? null : t)}
                style={{
                  flex: 1,
                  padding: '5px 0',
                  fontSize: '12px',
                  fontFamily: "'IBM Plex Mono', monospace",
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  border: '1px solid',
                  borderColor: active ? 'var(--verdigris)' : 'var(--rule)',
                  borderRadius: '4px',
                  backgroundColor: active ? 'var(--verdigris-50)' : 'var(--panel)',
                  color: active ? 'var(--verdigris-700)' : 'var(--steel)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <span style={labelStyle}>Marque</span>
        <select
          style={selectBase}
          value={filters.marque ?? ''}
          onChange={e => set('marque', e.target.value || null)}
          aria-label="Filtrer par marque"
        >
          <option value="">Toutes les marques</option>
          {marques.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div>
        <span style={labelStyle}>Qualité</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {(Object.keys(QUALITE_LABELS) as QualiteGrade[]).map(q => {
            const active = filters.qualite === q;
            return (
              <label
                key={q}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: active ? 'var(--verdigris)' : 'var(--graphite)',
                }}
              >
                <input
                  type="radio"
                  name="qualite"
                  checked={active}
                  onChange={() => set('qualite', active ? null : q)}
                  style={{ accentColor: 'var(--verdigris)', cursor: 'pointer' }}
                />
                {QUALITE_LABELS[q]}
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <span style={labelStyle}>Prix (€)</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="number"
            placeholder="Min"
            value={filters.prixMin}
            onChange={e => set('prixMin', e.target.value)}
            style={{ ...inputBase, width: '50%' }}
            min={0}
            aria-label="Prix minimum"
          />
          <span style={{ color: 'var(--steel)', fontSize: '12px' }}>–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.prixMax}
            onChange={e => set('prixMax', e.target.value)}
            style={{ ...inputBase, width: '50%' }}
            min={0}
            aria-label="Prix maximum"
          />
        </div>
      </div>
    </div>
  );
}

// ─── FilterChips ──────────────────────────────────────────────────────────────

interface Chip {
  label: string;
  onRemove: () => void;
}

function FilterChips({ chips }: { chips: Chip[] }) {
  if (chips.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {chips.map(chip => (
        <span
          key={chip.label}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            fontSize: '12px',
            fontFamily: "'IBM Plex Mono', monospace",
            backgroundColor: 'var(--verdigris-50)',
            color: 'var(--verdigris-700)',
            border: '1px solid rgba(28,122,98,0.25)',
            borderRadius: '4px',
          }}
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            aria-label={`Retirer le filtre ${chip.label}`}
            style={{
              background: 'none',
              border: 'none',
              padding: '0 0 0 2px',
              cursor: 'pointer',
              color: 'var(--verdigris)',
              fontSize: '14px',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      style={{
        backgroundColor: 'var(--panel)',
        border: '1px solid var(--rule)',
        borderRadius: '6px',
        overflow: 'hidden',
      }}
    >
      <div
        className="animate-pulse"
        style={{ aspectRatio: '4/3', backgroundColor: 'var(--rule)' }}
      />
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="animate-pulse" style={{ height: '14px', width: '60%', backgroundColor: 'var(--rule)', borderRadius: '3px' }} />
        <div className="animate-pulse" style={{ height: '12px', width: '80%', backgroundColor: 'var(--rule)', borderRadius: '3px' }} />
        <div className="animate-pulse" style={{ height: '10px', width: '45%', backgroundColor: 'var(--rule)', borderRadius: '3px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
          <div className="animate-pulse" style={{ height: '20px', width: '30%', backgroundColor: 'var(--rule)', borderRadius: '3px' }} />
          <div className="animate-pulse" style={{ height: '18px', width: '18px', borderRadius: '50%', backgroundColor: 'var(--rule)' }} />
        </div>
      </div>
    </div>
  );
}

// ─── CataloguePage ────────────────────────────────────────────────────────────

export default function CataloguePage() {
  const { state, toggleFavori } = useApp();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortOption>('recent');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [loading] = useState(false);

  const enVente = useMemo(
    () => state.composants.filter(c => c.etatActuel === 'EN_VENTE'),
    [state.composants]
  );

  const marques = useMemo(
    () => Array.from(new Set(enVente.map(c => c.marque).filter(Boolean))).sort(),
    [enVente]
  );

  const etapesCount = useCallback(
    (id: number) => state.etapes.filter(e => e.composantId === id).length,
    [state.etapes]
  );

  const filtered = useMemo(() => {
    let result = [...enVente];

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(c =>
        c.nom.toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q)
      );
    }
    if (filters.categorieId !== null) {
      result = result.filter(c => c.categorieId === filters.categorieId);
    }
    if (filters.typeComposant !== null) {
      result = result.filter(c => {
        if (c.typeComposant !== filters.typeComposant) return false;
      });
    }
    if (filters.marque !== null) {
      result = result.filter(c => c.marque === filters.marque);
    }
    if (filters.qualite !== null) {
      result = result.filter(c => c.qualite === filters.qualite);
    }
    if (filters.prixMin !== '') {
      const min = parseFloat(filters.prixMin);
      if (!isNaN(min)) result = result.filter(c => (c.prix ?? 0) >= min);
    }
    if (filters.prixMax !== '') {
      const max = parseFloat(filters.prixMax);
      if (!isNaN(max)) result = result.filter(c => (c.prix ?? 0) <= max);
    }

    result.sort((a, b) => {
      if (sort === 'prix_asc') return (a.prix ?? 0) - (b.prix ?? 0);
      if (sort === 'prix_desc') return (b.prix ?? 0) - (a.prix ?? 0);
      return new Date(b.datePublication || '').getTime() - new Date(a.datePublication || '').getTime();
    });

    return result;
  }, [enVente, filters, sort]);

  const chips: Chip[] = useMemo(() => {
    const result: Chip[] = [];
    if (filters.categorieId !== null) {
      const cat = state.categories.find(c => c.id === filters.categorieId);
      if (cat) result.push({ label: cat.libelle, onRemove: () => setFilters(f => ({ ...f, categorieId: null })) });
    }
    if (filters.typeComposant !== null) {
      result.push({ label: filters.typeComposant, onRemove: () => setFilters(f => ({ ...f, typeComposant: null })) });
    }
    if (filters.marque !== null) {
      result.push({ label: filters.marque, onRemove: () => setFilters(f => ({ ...f, marque: null })) });
    }
    if (filters.qualite !== null) {
      result.push({ label: QUALITE_LABELS[filters.qualite], onRemove: () => setFilters(f => ({ ...f, qualite: null })) });
    }
    if (filters.prixMin !== '') {
      result.push({ label: `Min ${filters.prixMin} €`, onRemove: () => setFilters(f => ({ ...f, prixMin: '' })) });
    }
    if (filters.prixMax !== '') {
      result.push({ label: `Max ${filters.prixMax} €`, onRemove: () => setFilters(f => ({ ...f, prixMax: '' })) });
    }
    return result;
  }, [filters, state.categories]);

  const hasActiveFilters = chips.length > 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--atelier)' }}>
      {/* Promise band */}
      <div
        style={{
          backgroundColor: 'var(--graphite)',
          color: 'var(--verdigris-50)',
          textAlign: 'center',
          padding: '9px 16px',
          fontSize: '12px',
          fontFamily: "'IBM Plex Mono', monospace",
          letterSpacing: '0.06em',
        }}
      >
        Chaque équipement, son dossier complet
      </div>

      {/* Sticky search + sort bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: 'var(--panel)',
          borderBottom: '1px solid var(--rule)',
          padding: '12px 16px',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
        }}
      >
        <input
          type="search"
          placeholder="Rechercher un équipement…"
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '14px',
            fontFamily: "'IBM Plex Sans', sans-serif",
            color: 'var(--graphite)',
            backgroundColor: 'var(--atelier)',
            border: '1px solid var(--rule)',
            borderRadius: '4px',
            outline: 'none',
          }}
          aria-label="Rechercher par nom ou description"
        />

        {/* Mobile filter trigger */}
        <button
          className="md:hidden"
          onClick={() => setFilterSheetOpen(true)}
          aria-expanded={filterSheetOpen}
          aria-label="Ouvrir les filtres"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            fontSize: '13px',
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: '0.05em',
            backgroundColor: hasActiveFilters ? 'var(--verdigris-50)' : 'var(--atelier)',
            color: hasActiveFilters ? 'var(--verdigris)' : 'var(--steel)',
            border: '1px solid',
            borderColor: hasActiveFilters ? 'var(--verdigris)' : 'var(--rule)',
            borderRadius: '4px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Filtrer
          {hasActiveFilters && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: 'var(--verdigris)',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 600,
              }}
            >
              {chips.length}
            </span>
          )}
        </button>

        {/* Sort */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortOption)}
          aria-label="Trier les résultats"
          style={{
            padding: '8px 10px',
            fontSize: '13px',
            fontFamily: "'IBM Plex Mono', monospace",
            color: 'var(--graphite)',
            backgroundColor: 'var(--atelier)',
            border: '1px solid var(--rule)',
            borderRadius: '4px',
            outline: 'none',
            cursor: 'pointer',
            appearance: 'none',
            minWidth: '160px',
          }}
        >
          <option value="recent">Plus récent</option>
          <option value="prix_asc">Prix croissant</option>
          <option value="prix_desc">Prix décroissant</option>
        </select>
      </div>

      {/* Layout: sidebar (md+) + main */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '24px 16px',
          display: 'flex',
          gap: '32px',
          alignItems: 'flex-start',
        }}
      >
        {/* Desktop sidebar */}
        <aside
          className="hidden md:block"
          style={{
            width: '240px',
            flexShrink: 0,
            position: 'sticky',
            top: '73px',
            backgroundColor: 'var(--panel)',
            border: '1px solid var(--rule)',
            borderRadius: '6px',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span
              style={{
                fontSize: '11px',
                fontFamily: "'IBM Plex Mono', monospace",
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--steel)',
              }}
            >
              Filtres
            </span>
            {hasActiveFilters && (
              <button
                onClick={() => setFilters(EMPTY_FILTERS)}
                style={{
                  fontSize: '11px',
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  color: 'var(--verdigris)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Tout effacer
              </button>
            )}
          </div>
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            categories={state.categories}
            marques={marques}
          />
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* Result count + chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
            <span
              style={{
                fontSize: '12px',
                fontFamily: "'IBM Plex Mono', monospace",
                color: 'var(--steel)',
                letterSpacing: '0.05em',
              }}
            >
              {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
            </span>
            <FilterChips chips={chips} />
            {hasActiveFilters && (
              <button
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="md:hidden"
                style={{
                  fontSize: '12px',
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  color: 'var(--verdigris)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Tout effacer
              </button>
            )}
          </div>

          {/* Grid or states */}
          {loading ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
              }}
              className="md:grid-cols-3"
            >
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '64px 24px',
                textAlign: 'center',
                gap: '16px',
              }}
            >
              <span
                style={{
                  fontSize: '14px',
                  color: 'var(--steel)',
                  fontFamily: "'IBM Plex Sans', sans-serif",
                }}
              >
                Aucun équipement ne correspond à ces filtres.
              </span>
              <button
                onClick={() => setFilters(EMPTY_FILTERS)}
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
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
              }}
              className="md:grid-cols-3"
            >
              {filtered.map(composant => (
                <EquipmentCard
                  key={composant.id}
                  composant={composant}
                  categorie={state.categories.find(c => c.id === composant.categorieId)}
                  isFavori={state.favoris.includes(composant.id)}
                  onToggleFavori={() => toggleFavori(composant.id)}
                  etapesCount={etapesCount(composant.id)}
                  onClick={() => navigate(`/equipement/${composant.id}`)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile filter sheet */}
      {filterSheetOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setFilterSheetOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(24,33,31,0.45)',
              zIndex: 50,
            }}
            aria-hidden="true"
          />
          {/* Sheet */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filtres"
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 51,
              backgroundColor: 'var(--panel)',
              borderRadius: '12px 12px 0 0',
              padding: '20px 20px 32px',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span
                style={{
                  fontSize: '14px',
                  fontFamily: "'Archivo', sans-serif",
                  fontWeight: 700,
                  color: 'var(--graphite)',
                }}
              >
                Filtres
              </span>
              <button
                onClick={() => setFilterSheetOpen(false)}
                aria-label="Fermer les filtres"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  color: 'var(--steel)',
                  cursor: 'pointer',
                  padding: '4px',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              categories={state.categories}
              marques={marques}
            />
            <button
              onClick={() => setFilterSheetOpen(false)}
              style={{
                marginTop: '24px',
                width: '100%',
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
              Voir les résultats ({filtered.length})
            </button>
          </div>
        </>
      )}
    </div>
  );
}
