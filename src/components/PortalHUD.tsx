import React, { useEffect } from 'react';

interface PortalHUDProps {
  isInPortal: boolean;
  isVisible?: boolean;
  portalTitle: string;
  onExit: () => void;
}

export const PortalHUD: React.FC<PortalHUDProps> = ({
  isInPortal,
  isVisible = false,
  portalTitle,
  onExit,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Escape' || e.key === ' ') && isInPortal) {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInPortal, onExit]);

  return (
    <>
      {/* Top Return Capsule */}
      <div
        className="dzx-portal-top-hud"
        style={{
          position: 'fixed',
          top: 28,
          left: '50%',
          transform: isVisible
            ? 'translateX(-50%) translate3d(0, 0, 0)'
            : 'translateX(-50%) translate3d(0, -90px, 0)',
          zIndex: 9999,
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? 'auto' : 'none',
          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <button
          onClick={onExit}
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 24px',
            borderRadius: 999,
            background: 'rgba(5, 7, 10, 0.88)',
            border: '1px solid rgba(110, 158, 174, 0.35)',
            backdropFilter: 'blur(20px) saturate(1.2)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
            color: '#dfe7e0',
            fontFamily: "'Onest', system-ui, sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: '0 20px 48px rgba(0,0,0,0.8), 0 0 16px rgba(110,158,174,0.3)',
            transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#f2c8d0',
              boxShadow: '0 0 10px #f2c8d0',
            }}
          />
          <span style={{ color: '#fff', fontWeight: 600 }}>{portalTitle}</span>
          <span style={{ color: 'rgba(223,231,224,0.35)', margin: '0 2px' }}>|</span>
          <span style={{ color: '#b4c8d8' }}>返回主轴</span>
          <span style={{ fontSize: 9, color: 'rgba(223, 231, 224, 0.45)', letterSpacing: '0.1em' }}>[ESC]</span>
        </button>
      </div>

      {/* Bottom Interaction Guide */}
      <div
        className="dzx-portal-bottom-hud"
        style={{
          position: 'fixed',
          bottom: 28,
          left: '50%',
          transform: isVisible
            ? 'translateX(-50%) translate3d(0, 0, 0)'
            : 'translateX(-50%) translate3d(0, 50px, 0)',
          zIndex: 9998,
          opacity: isVisible ? 1 : 0,
          pointerEvents: 'none',
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          fontSize: 11,
          letterSpacing: '0.16em',
          color: 'rgba(223, 231, 224, 0.75)',
          background: 'rgba(5, 7, 10, 0.72)',
          padding: '8px 22px',
          borderRadius: 999,
          border: '1px solid rgba(110, 158, 174, 0.2)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          textTransform: 'uppercase',
          fontFamily: "'Onest', system-ui, sans-serif",
          userSelect: 'none',
        }}
      >
        <span>✦ 移动鼠标感应光影 · 拖拽旋转视角 · 滚轮缩放 · 点击背景返回 ✦</span>
      </div>
    </>
  );
};
