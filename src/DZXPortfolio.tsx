import React, { useEffect, useRef, useState, useCallback } from 'react';
import { World } from './experience/World';
import { Navigation } from './components/Navigation';
import { ScrollRail } from './components/ScrollRail';
import { MediaCard } from './components/MediaCard';
import { PortalHUD } from './components/PortalHUD';
import { ChapterSection } from './components/ChapterSection';
import { PresenceCursor } from './components/PresenceCursor';
import { PresenceIntro } from './components/PresenceIntro';
import { NodeDescriptor } from './components/NodeDescriptor';
import { PresenceState } from './experience/ScenePortal';

export const DZXPortfolio: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<World | null>(null);
  const descriptorRef = useRef<HTMLDivElement>(null);

  const [activeChapter, setActiveChapter] = useState(0);
  const [isInPortal, setIsInPortal] = useState(false);
  const [isPortalLanded, setIsPortalLanded] = useState(false);
  const [isHUDVisible, setIsHUDVisible] = useState(false);
  const [presenceState, setPresenceState] = useState<PresenceState>({
    isFocused: false,
    isCoreHit: false,
    hoveredNode: null,
    selectedNode: null,
    dwellProgress: 0,
  });

  // Direct callback ref syncing DOM descriptor element to ScenePortal (Zero React re-render overhead)
  const descriptorCallbackRef = useCallback((el: HTMLDivElement | null) => {
    descriptorRef.current = el;
    if (worldRef.current) {
      worldRef.current.scenePortal.descriptorElement = el;
    }
  }, []);

  // Initialize Three.js World
  useEffect(() => {
    if (!containerRef.current) return;

    const rootEl = containerRef.current;
    const world = new World(rootEl);
    worldRef.current = world;
    if (descriptorRef.current) {
      world.scenePortal.descriptorElement = descriptorRef.current;
    }
    if ((import.meta as any).env?.DEV) {
      (window as any).__DZX_WORLD__ = world;
    }

    // Detect scroll container (either parent with overflow or window)
    const scroller = rootEl.parentElement?.scrollHeight && rootEl.parentElement.scrollHeight > window.innerHeight
      ? rootEl.parentElement
      : null;
    world.setScrollElement(scroller);

    // Track state transitions & camera landing
    world.transitionManager.onEnterStart = () => setIsInPortal(true);
    world.onPortalLanded = () => setIsPortalLanded(true);
    world.transitionManager.onExitStart = () => setIsPortalLanded(false);
    world.transitionManager.onExitComplete = () => {
      setIsInPortal(false);
      setIsPortalLanded(false);
    };

    // Track Presence Recognition state (discrete updates only)
    world.scenePortal.onPresenceChange = (state) => {
      setPresenceState(state);
    };

    // Initial measurement
    const measureScroll = () => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>('.dzx-section'));
      const vh = scroller ? scroller.clientHeight : window.innerHeight;
      const sh = scroller ? scroller.scrollHeight : document.documentElement.scrollHeight;
      world.scrollController.measure(sections, vh, sh);
    };

    measureScroll();
    window.addEventListener('resize', measureScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', measureScroll);
      world.dispose();
      worldRef.current = null;
    };
  }, []);

  // Sync scroll position from World controller
  useEffect(() => {
    if (!worldRef.current) return;
    const interval = setInterval(() => {
      if (worldRef.current && !isInPortal) {
        const rawP = worldRef.current.scrollController.smoothProgress;
        const currentCh = Math.min(Math.max(Math.round(rawP), 0), 5);
        setActiveChapter(currentCh);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isInPortal]);

  const handleSelectChapter = useCallback((index: number) => {
    if (isInPortal) return;

    const world = worldRef.current;
    if (!world) return;

    const targetY = world.scrollController.getAnchor(index);

    if (world.scrollElement) {
      world.scrollElement.scrollTo({
        top: targetY,
        behavior: 'smooth',
      });
    } else {
      window.scrollTo({
        top: targetY,
        behavior: 'smooth',
      });
    }
  }, [isInPortal]);

  /**
   * Refined Portal Entry Sequence:
   * 0-25%: Project UI rapid fade out (0.35s)
   * 20-65%: Camera flight through deep conduits (no portal HUD)
   * 60-80%: Memory Core & semantic network materializes
   * 75-100%: Portal HUD smoothly fades in
   */
  const handleExploreXiaoZhaiOS = useCallback(() => {
    if (!worldRef.current) return;
    setIsInPortal(true);
    setIsHUDVisible(false);
    worldRef.current.enterXiaoZhaiOS();

    // Fade in HUD only once camera has nearly arrived at Memory Core
    setTimeout(() => {
      setIsHUDVisible(true);
    }, 1350);
  }, []);

  const handleExitPortal = useCallback(() => {
    if (!worldRef.current) return;
    // Rapidly drop HUD and Presence indicators
    setIsHUDVisible(false);
    setIsPortalLanded(false);
    worldRef.current.exitXiaoZhaiOS();

    // Restore DOM overlay once camera approaches original projects track
    setTimeout(() => {
      setIsInPortal(false);
    }, 1200);
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

      {/* XiaoZhaiOS Presence Recognition Subsystem */}
      <PresenceCursor
        isVisible={isInPortal && isHUDVisible}
        isFocused={presenceState.isFocused}
      />

      <PresenceIntro isPortalLanded={isPortalLanded} />

      <NodeDescriptor
        ref={descriptorCallbackRef}
        hoveredNode={presenceState.hoveredNode}
        selectedNode={presenceState.selectedNode}
      />

      {/* XiaoZhaiOS Portal HUD (Top Return & Bottom Hints) */}
      <PortalHUD
        isInPortal={isInPortal}
        isVisible={isHUDVisible}
        portalTitle="XiaoZhaiOS · Memory System"
        onExit={handleExitPortal}
      />

      {/* DOM Chapter Overlay (Quick 0.35s exit when entering portal, smooth 0.6s return) */}
      <div
        className="dzx-dom-overlay"
        style={{
          position: 'relative',
          zIndex: 10,
          transition: isInPortal
            ? 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s ease-out'
            : 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
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
