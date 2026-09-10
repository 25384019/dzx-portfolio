import React from 'react';

interface NavigationProps {
  activeChapter: number;
  onSelectChapter: (index: number) => void;
  isInPortal: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeChapter,
  onSelectChapter,
  isInPortal,
}) => {
  const chapters = [
    { num: '00', label: 'HOME' },
    { num: '01', label: 'ABOUT' },
    { num: '02', label: 'PROJECTS' },
    { num: '03', label: 'INTERESTS' },
    { num: '04', label: 'PHILOSOPHY' },
    { num: '05', label: 'CONTACT' },
  ];

  return (
    <header
      className={`dzx-nav ${isInPortal ? 'portal-hidden' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 50,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 44px',
        pointerEvents: isInPortal ? 'none' : 'auto',
        transition: 'transform 0.8s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.6s ease',
        transform: isInPortal ? 'translate3d(0, -100%, 0)' : 'translate3d(0, 0, 0)',
        opacity: isInPortal ? 0 : 1,
      }}
    >
      {/* Brand Monogram */}
      <div
        onClick={() => onSelectChapter(0)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#6e9eae',
            boxShadow: '0 0 12px #6e9eae, 0 0 24px rgba(110, 158, 174, 0.5)',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontFamily: "'Onest', system-ui, sans-serif",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.22em',
              color: '#dfe7e0',
              textTransform: 'uppercase',
            }}
          >
            DZX
          </span>
          <span
            style={{
              fontSize: 9,
              letterSpacing: '0.18em',
              color: '#6e9eae',
              textTransform: 'uppercase',
              marginTop: -2,
            }}
          >
            DIGITAL EXPLORER
          </span>
        </div>
      </div>

      {/* Chapter Navigation Links */}
      <nav
        className="dzx-nav-links"
        style={{
          display: 'flex',
          gap: 28,
          alignItems: 'center',
          background: 'rgba(5, 7, 10, 0.55)',
          padding: '8px 20px',
          borderRadius: 999,
          border: '1px solid rgba(223, 231, 224, 0.1)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {chapters.map((ch, idx) => (
          <button
            key={ch.num}
            onClick={() => onSelectChapter(idx)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 6px',
              color: activeChapter === idx ? '#fff' : 'rgba(223, 231, 224, 0.55)',
              fontFamily: "'Onest', system-ui, sans-serif",
              fontSize: 11,
              letterSpacing: '0.14em',
              transition: 'all 0.25s ease',
            }}
          >
            <span
              style={{
                fontSize: 9,
                color: activeChapter === idx ? '#6e9eae' : 'rgba(110, 158, 174, 0.45)',
                fontWeight: 600,
              }}
            >
              {ch.num}
            </span>
            <span style={{ fontWeight: activeChapter === idx ? 600 : 400 }}>{ch.label}</span>
          </button>
        ))}
      </nav>

      {/* Status Terminal Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 10,
          letterSpacing: '0.18em',
          color: 'rgba(223, 231, 224, 0.65)',
          fontFamily: "'Onest', monospace",
          textTransform: 'uppercase',
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f2c8d0', boxShadow: '0 0 8px #f2c8d0' }} />
        <span>STATUS · ACTIVE</span>
      </div>
    </header>
  );
};
