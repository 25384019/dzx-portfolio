import React, { useState } from 'react';

interface MediaCardProps {
  isInPortal: boolean;
  scrollProgress?: number;
}

export const MediaCard: React.FC<MediaCardProps> = ({ isInPortal, scrollProgress = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Smoothly fade out as camera approaches Chapter 5 Terminal Horizon (progress 4.45 -> 4.8)
  const contactFade = Math.min(Math.max((scrollProgress - 4.45) / 0.35, 0), 1);
  const baseOpacity = isHovered ? 1 : 0.68;
  const finalOpacity = (1.0 - contactFade) * (isInPortal ? 0 : baseOpacity);
  const isHidden = finalOpacity < 0.04;

  return (
    <aside
      className="dzx-media-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'fixed',
        // Stacked neatly 16px above DZX · SIGNAL [H] (bottom: 24, right: 24) without overlapping
        bottom: 74,
        right: 24,
        zIndex: 40,
        // Reduced size by ~14% from original 280px to 240px
        width: 240,
        background: isHovered ? 'rgba(8, 12, 18, 0.88)' : 'rgba(5, 7, 10, 0.65)',
        border: `1px solid ${isHovered ? 'rgba(110, 158, 174, 0.45)' : 'rgba(223, 231, 224, 0.12)'}`,
        borderRadius: 14,
        padding: '14px 16px',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: isHovered
          ? '0 16px 36px rgba(0, 0, 0, 0.75), 0 0 16px rgba(110, 158, 174, 0.25)'
          : '0 10px 24px rgba(0, 0, 0, 0.55)',
        transform: isInPortal
          ? 'translate3d(0, 80px, 0)'
          : contactFade > 0.1
          ? `translate3d(0, ${(contactFade * 20).toFixed(1)}px, 0)`
          : 'translate3d(0, 0, 0)',
        opacity: finalOpacity,
        pointerEvents: isHidden ? 'none' : 'auto',
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: 9,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#6e9eae',
            fontWeight: 600,
          }}
        >
          CREATIVE ARCHIVE
        </span>
        <span
          style={{
            fontSize: 9,
            color: 'rgba(223, 231, 224, 0.45)',
            letterSpacing: '0.12em',
          }}
        >
          REC · 2026
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderTop: '1px solid rgba(223, 231, 224, 0.08)',
          paddingTop: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, rgba(110, 158, 174, 0.2), rgba(242, 200, 208, 0.15))',
            border: '1px solid rgba(110, 158, 174, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dfe7e0" strokeWidth="1.8">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: '#dfe7e0',
              letterSpacing: '0.04em',
            }}
          >
            Synthesizing Future
          </span>
          <span
            style={{
              fontSize: 9,
              color: 'rgba(223, 231, 224, 0.5)',
              letterSpacing: '0.08em',
            }}
          >
            Photography & Ambient Audio
          </span>
        </div>
      </div>
    </aside>
  );
};
