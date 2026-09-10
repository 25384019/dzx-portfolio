import React, { useEffect, useState } from 'react';

interface PresenceIntroProps {
  isInPortal: boolean;
}

export const PresenceIntro: React.FC<PresenceIntroProps> = ({ isInPortal }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isInPortal) {
      setVisible(false);
      return;
    }

    // 600ms after landing in portal, quietly reveal the micro text
    const showTimer = setTimeout(() => {
      setVisible(true);
    }, 650);

    // After 1.3s of subtle display, gracefully dissolve away
    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 2100);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [isInPortal]);

  if (!isInPortal && !visible) return null;

  return (
    <aside
      aria-hidden="true"
      style={{
        position: 'fixed',
        bottom: 38,
        left: 48,
        zIndex: 99990,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        opacity: visible ? 0.6 : 0,
        transform: visible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 8px, 0)',
        transition: 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        fontFamily: "'Onest', monospace, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: '0.26em',
          color: '#6e9eae',
          textTransform: 'uppercase',
        }}
      >
        PRESENCE DETECTED
      </div>
      <div
        style={{
          fontSize: 8,
          fontWeight: 400,
          letterSpacing: '0.22em',
          color: 'rgba(223, 231, 224, 0.55)',
          textTransform: 'uppercase',
        }}
      >
        SPATIAL INPUT AVAILABLE
      </div>
    </aside>
  );
};
