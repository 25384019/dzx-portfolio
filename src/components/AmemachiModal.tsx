import React, { useEffect, useRef, useState, useCallback } from 'react';

interface AmemachiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AmemachiModal: React.FC<AmemachiModalProps> = ({ isOpen, onClose }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeView, setActiveView] = useState<'default' | 'detail' | 'right' | 'left'>('default');
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setActiveView('default');
      setIframeLoaded(false);
    }
  }, [isOpen]);

  const handleSetView = useCallback((view: 'default' | 'detail' | 'right' | 'left') => {
    setActiveView(view);
    try {
      const iframeWin = iframeRef.current?.contentWindow as any;
      if (iframeWin && iframeWin.__storeScene?.setView) {
        iframeWin.__storeScene.setView(view);
      }
    } catch {
      // Ignore if iframe not yet ready
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="雨町商店 3D 实时探索"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(3, 5, 8, 0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '24px 16px',
        animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 'min(94vw, 1340px)',
          height: 'min(88vh, 880px)',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, rgba(10, 16, 22, 0.92) 0%, rgba(6, 9, 13, 0.95) 100%)',
          border: '1px solid rgba(110, 158, 174, 0.32)',
          borderRadius: 16,
          boxShadow: '0 32px 80px rgba(0, 0, 0, 0.85), 0 0 48px rgba(78, 126, 144, 0.18)',
          overflow: 'hidden',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            padding: '14px 22px',
            borderBottom: '1px solid rgba(223, 231, 224, 0.1)',
            background: 'rgba(5, 8, 12, 0.7)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Title & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#61d7b2',
                  boxShadow: '0 0 10px #61d7b2',
                }}
              />
              <span
                style={{
                  fontFamily: "'Onest', system-ui, sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: '#dfe7e0',
                  textTransform: 'uppercase',
                }}
              >
                雨町商店 · AMEMACHI DIORAMA
              </span>
            </div>
            <span
              style={{
                fontSize: 10,
                color: 'rgba(223, 231, 224, 0.45)',
                letterSpacing: '0.08em',
              }}
            >
              | THREE.JS R160 REAL-TIME 3D
            </span>
          </div>

          {/* Camera View Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '3px 6px',
              borderRadius: 8,
              border: '1px solid rgba(223, 231, 224, 0.1)',
            }}
          >
            <span style={{ fontSize: 10, color: 'rgba(223, 231, 224, 0.5)', marginRight: 4 }}>
              视角:
            </span>
            {[
              { id: 'default', label: '街角全景' },
              { id: 'detail', label: '便利店特写' },
              { id: 'right', label: '侧翼车道' },
              { id: 'left', label: '雨巷纵深' },
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => handleSetView(v.id as any)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 11,
                  fontFamily: 'inherit',
                  fontWeight: activeView === v.id ? 600 : 400,
                  background: activeView === v.id ? 'rgba(110, 158, 174, 0.3)' : 'transparent',
                  color: activeView === v.id ? '#61d7b2' : 'rgba(223, 231, 224, 0.7)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Actions: Open standalone & Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a
              href="/amemachi.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 6,
                background: 'rgba(110, 158, 174, 0.15)',
                border: '1px solid rgba(110, 158, 174, 0.35)',
                color: '#b4c8d8',
                fontSize: 11,
                fontWeight: 600,
                textDecoration: 'none',
                letterSpacing: '0.06em',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(110, 158, 174, 0.3)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(110, 158, 174, 0.15)';
                e.currentTarget.style.color = '#b4c8d8';
              }}
            >
              <span>独立全屏</span>
              <span>↗</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              aria-label="关闭 3D 探索"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(223, 231, 224, 0.15)',
                color: '#dfe7e0',
                fontSize: 16,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(220, 60, 60, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(220, 60, 60, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(223, 231, 224, 0.15)';
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* 3D Canvas Iframe Container */}
        <div
          style={{
            position: 'relative',
            flex: 1,
            width: '100%',
            background: '#172738',
            overflow: 'hidden',
          }}
        >
          {!iframeLoaded && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                color: 'rgba(223, 231, 224, 0.6)',
                fontSize: 12,
                letterSpacing: '0.1em',
                background: '#172738',
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  border: '2px solid rgba(110, 158, 174, 0.3)',
                  borderTopColor: '#61d7b2',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span>INITIALIZING 3D RAIN DIORAMA...</span>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src="/amemachi.html"
            title="雨町商店 3D 街角微缩模型"
            onLoad={() => setIframeLoaded(true)}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
            }}
          />
        </div>

        {/* Footer Interaction Hints */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            padding: '10px 22px',
            borderTop: '1px solid rgba(223, 231, 224, 0.08)',
            background: 'rgba(5, 8, 12, 0.85)',
            fontSize: 11,
            color: 'rgba(223, 231, 224, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span>🖱️ 左键拖拽自由环绕</span>
            <span>📜 滚轮缩放景深</span>
            <span>🖱️ 右键平移视角</span>
            <span>⚡ 双击场景重置视角</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#6e9eae' }}>✦ PLANAR MIRROR REFLECTION</span>
            <span style={{ color: '#61d7b2' }}>✦ UNREAL BLOOM</span>
            <span style={{ color: '#f2c8d0' }}>✦ WEATHER SYSTEM</span>
          </div>
        </div>
      </div>
    </div>
  );
};
