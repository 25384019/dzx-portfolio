import React, { useEffect, useRef, useState, useCallback } from 'react';
import { World } from './experience/World';
import { Navigation } from './components/Navigation';
import { ScrollRail } from './components/ScrollRail';
import { MediaCard } from './components/MediaCard';
import { PortalHUD } from './components/PortalHUD';
import { ChapterSection } from './components/ChapterSection';

export const DZXPortfolio: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<World | null>(null);

  const [activeChapter, setActiveChapter] = useState(0);
  const [isInPortal, setIsInPortal] = useState(false);

  // Initialize Three.js World
  useEffect(() => {
    if (!containerRef.current) return;

    const rootEl = containerRef.current;
    const world = new World(rootEl);
    worldRef.current = world;

    // Detect scroll container (either parent with overflow or window)
    const scroller = rootEl.parentElement?.scrollHeight && rootEl.parentElement.scrollHeight > window.innerHeight
      ? rootEl.parentElement
      : null;
    world.setScrollElement(scroller);

    // Track state transitions
    world.transitionManager.onEnterStart = () => setIsInPortal(true);
    world.transitionManager.onExitComplete = () => setIsInPortal(false);

    // Initial measurement
    const measureScroll = () => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>('.dzx-section'));
      const vh = scroller ? scroller.clientHeight : window.innerHeight;
      const sh = scroller ? scroller.scrollHeight : document.documentElement.scrollHeight;
      world.scrollController.measure(sections, vh, sh);
    };

    measureScroll();
    window.addEventListener('resize', measureScroll, { passive: true });

    // Chapter polling from smoothProgress
    const interval = setInterval(() => {
      if (worldRef.current) {
        setActiveChapter(worldRef.current.scrollController.activeChapter);
      }
    }, 80);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', measureScroll);
      world.dispose();
      worldRef.current = null;
    };
  }, []);

  const handleSelectChapter = useCallback((index: number) => {
    if (!worldRef.current) return;
    if (isInPortal) {
      worldRef.current.exitXiaoZhaiOS();
    }
    const targetScrollY = worldRef.current.scrollController.getAnchor(index);
    const scroller = worldRef.current.scrollElement;
    if (scroller) {
      scroller.scrollTo({
        top: targetScrollY,
        behavior: 'smooth',
      });
    } else {
      window.scrollTo({
        top: targetScrollY,
        behavior: 'smooth',
      });
    }
  }, [isInPortal]);

  const handleExploreXiaoZhaiOS = useCallback(() => {
    if (!worldRef.current) return;
    worldRef.current.enterXiaoZhaiOS();
    setIsInPortal(true);
  }, []);

  const handleExitPortal = useCallback(() => {
    if (!worldRef.current) return;
    worldRef.current.exitXiaoZhaiOS();
    setIsInPortal(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`dzx-portfolio-root ${isInPortal ? 'in-portal' : ''}`}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        background: '#05070a',
        color: '#dfe7e0',
        fontFamily: "'Onest', system-ui, sans-serif",
        overflowX: 'clip',
      }}
    >
      {/* Reduced Opacity Silk Grain Overlay (~0.035, 25-30% reduction from Kage) */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 4,
          pointerEvents: 'none',
          opacity: 0.035,
          backgroundImage: `radial-gradient(rgba(223, 231, 224, 0.4) 1px, transparent 1px)`,
          backgroundSize: '4px 4px',
        }}
      />

      {/* Cinematic Vignette */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 3,
          pointerEvents: 'none',
          background: 'radial-gradient(120% 90% at 50% 45%, transparent 45%, rgba(5, 7, 10, 0.65) 100%)',
        }}
      />

      {/* Top Navigation */}
      <Navigation
        activeChapter={activeChapter}
        onSelectChapter={handleSelectChapter}
        isInPortal={isInPortal}
      />

      {/* Right Scroll Progress Rail */}
      <ScrollRail
        activeChapter={activeChapter}
        onSelectChapter={handleSelectChapter}
        isInPortal={isInPortal}
      />

      {/* Side Media Card */}
      <MediaCard isInPortal={isInPortal} />

      {/* XiaoZhaiOS Portal HUD (Top Return & Bottom Hints) */}
      <PortalHUD
        isInPortal={isInPortal}
        portalTitle="XiaoZhaiOS · Neural Data World"
        onExit={handleExitPortal}
      />

      {/* DOM Chapter Overlay (Transitions smoothly out when entering portal) */}
      <div
        className="dzx-dom-overlay"
        style={{
          position: 'relative',
          zIndex: 10,
          transition: 'opacity 1.4s cubic-bezier(0.22, 0.61, 0.36, 1), transform 1.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
          opacity: isInPortal ? 0 : 1,
          transform: isInPortal ? 'translate3d(0, 36px, 0) scale(0.98)' : 'none',
          pointerEvents: isInPortal ? 'none' : 'auto',
        }}
      >
        <ChapterSection onExploreXiaoZhaiOS={handleExploreXiaoZhaiOS} />
      </div>
    </div>
  );
};
