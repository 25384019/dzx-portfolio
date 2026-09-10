import React from 'react';

interface ScrollRailProps {
  activeChapter: number;
  onSelectChapter: (index: number) => void;
  isInPortal: boolean;
}

export const ScrollRail: React.FC<ScrollRailProps> = ({
  activeChapter,
  onSelectChapter,
  isInPortal,
}) => {
  const chapters = ['00', '01', '02', '03', '04', '05'];

  return (
    <aside
      className="dzx-scroll-rail"
      aria-label="Chapter progress rail"
      style={{
        position: 'fixed',
        right: 36,
        top: '50%',
        transform: isInPortal
          ? 'translate3d(60px, -50%, 0)'
          : 'translate3d(0, -50%, 0)',
        opacity: isInPortal ? 0 : 1,
        pointerEvents: isInPortal ? 'none' : 'auto',
        zIndex: 45,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        transition: 'transform 0.8s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.6s ease',
      }}
    >
      <div style={{ width: 1, height: 40, background: 'rgba(223, 231, 224, 0.15)' }} />

      {chapters.map((ch, idx) => (
        <button
          key={ch}
          onClick={() => onSelectChapter(idx)}
          aria-label={`Jump to chapter ${ch}`}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 2px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span
            style={{
              width: activeChapter === idx ? 6 : 4,
              height: activeChapter === idx ? 6 : 4,
              borderRadius: '50%',
              background: activeChapter === idx ? '#6e9eae' : 'rgba(223, 231, 224, 0.25)',
              boxShadow: activeChapter === idx ? '0 0 10px #6e9eae' : 'none',
              transition: 'all 0.25s ease',
            }}
          />
          <span
            style={{
              fontFamily: "'Onest', system-ui, sans-serif",
              fontSize: 9,
              letterSpacing: '0.1em',
              color: activeChapter === idx ? '#dfe7e0' : 'rgba(223, 231, 224, 0.3)',
              fontWeight: activeChapter === idx ? 600 : 400,
              transition: 'color 0.25s ease',
            }}
          >
            {ch}
          </span>
        </button>
      ))}

      <div style={{ width: 1, height: 40, background: 'rgba(223, 231, 224, 0.15)' }} />
    </aside>
  );
};
