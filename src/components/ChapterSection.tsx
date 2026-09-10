import React from 'react';

interface ChapterSectionProps {
  onExploreXiaoZhaiOS: () => void;
}

export const ChapterSection: React.FC<ChapterSectionProps> = ({ onExploreXiaoZhaiOS }) => {
  return (
    <div className="dzx-chapters-container" style={{ position: 'relative', zIndex: 10, pointerEvents: 'auto' }}>
      {/* 00 HOME / ORIGIN */}
      <section
        id="ch-00"
        className="dzx-section"
        data-cam="0"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '120px 8vw 80px 8vw',
          position: 'relative',
        }}
      >
        <div className="dzx-chapter-content" data-ch="0" style={{ maxWidth: 840, willChange: 'transform, opacity' }}>
          {/* Eyebrow */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(110, 158, 174, 0.12)',
              border: '1px solid rgba(110, 158, 174, 0.25)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.22em',
              color: '#6e9eae',
              textTransform: 'uppercase',
              marginBottom: 28,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#6e9eae' }} />
            CHAPTER 00 — ORIGIN
          </div>

          {/* Asymmetric Bold Headline */}
          <h1
            style={{
              fontFamily: "'Onest', system-ui, sans-serif",
              fontSize: 'clamp(44px, 7vw, 84px)',
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: '-0.025em',
              color: '#dfe7e0',
              margin: '0 0 16px 0',
              textTransform: 'uppercase',
            }}
          >
            DZX
            <br />
            <span style={{ color: '#b4c8d8', fontWeight: 700 }}>DIGITAL EXPLORER</span>
          </h1>

          <div
            style={{
              fontSize: 'clamp(18px, 2.4vw, 28px)',
              fontWeight: 300,
              letterSpacing: '0.12em',
              color: '#f2c8d0',
              textTransform: 'uppercase',
              marginBottom: 28,
            }}
          >
            BUILD. CREATE. EVOLVE.
          </div>

          <p
            style={{
              maxWidth: 580,
              fontSize: 16,
              lineHeight: 1.7,
              color: 'rgba(223, 231, 224, 0.72)',
              fontWeight: 300,
              letterSpacing: '0.01em',
              marginBottom: 36,
            }}
          >
            Bridging synthetic intelligence, resilient software architecture, cinematic visual storytelling,
            and relentless physical discipline into coherent digital frontiers.
          </p>

          {/* Domain Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            {['AI & COGNITION', 'SOFTWARE ARCHITECTURE', 'PHOTOGRAPHY', 'FITNESS', 'MUSIC'].map((tag) => (
              <span
                key={tag}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(223, 231, 224, 0.12)',
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  color: '#dfe7e0',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Scroll Prompt */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            left: '8vw',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(223, 231, 224, 0.45)',
          }}
        >
          <span>SCROLL TO ENTER DEPTH</span>
          <span style={{ color: '#6e9eae' }}>↓</span>
        </div>
      </section>

      {/* 01 ABOUT / IDENTITY & CRAFT */}
      <section
        id="ch-01"
        className="dzx-section"
        data-cam="1"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '120px 8vw 80px 8vw',
        }}
      >
        <div className="dzx-chapter-content" data-ch="1" style={{ maxWidth: 960, willChange: 'transform, opacity' }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.22em',
              color: '#b4c8d8',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            CHAPTER 01 — IDENTITY & CRAFT
          </div>

          <h2
            style={{
              fontFamily: "'Onest', system-ui, sans-serif",
              fontSize: 'clamp(32px, 4.8vw, 56px)',
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#dfe7e0',
              margin: '0 0 44px 0',
              textTransform: 'uppercase',
            }}
          >
            ARCHITECTING SYSTEMS.
            <br />
            <span style={{ color: '#6e9eae' }}>CAPTURING TIME.</span>
          </h2>

          {/* 3 Discipline Pillar Cards (Visually aligned with 3 Core Modules) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 20,
            }}
          >
            {[
              {
                num: '01',
                title: 'SYNTHETIC COGNITION & AI',
                color: '#6e9eae',
                desc: 'Researching neural agent frameworks, personal memory graphs, contextual embeddings, and autonomous cognitive pipelines.',
              },
              {
                num: '02',
                title: 'HIGH-PERFORMANCE DEV',
                color: '#b4c8d8',
                desc: 'Crafting 60fps WebGL experiences, distributed software backends, and low-latency system architectures built for scale.',
              },
              {
                num: '03',
                title: 'AESTHETICS & PHYSICALITY',
                color: '#f2c8d0',
                desc: 'Visual photography across nocturnal landscapes, physical body discipline, and ambient audio soundscapes.',
              },
            ].map((card) => (
              <div
                key={card.num}
                style={{
                  background: 'rgba(5, 7, 10, 0.65)',
                  border: '1px solid rgba(223, 231, 224, 0.1)',
                  borderRadius: 12,
                  padding: '28px 24px',
                  backdropFilter: 'blur(16px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: card.color, letterSpacing: '0.15em' }}>
                  {card.num} / CORE
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#dfe7e0', letterSpacing: '0.02em' }}>
                  {card.title}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(223, 231, 224, 0.65)', fontWeight: 300 }}>
                  {card.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 02 PROJECTS (Featuring XiaoZhaiOS) */}
      <section
        id="ch-02"
        className="dzx-section"
        data-cam="2"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '120px 8vw 80px 8vw',
        }}
      >
        <div className="dzx-chapter-content" data-ch="2" style={{ maxWidth: 1040, willChange: 'transform, opacity' }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.22em',
              color: '#f2c8d0',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            CHAPTER 02 — INNOVATION LAB
          </div>

          <h2
            style={{
              fontFamily: "'Onest', system-ui, sans-serif",
              fontSize: 'clamp(32px, 4.8vw, 56px)',
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#dfe7e0',
              margin: '0 0 36px 0',
              textTransform: 'uppercase',
            }}
          >
            FLAGSHIP CREATIONS.
          </h2>

          {/* XiaoZhaiOS Hero Project Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(8, 14, 20, 0.85) 0%, rgba(5, 7, 10, 0.9) 100%)',
              border: '1px solid rgba(110, 158, 174, 0.35)',
              borderRadius: 16,
              padding: '36px 40px',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8), 0 0 32px rgba(110, 158, 174, 0.15)',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.2em',
                    color: '#6e9eae',
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}
                >
                  FLAGSHIP OPERATING SYSTEM · 01 / 03
                </span>
                <h3
                  style={{
                    fontSize: 'clamp(26px, 3.5vw, 40px)',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: '#dfe7e0',
                    margin: 0,
                  }}
                >
                  XiaoZhaiOS
                </h3>
              </div>

              {/* Fly-through Portal Action Button */}
              <button
                onClick={onExploreXiaoZhaiOS}
                type="button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 24px',
                  borderRadius: 999,
                  background: 'rgba(110, 158, 174, 0.18)',
                  border: '1px solid #6e9eae',
                  color: '#fff',
                  fontFamily: "'Onest', system-ui, sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(110, 158, 174, 0.35)',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(110, 158, 174, 0.35)';
                  e.currentTarget.style.transform = 'scale(1.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(110, 158, 174, 0.18)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <span>✦ EXPLORE DATA MATRIX</span>
                <span style={{ fontSize: 14 }}>↗</span>
              </button>
            </div>

            <p
              style={{
                maxWidth: 620,
                fontSize: 15,
                lineHeight: 1.7,
                color: 'rgba(223, 231, 224, 0.75)',
                fontWeight: 300,
                marginBottom: 24,
              }}
            >
              Next-generation spatial intelligence operating system. Unifying contextual memory graphs,
              autonomous local agents, and fluid data spaces into a frictionless cognitive environment.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['MEMORY MATRIX', 'NEURAL AGENTS', 'LOCAL VECTOR STORE', 'SPATIAL 3D CANVAS'].map((t) => (
                <span
                  key={t}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.05)',
                    fontSize: 9,
                    letterSpacing: '0.12em',
                    color: '#b4c8d8',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 03 INTERESTS / CREATIVE ARCHIVE */}
      <section
        id="ch-03"
        className="dzx-section"
        data-cam="3"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '120px 8vw 80px 8vw',
        }}
      >
        <div className="dzx-chapter-content" data-ch="3" style={{ maxWidth: 960, willChange: 'transform, opacity' }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.22em',
              color: '#6e9eae',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            CHAPTER 03 — CREATIVE ARCHIVE
          </div>

          <h2
            style={{
              fontFamily: "'Onest', system-ui, sans-serif",
              fontSize: 'clamp(32px, 4.8vw, 56px)',
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#dfe7e0',
              margin: '0 0 36px 0',
              textTransform: 'uppercase',
            }}
          >
            SENSORY & PHYSICAL DISCIPLINE.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            {[
              {
                title: 'CINEMATIC PHOTOGRAPHY',
                tag: 'VISUAL',
                desc: 'Capturing transient light across architecture, night cities, and mountain ridges with medium-format optics.',
              },
              {
                title: 'PHYSICAL RESILIENCE',
                tag: 'BODY',
                desc: 'Calisthenics, progressive overload, and endurance conditioning as anchors of mental clarity and cognitive stamina.',
              },
              {
                title: 'AMBIENT SOUNDSCAPES',
                tag: 'AUDIO',
                desc: 'Modular synthesis, low-frequency atmospheric pads, and rhythmic textures designed for deep focus states.',
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: 'rgba(5, 7, 10, 0.65)',
                  border: '1px solid rgba(223, 231, 224, 0.1)',
                  borderRadius: 12,
                  padding: '24px',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', color: '#b4c8d8', marginBottom: 8 }}>
                  {item.tag}
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#dfe7e0', marginBottom: 8 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(223, 231, 224, 0.65)', fontWeight: 300 }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 04 PHILOSOPHY */}
      <section
        id="ch-04"
        className="dzx-section"
        data-cam="4"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '120px 8vw 80px 8vw',
        }}
      >
        <div className="dzx-chapter-content" data-ch="4" style={{ maxWidth: 860, willChange: 'transform, opacity' }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.22em',
              color: '#f2c8d0',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            CHAPTER 04 — PHILOSOPHY & EVOLUTION
          </div>

          <h2
            style={{
              fontFamily: "'Onest', system-ui, sans-serif",
              fontSize: 'clamp(32px, 4.8vw, 56px)',
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              color: '#dfe7e0',
              margin: '0 0 28px 0',
              textTransform: 'uppercase',
            }}
          >
            CONTINUOUS REFACTORING.
            <br />
            <span style={{ color: '#b4c8d8' }}>UNCOMPROMISING PRECISION.</span>
          </h2>

          <p
            style={{
              fontSize: 16,
              lineHeight: 1.8,
              color: 'rgba(223, 231, 224, 0.72)',
              fontWeight: 300,
              marginBottom: 24,
            }}
          >
            We live at the convergence of artificial intelligence and physical existence.
            True craftsmanship lies not in accumulating tools, but in distilling principles:
            clarity of thought, structural durability, and the courage to build frontiers from scratch.
          </p>
        </div>
      </section>

      {/* 05 CONTACT / TERMINAL */}
      <section
        id="ch-05"
        className="dzx-section"
        data-cam="5"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '120px 8vw 80px 8vw',
        }}
      >
        <div className="dzx-chapter-content" data-ch="5" style={{ maxWidth: 840, willChange: 'transform, opacity' }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.22em',
              color: '#6e9eae',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            CHAPTER 05 — TERMINAL HORIZON
          </div>

          <h2
            style={{
              fontFamily: "'Onest', system-ui, sans-serif",
              fontSize: 'clamp(36px, 5.5vw, 68px)',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: '#dfe7e0',
              margin: '0 0 24px 0',
              textTransform: 'uppercase',
            }}
          >
            CONNECT &<br />
            <span style={{ color: '#f2c8d0' }}>TRANSCEND.</span>
          </h2>

          <p
            style={{
              fontSize: 15,
              lineHeight: 1.7,
              color: 'rgba(223, 231, 224, 0.7)',
              fontWeight: 300,
              marginBottom: 36,
            }}
          >
            Available for architectural consulting, AI agent systems research, and high-impact digital engineering.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {[
              { label: 'GITHUB', link: 'https://github.com' },
              { label: 'X / TWITTER', link: 'https://x.com' },
              { label: 'EMAIL', link: 'mailto:contact@dzx.dev' },
            ].map((btn) => (
              <a
                key={btn.label}
                href={btn.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '12px 28px',
                  borderRadius: 999,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(223, 231, 224, 0.2)',
                  fontSize: 11,
                  letterSpacing: '0.16em',
                  color: '#dfe7e0',
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'all 0.25s ease',
                }}
              >
                {btn.label} ↗
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

