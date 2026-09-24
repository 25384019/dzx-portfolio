import React, { useEffect, useRef, useState, useCallback } from 'react';

interface AmemachiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Procedural Pink-Noise Nocturnal Rain Synthesizer via Web Audio API
class AmbientRainAudio {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;

  public play() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.045;
        b6 = white * 0.115926;
      }
      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = buffer;
      this.noiseNode.loop = true;

      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(920, this.ctx.currentTime);
      this.filterNode.Q.setValueAtTime(1.2, this.ctx.currentTime);

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(0.3, this.ctx.currentTime + 1.2);

      this.noiseNode.connect(this.filterNode);
      this.filterNode.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);
      this.noiseNode.start();
    } catch {
      // AudioContext not allowed or unsupported
    }
  }

  public stop() {
    try {
      if (this.gainNode && this.ctx) {
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.ctx.currentTime);
        this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);
        setTimeout(() => {
          try {
            this.noiseNode?.stop();
            this.noiseNode?.disconnect();
            this.filterNode?.disconnect();
            this.gainNode?.disconnect();
          } catch {}
          this.noiseNode = null;
          this.gainNode = null;
          this.filterNode = null;
        }, 450);
      }
    } catch {}
  }

  public dispose() {
    this.stop();
    try {
      this.ctx?.close();
    } catch {}
    this.ctx = null;
  }
}

export const AmemachiModal: React.FC<AmemachiModalProps> = ({ isOpen, onClose }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const audioRef = useRef<AmbientRainAudio | null>(null);
  const [activeView, setActiveView] = useState<'default' | 'detail' | 'right' | 'left'>('default');
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);

  const handleSetView = useCallback((view: 'default' | 'detail' | 'right' | 'left') => {
    setActiveView(view);
    try {
      const iframeWin = iframeRef.current?.contentWindow as any;
      if (iframeWin && iframeWin.__storeScene?.setView) {
        iframeWin.__storeScene.setView(view);
      }
    } catch {}
  }, []);

  const toggleAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new AmbientRainAudio();
    }
    if (isAudioActive) {
      audioRef.current.stop();
      setIsAudioActive(false);
    } else {
      audioRef.current.play();
      setIsAudioActive(true);
    }
  }, [isAudioActive]);

  // Keyboard shortcut listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '1') {
        handleSetView('default');
      } else if (e.key === '2') {
        handleSetView('detail');
      } else if (e.key === '3') {
        handleSetView('right');
      } else if (e.key === '4') {
        handleSetView('left');
      } else if (e.key === 'r' || e.key === 'R' || e.key === '0') {
        handleSetView('default');
      } else if (e.key === 'm' || e.key === 'M') {
        toggleAudio();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleSetView, toggleAudio]);

  // Reset and cleanup audio on modal lifecycle
  useEffect(() => {
    if (isOpen) {
      setActiveView('default');
      setIframeLoaded(false);
    } else {
      if (audioRef.current) {
        audioRef.current.stop();
        audioRef.current.dispose();
        audioRef.current = null;
      }
      setIsAudioActive(false);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.dispose();
        audioRef.current = null;
      }
    };
  }, [isOpen]);

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
        background: 'rgba(3, 5, 8, 0.85)',
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
          width: 'min(95vw, 1360px)',
          height: 'min(89vh, 890px)',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, rgba(10, 16, 22, 0.95) 0%, rgba(6, 9, 13, 0.98) 100%)',
          border: '1px solid rgba(97, 215, 178, 0.35)',
          borderRadius: 16,
          boxShadow: '0 32px 80px rgba(0, 0, 0, 0.88), 0 0 48px rgba(97, 215, 178, 0.15)',
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
            padding: '12px 20px',
            borderBottom: '1px solid rgba(223, 231, 224, 0.1)',
            background: 'rgba(5, 8, 12, 0.75)',
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
                  animation: 'pulse 2s infinite',
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

          {/* Camera View Switcher with Keyboard Shortcut Badges */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '3px 6px',
              borderRadius: 8,
              border: '1px solid rgba(223, 231, 224, 0.1)',
            }}
          >
            <span style={{ fontSize: 10, color: 'rgba(223, 231, 224, 0.5)', marginRight: 2 }}>
              视角:
            </span>
            {[
              { id: 'default', key: '1', label: '街角全景' },
              { id: 'detail', key: '2', label: '便利店特写' },
              { id: 'right', key: '3', label: '侧翼车道' },
              { id: 'left', key: '4', label: '雨巷纵深' },
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => handleSetView(v.id as any)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 11,
                  fontFamily: 'inherit',
                  fontWeight: activeView === v.id ? 600 : 400,
                  background: activeView === v.id ? 'rgba(97, 215, 178, 0.22)' : 'transparent',
                  color: activeView === v.id ? '#61d7b2' : 'rgba(223, 231, 224, 0.7)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    padding: '1px 4px',
                    borderRadius: 3,
                    background: activeView === v.id ? 'rgba(97, 215, 178, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                    color: activeView === v.id ? '#61d7b2' : 'rgba(223, 231, 224, 0.5)',
                  }}
                >
                  {v.key}
                </span>
                <span>{v.label}</span>
              </button>
            ))}
          </div>

          {/* Actions: Audio Toggle + Open standalone + Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Ambient Rain Sound Toggle */}
            <button
              type="button"
              onClick={toggleAudio}
              title="切换环境雨声 [M]"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                background: isAudioActive ? 'rgba(97, 215, 178, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${isAudioActive ? '#61d7b2' : 'rgba(223, 231, 224, 0.15)'}`,
                color: isAudioActive ? '#61d7b2' : 'rgba(223, 231, 224, 0.7)',
                fontSize: 11,
                fontFamily: 'inherit',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <span>{isAudioActive ? '🌧️ 氛围雨声: 开启' : '🌧️ 氛围雨声: 静音'}</span>
              <span style={{ fontSize: 9, opacity: 0.6 }}>[M]</span>
            </button>

            <a
              href="/amemachi.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
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

        {/* 3D Canvas Iframe Container (Perfect Color Match to Three.js #172738) */}
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
                  border: '2px solid rgba(97, 215, 178, 0.3)',
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
              background: '#172738',
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
            padding: '10px 20px',
            borderTop: '1px solid rgba(223, 231, 224, 0.08)',
            background: 'rgba(5, 8, 12, 0.88)',
            fontSize: 11,
            color: 'rgba(223, 231, 224, 0.65)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span>🖱️ 左键自由旋转</span>
            <span>📜 滚轮缩放景深</span>
            <span>🖱️ 右键平移</span>
            <span>⚡ 双击或按 [R] 镜头复位</span>
            <span>⌨️ 快捷键 [1-4] 切换视角</span>
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
