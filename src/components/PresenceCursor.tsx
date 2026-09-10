import React, { useEffect, useRef } from 'react';

interface PresenceCursorProps {
  isVisible: boolean;
  isFocused: boolean;
}

export const PresenceCursor: React.FC<PresenceCursorProps> = ({
  isVisible,
  isFocused,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMove, { passive: true });

    let currentX = -100;
    let currentY = -100;

    const loop = () => {
      if (mouseRef.current.x > 0 && containerRef.current) {
        // Subtle organic damping without React state overhead
        currentX += (mouseRef.current.x - currentX) * 0.35;
        currentY += (mouseRef.current.y - currentY) * 0.35;
        containerRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 99999,
        transform: 'translate3d(-100px, -100px, 0)',
        willChange: 'transform',
        display: isVisible ? 'block' : 'none',
      }}
    >
      {/* Outer Focusing Ring (tightens from scale 1.0 -> 0.72 when focused) */}
      <div
        style={{
          position: 'absolute',
          top: -11,
          left: -11,
          width: 22,
          height: 22,
          borderRadius: '50%',
          border: isFocused ? '1px solid rgba(242, 200, 208, 0.75)' : '1px solid rgba(110, 158, 174, 0.45)',
          boxShadow: isFocused ? '0 0 8px rgba(242, 200, 208, 0.3)' : 'none',
          transform: isFocused ? 'scale(0.72)' : 'scale(1.0)',
          opacity: isFocused ? 0.85 : 0.35,
          transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease, border-color 0.22s ease',
        }}
      />

      {/* Central Presence Luminous Dot */}
      <div
        style={{
          position: 'absolute',
          top: -1.5,
          left: -1.5,
          width: 3,
          height: 3,
          borderRadius: '50%',
          background: isFocused ? '#f2c8d0' : '#6e9eae',
          boxShadow: isFocused ? '0 0 6px #f2c8d0' : '0 0 4px #6e9eae',
          opacity: isFocused ? 0.95 : 0.65,
          transition: 'background 0.2s ease, opacity 0.2s ease',
        }}
      />
    </div>
  );
};
