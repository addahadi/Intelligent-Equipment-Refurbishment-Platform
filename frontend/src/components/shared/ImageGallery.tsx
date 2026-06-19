import React, { useState } from 'react';

interface ImageGalleryProps {
  images?: string[];
}

export default function ImageGallery({ images = [] }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: '4/3',
          backgroundColor: 'var(--atelier)',
          border: '1px solid var(--rule)',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--rule)" strokeWidth="1">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2v20M2 12h20" />
        </svg>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            textTransform: 'uppercase',
            color: 'var(--steel)',
            letterSpacing: '0.05em',
          }}
        >
          Aucune photo
        </span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: '4/3',
          backgroundColor: 'var(--panel)',
          border: '1px solid var(--rule)',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={images[0]}
          alt="Équipement"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>
    );
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveIndex(index);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: 'var(--panel)',
        border: '1px solid var(--rule)',
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Main viewer */}
      <div
        style={{
          width: '100%',
          aspectRatio: '4/3',
          padding: '20px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--panel)',
        }}
      >
        <img
          src={images[activeIndex]}
          alt={`Vue ${activeIndex + 1}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
        
        {/* Counter */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            color: 'var(--graphite)',
            backgroundColor: 'var(--atelier)',
            border: '1px solid var(--rule)',
            padding: '4px 8px',
            borderRadius: '4px',
            letterSpacing: '0.05em',
          }}
        >
          {String(activeIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: 'var(--rule)', width: '100%' }} />

      {/* Thumbnails */}
      <div
        role="listbox"
        aria-label="Galerie de photos"
        style={{
          display: 'flex',
          overflowX: 'auto',
          padding: '12px',
          gap: '8px',
          backgroundColor: 'var(--atelier)',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none',  // IE and Edge
        }}
      >
        <style>{`
          div[role="listbox"]::-webkit-scrollbar { display: none; }
          .thumbnail-btn:focus-visible { outline: none; box-shadow: inset 0 0 0 2px var(--verdigris); }
        `}</style>
        
        {images.map((img, idx) => {
          const isActive = idx === activeIndex;
          
          return (
            <button
              key={idx}
              role="option"
              aria-selected={isActive}
              onClick={() => setActiveIndex(idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="thumbnail-btn"
              style={{
                width: '72px',
                height: '56px',
                flexShrink: 0,
                backgroundColor: 'var(--panel)',
                border: '1px solid var(--rule)',
                borderTop: isActive ? '2px solid var(--verdigris)' : '1px solid var(--rule)',
                borderRadius: '4px',
                padding: '4px',
                cursor: 'pointer',
                opacity: isActive ? 1 : 0.55,
                transition: 'opacity 0.15s ease, border-top-color 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.opacity = '0.55';
              }}
            >
              <img
                src={img}
                alt={`Miniature ${idx + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '2px',
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}