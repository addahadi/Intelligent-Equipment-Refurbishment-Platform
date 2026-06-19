import { CheckCircle, XCircle, ChevronUp, ChevronDown, Pencil, Trash2 } from 'lucide-react';
import type { EtapeTracabilite } from '../../types';

interface TraceabilityTimelineProps {
  etapes: EtapeTracabilite[];
  parentOrganeNom?: string;
  isEditMode?: boolean;
  onMoveUp?: (id: number) => void;
  onMoveDown?: (id: number) => void;
  onEdit?: (etape: EtapeTracabilite) => void;
  onDelete?: (id: number) => void;
}

export default function TraceabilityTimeline({
  etapes,
  parentOrganeNom,
  isEditMode = false,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: TraceabilityTimelineProps) {
  const sorted = [...etapes].sort((a, b) => a.ordre - b.ordre);

  return (
    <div style={{ position: 'relative', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Scope styles for hover effects in edit mode */}
      <style>{`
        .timeline-node-edit .timeline-node-actions { opacity: 0; transition: opacity 0.15s ease; }
        .timeline-node-edit:hover .timeline-node-actions { opacity: 1; }
      `}</style>

      {/* Vertical absolute line */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '12px',
          bottom: '12px',
          left: '27px',
          width: '2px',
          backgroundColor: 'var(--rule)',
          zIndex: 0,
        }}
      />

      {/* Parent Organe Nom */}
      {parentOrganeNom && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              width: '24px',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--steel)' }} />
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '13px',
              fontStyle: 'italic',
              color: 'var(--steel)',
            }}
          >
            Issu de {parentOrganeNom}
          </div>
        </div>
      )}

      {/* Nodes */}
      {sorted.map((etape, idx) => {
        const isDiagnostic = etape.type === 'DIAGNOSTIC';
        const isMiseEnVente = etape.type === 'MISE_EN_VENTE';
        const isRecyclage = etape.type === 'RECYCLAGE';
        
        let verdictClass = '';
        if (isDiagnostic) {
          verdictClass = etape.description.includes('Endommagé') ? 'brass' : 'verdigris';
        }

        const isFirst = idx === 0;
        const isLast = idx === sorted.length - 1;

        return (
          <div
            key={etape.id}
            className={isEditMode ? 'timeline-node-edit' : ''}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Left Node Icon */}
            <div
              style={{
                width: '24px',
                display: 'flex',
                justifyContent: 'center',
                marginTop: '4px',
              }}
            >
              {isDiagnostic ? (
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: `var(--${verdictClass})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '14px',
                    fontWeight: 600,
                    marginLeft: '-6px', // adjust for wider circle
                  }}
                >
                  {etape.ordre}
                </div>
              ) : isMiseEnVente ? (
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--panel)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--verdigris)',
                  }}
                >
                  <CheckCircle size={24} fill="var(--verdigris)" stroke="var(--panel)" />
                </div>
              ) : isRecyclage ? (
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--panel)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--oxide)',
                  }}
                >
                  <XCircle size={24} fill="var(--oxide)" stroke="var(--panel)" />
                </div>
              ) : (
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--graphite)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '11px',
                    fontWeight: 500,
                  }}
                >
                  {etape.ordre}
                </div>
              )}
            </div>

            {/* Content */}
            <div
              style={{
                flex: 1,
                backgroundColor: isMiseEnVente ? 'var(--verdigris-50)' : isRecyclage ? 'var(--oxide-50)' : 'transparent',
                padding: (isMiseEnVente || isRecyclage) ? '12px 16px' : '0',
                borderRadius: '6px',
                border: (isMiseEnVente || isRecyclage) ? '1px solid rgba(0,0,0,0.05)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontFamily: "'Archivo', sans-serif",
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--graphite)',
                    }}
                  >
                    {etape.type.replace(/_/g, ' ')}
                  </span>
                  {isDiagnostic && (
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: '9px',
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: `1px solid var(--${verdictClass})`,
                        color: `var(--${verdictClass})`,
                        backgroundColor: `var(--${verdictClass}-50, transparent)`,
                      }}
                    >
                      {verdictClass === 'verdigris' ? 'Réparable' : 'Endommagé'}
                    </span>
                  )}
                </div>
                
                {/* Actions (Edit Mode) */}
                {isEditMode && (
                  <div className="timeline-node-actions" style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => !isFirst && onMoveUp?.(etape.id)}
                      disabled={isFirst}
                      title="Monter"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: isFirst ? 'default' : 'pointer',
                        color: isFirst ? 'var(--rule)' : 'var(--steel)',
                        padding: '4px',
                        display: 'flex',
                      }}
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => !isLast && onMoveDown?.(etape.id)}
                      disabled={isLast}
                      title="Descendre"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: isLast ? 'default' : 'pointer',
                        color: isLast ? 'var(--rule)' : 'var(--steel)',
                        padding: '4px',
                        display: 'flex',
                      }}
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      onClick={() => onEdit?.(etape)}
                      title="Modifier"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--steel)',
                        padding: '4px',
                        display: 'flex',
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete?.(etape.id)}
                      title="Supprimer"
                      style={{
                        background: 'none',
                        border: '1px solid var(--oxide)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: 'var(--oxide)',
                        padding: '4px',
                        display: 'flex',
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              
              <div
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: '13px',
                  color: 'var(--graphite)',
                  marginTop: '4px',
                  lineHeight: 1.5,
                }}
              >
                {etape.description}
              </div>
              
              <time
                dateTime={etape.date}
                style={{
                  display: 'block',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  color: 'var(--steel)',
                  marginTop: '6px',
                }}
              >
                {new Date(etape.date).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </time>
            </div>
          </div>
        );
      })}
    </div>
  );
}