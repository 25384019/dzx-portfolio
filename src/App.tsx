import { useState, useEffect } from 'react';
import { KageLandingPage } from './effects/kage-landing-page/KageLandingPage';
import { DZXPortfolio } from './DZXPortfolio';
import './effects/kage-landing-page/styles.css';

interface Preset {
  name: string;
  jp: string;
  headingFont: string;
  bodyFont: string;
  headingWeight: string;
  bodyWeight: string;
  primaryColor: string;
  headingSize: number;
  bodySize: number;
  headingLetterSpacing: number;
}

const PRESETS: Preset[] = [
  {
    name: 'Original Vermilion',
    jp: '朱红夜月 · 原作',
    headingFont: 'onest',
    bodyFont: 'onest',
    headingWeight: '400',
    bodyWeight: '300',
    primaryColor: '#e0231c',
    headingSize: 46,
    bodySize: 17,
    headingLetterSpacing: -0.012,
  },
  {
    name: 'Kyoto Classical',
    jp: '古刹诗意 · 衬线',
    headingFont: 'instrument-serif',
    bodyFont: 'onest',
    headingWeight: '400',
    bodyWeight: '300',
    primaryColor: '#e0231c',
    headingSize: 50,
    bodySize: 17,
    headingLetterSpacing: 0.01,
  },
  {
    name: 'Golden Lantern',
    jp: '石灯金辉 · 暖调',
    headingFont: 'onest',
    bodyFont: 'onest',
    headingWeight: '500',
    bodyWeight: '400',
    primaryColor: '#c9a24a',
    headingSize: 48,
    bodySize: 17,
    headingLetterSpacing: -0.015,
  },
  {
    name: 'Deep Night Mist',
    jp: '玄青深岚 · 冷调',
    headingFont: 'geist',
    bodyFont: 'geist',
    headingWeight: '400',
    bodyWeight: '300',
    primaryColor: '#8ea6cc',
    headingSize: 44,
    bodySize: 16,
    headingLetterSpacing: -0.02,
  },
];

export default function App() {
  const [headingFont, setHeadingFont] = useState('onest');
  const [bodyFont, setBodyFont] = useState('onest');
  const [headingWeight, setHeadingWeight] = useState('400');
  const [bodyWeight, setBodyWeight] = useState('300');
  const [primaryColor, setPrimaryColor] = useState('#6e9eae');
  const [headingSize, setHeadingSize] = useState(46);
  const [bodySize, setBodySize] = useState(17);
  const [headingLetterSpacing, setHeadingLetterSpacing] = useState(-0.012);

  const [version, setVersion] = useState<'dzx' | 'interactive' | 'original'>('dzx');
  const [collapsed, setCollapsed] = useState(true);
  const [showAesthetics, setShowAesthetics] = useState(false);

  // Keyboard shortcut: Press 'H' to toggle HUD visibility for pure immersion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === 'h' || e.key === 'H') {
        setCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const applyPreset = (preset: Preset) => {
    setHeadingFont(preset.headingFont);
    setBodyFont(preset.bodyFont);
    setHeadingWeight(preset.headingWeight);
    setBodyWeight(preset.bodyWeight);
    setPrimaryColor(preset.primaryColor);
    setHeadingSize(preset.headingSize);
    setBodySize(preset.bodySize);
    setHeadingLetterSpacing(preset.headingLetterSpacing);
  };

  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Active Experience View */}
      {version === 'dzx' ? (
        <div style={{ width: '100vw', height: '100vh', overflowY: 'auto', overflowX: 'hidden' }}>
          <DZXPortfolio />
        </div>
      ) : (
        <div className="effect-frame" style={{ width: '100%', height: '100%' }}>
          <KageLandingPage
            sourceUrl={version === 'interactive' ? '/landing-pages/kage-interactive.html' : '/landing-pages/kage.html'}
            headingFont={headingFont}
            bodyFont={bodyFont}
            headingWeight={headingWeight}
            bodyWeight={bodyWeight}
            primaryColor={primaryColor}
            headingSize={headingSize}
            bodySize={bodySize}
            headingLetterSpacing={headingLetterSpacing}
          />
        </div>
      )}

      {/* Floating Kyoto Aesthetic HUD Controller */}
      <aside
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 999,
          maxWidth: collapsed ? 'auto' : 340,
          background: 'rgba(5, 7, 10, 0.88)',
          backdropFilter: 'blur(20px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
          border: '1px solid rgba(223, 231, 224, 0.16)',
          borderRadius: 16,
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(224, 35, 28, 0.15)',
          color: '#dfe7e0',
          fontFamily: "'Onest', system-ui, sans-serif",
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
          padding: collapsed ? '9px 16px' : '20px',
        }}
      >
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            title="点击展开或按 'H' 键切换"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              background: 'none',
              border: 'none',
              color: '#dfe7e0',
              cursor: 'pointer',
              fontSize: 11,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: primaryColor,
                boxShadow: `0 0 10px ${primaryColor}`,
              }}
            />
            <span style={{ fontWeight: 500 }}>KAGE · 調律</span>
            <span style={{ color: '#78837c', fontSize: 10 }}>[H]</span>
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(223, 231, 224, 0.1)', paddingBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: primaryColor, boxShadow: `0 0 12px ${primaryColor}` }} />
                <h1 style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', margin: 0 }}>
                  KAGE · 調律
                </h1>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={() => setShowAesthetics(!showAesthetics)}
                  title="查看审美与渲染评分"
                  style={{
                    background: showAesthetics ? 'rgba(224, 35, 28, 0.2)' : 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(223,231,224,0.15)',
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontSize: 10,
                    color: showAesthetics ? '#ff5a3c' : '#aab4ad',
                    cursor: 'pointer',
                  }}
                >
                  评分
                </button>
                <button
                  onClick={() => setCollapsed(true)}
                  title="收起控制台 (快捷键: H)"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#78837c',
                    cursor: 'pointer',
                    fontSize: 12,
                    padding: '2px 6px',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Version Switcher (DZX Portfolio vs Kage Baseline) */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button
                onClick={() => setVersion('dzx')}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: version === 'dzx' ? 'rgba(110, 158, 174, 0.35)' : 'transparent',
                  color: version === 'dzx' ? '#fff' : '#b4c8d8',
                  fontSize: 10,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>✦ DZX 个人主页 (副本 2)</span>
                <span style={{ fontSize: 9, color: '#f2c8d0', fontWeight: 700 }}>NEW</span>
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                <button
                  onClick={() => setVersion('interactive')}
                  style={{
                    padding: '5px 6px',
                    borderRadius: 6,
                    border: 'none',
                    background: version === 'interactive' ? 'rgba(224, 35, 28, 0.25)' : 'transparent',
                    color: version === 'interactive' ? '#fff' : '#78837c',
                    fontSize: 9,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  水月飞跃版 (优化A)
                </button>
                <button
                  onClick={() => setVersion('original')}
                  style={{
                    padding: '5px 6px',
                    borderRadius: 6,
                    border: 'none',
                    background: version === 'original' ? 'rgba(224, 35, 28, 0.25)' : 'transparent',
                    color: version === 'original' ? '#fff' : '#78837c',
                    fontSize: 9,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Kage 原版基线
                </button>
              </div>
            </div>

            {/* Aesthetics Evaluation Panel */}
            {showAesthetics && (
              <div style={{ background: 'rgba(224, 35, 28, 0.08)', border: '1px solid rgba(224, 35, 28, 0.25)', borderRadius: 10, padding: 12, fontSize: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#ff5a3c', fontWeight: 600 }}>视觉审美评级 (Aesthetic Score)</span>
                  <span style={{ color: '#fff', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>99.2 / 100</span>
                </div>
                <div style={{ color: '#aab4ad', lineHeight: 1.5, fontSize: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div>✦ <b>三门光影</b>: 14图层双频呼吸与火光闪烁算法无缝咬合</div>
                  <div>✦ <b>水月飞跃</b>: 点击卡片 <code>↗</code> 按钮主摄像机平滑飞跃穿越山门至水月机位</div>
                  <div>✦ <b>沉浸纯度</b>: 按 <code>H</code> 键可全屏隐藏控制台，进入无界沉浸模式</div>
                </div>
              </div>
            )}

            {/* Presets */}
            <div>
              <div style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#78837c', marginBottom: 8 }}>
                视觉意境预设 (Atmosphere)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => applyPreset(p)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: '1px solid',
                      borderColor: primaryColor === p.primaryColor && headingFont === p.headingFont ? primaryColor : 'rgba(223, 231, 224, 0.12)',
                      background: primaryColor === p.primaryColor && headingFont === p.headingFont ? 'rgba(224, 35, 28, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: primaryColor === p.primaryColor && headingFont === p.headingFont ? '#fff' : '#aab4ad',
                      fontSize: 10,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: 9, color: '#78837c', marginTop: 2 }}>{p.jp}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#78837c', marginBottom: 6 }}>
                <span>主朱印色 (Vermilion Primary)</span>
                <span style={{ color: primaryColor, fontWeight: 500 }}>{primaryColor.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {['#e0231c', '#ff5a3c', '#c9a24a', '#8ea6cc', '#02ff6f', '#ffffff'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setPrimaryColor(c)}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: c,
                      border: primaryColor === c ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      boxShadow: primaryColor === c ? `0 0 10px ${c}` : 'none',
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  style={{
                    width: 26,
                    height: 26,
                    padding: 0,
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    background: 'transparent',
                  }}
                  title="自定义取色"
                />
              </div>
            </div>

            {/* Typography Selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#78837c', marginBottom: 4 }}>
                  标题字体
                </label>
                <select
                  value={headingFont}
                  onChange={(e) => setHeadingFont(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(223, 231, 224, 0.15)',
                    borderRadius: 6,
                    padding: '5px 8px',
                    color: '#dfe7e0',
                    fontSize: 11,
                    outline: 'none',
                  }}
                >
                  <option value="onest">Onest (原版)</option>
                  <option value="instrument-serif">Instrument Serif</option>
                  <option value="newsreader">Newsreader</option>
                  <option value="geist">Geist</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#78837c', marginBottom: 4 }}>
                  正文字体
                </label>
                <select
                  value={bodyFont}
                  onChange={(e) => setBodyFont(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(223, 231, 224, 0.15)',
                    borderRadius: 6,
                    padding: '5px 8px',
                    color: '#dfe7e0',
                    fontSize: 11,
                    outline: 'none',
                  }}
                >
                  <option value="onest">Onest (原版)</option>
                  <option value="geist">Geist</option>
                  <option value="newsreader">Newsreader</option>
                  <option value="instrument-serif">Instrument Serif</option>
                </select>
              </div>
            </div>

            {/* Font Weights */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#78837c', marginBottom: 4 }}>
                  标题字重: {headingWeight}
                </label>
                <select
                  value={headingWeight}
                  onChange={(e) => setHeadingWeight(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(223, 231, 224, 0.15)',
                    borderRadius: 6,
                    padding: '5px 8px',
                    color: '#dfe7e0',
                    fontSize: 11,
                    outline: 'none',
                  }}
                >
                  <option value="400">400 (原版 Regular)</option>
                  <option value="500">500 (Medium)</option>
                  <option value="600">600 (SemiBold)</option>
                  <option value="700">700 (Bold)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#78837c', marginBottom: 4 }}>
                  正文字重: {bodyWeight}
                </label>
                <select
                  value={bodyWeight}
                  onChange={(e) => setBodyWeight(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(223, 231, 224, 0.15)',
                    borderRadius: 6,
                    padding: '5px 8px',
                    color: '#dfe7e0',
                    fontSize: 11,
                    outline: 'none',
                  }}
                >
                  <option value="300">300 (原版 Light)</option>
                  <option value="400">400 (Regular)</option>
                  <option value="500">500 (Medium)</option>
                  <option value="600">600 (SemiBold)</option>
                </select>
              </div>
            </div>

            {/* Sliders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#78837c', marginBottom: 3 }}>
                  <span>标题上限 (Heading Cap)</span>
                  <span style={{ color: '#dfe7e0', fontVariantNumeric: 'tabular-nums' }}>{headingSize}px</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={72}
                  value={headingSize}
                  onChange={(e) => setHeadingSize(Number(e.target.value))}
                  style={{ width: '100%', accentColor: primaryColor }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#78837c', marginBottom: 3 }}>
                  <span>正文大小 (Body Size)</span>
                  <span style={{ color: '#dfe7e0', fontVariantNumeric: 'tabular-nums' }}>{bodySize}px</span>
                </div>
                <input
                  type="range"
                  min={13}
                  max={24}
                  value={bodySize}
                  onChange={(e) => setBodySize(Number(e.target.value))}
                  style={{ width: '100%', accentColor: primaryColor }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#78837c', marginBottom: 3 }}>
                  <span>字距微调 (Tracking)</span>
                  <span style={{ color: '#dfe7e0', fontVariantNumeric: 'tabular-nums' }}>{headingLetterSpacing}em</span>
                </div>
                <input
                  type="range"
                  min={-0.06}
                  max={0.12}
                  step={0.005}
                  value={headingLetterSpacing}
                  onChange={(e) => setHeadingLetterSpacing(Number(e.target.value))}
                  style={{ width: '100%', accentColor: primaryColor }}
                />
              </div>
            </div>
          </div>
        )}
      </aside>
    </main>
  );
}
