import React from 'react';
import { PresenceNodeInfo } from '../experience/ScenePortal';

interface NodeDescriptorProps {
  hoveredNode: PresenceNodeInfo | null;
  selectedNode: PresenceNodeInfo | null;
}

export const NodeDescriptor: React.FC<NodeDescriptorProps> = ({
  hoveredNode,
  selectedNode,
}) => {
  // Active target is either the selected node, or the currently hovered node
  const activeNode = selectedNode || hoveredNode;
  if (!activeNode) return null;

  // Derive node display index
  const indexMap: Record<string, string> = {
    RAW: '01',
    CONTEXT: '02',
    SELF: '03',
    LONG_TERM: '04',
  };
  const nodeIndex = indexMap[activeNode.id] || '01';

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: activeNode.screenX,
        top: activeNode.screenY,
        zIndex: 99980,
        pointerEvents: 'none',
        transform: 'translate3d(14px, -36px, 0)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        fontFamily: "'Onest', monospace, sans-serif",
        transition: 'opacity 0.22s ease',
      }}
    >
      {/* Precision Anchor Lead Line */}
      <div
        style={{
          position: 'absolute',
          left: -14,
          bottom: -6,
          width: 14,
          height: 1,
          background: activeNode.isSelected ? 'rgba(242, 200, 208, 0.7)' : 'rgba(110, 158, 174, 0.55)',
          transformOrigin: 'bottom left',
          transform: 'rotate(-45deg)',
        }}
      />

      {/* Micro Header: Index & Memory Domain */}
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.22em',
          color: activeNode.isSelected ? '#f2c8d0' : '#6e9eae',
          textTransform: 'uppercase',
          marginBottom: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span>MEMORY / {nodeIndex}</span>
        {activeNode.isSelected && (
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: '#f2c8d0',
              boxShadow: '0 0 6px #f2c8d0',
            }}
          />
        )}
      </div>

      {/* Node Functional Cluster Label */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.12em',
          color: '#dfe7e0',
          textTransform: 'uppercase',
          marginBottom: 3,
        }}
      >
        {activeNode.label}
      </div>

      {/* Cognitive Sublabel */}
      <div
        style={{
          fontSize: 10,
          fontWeight: 300,
          letterSpacing: '0.04em',
          color: 'rgba(223, 231, 224, 0.65)',
          maxWidth: 220,
          lineHeight: 1.35,
        }}
      >
        {activeNode.sublabel}
      </div>

      {/* Selected State Micro-indicator */}
      {activeNode.isSelected && (
        <div
          style={{
            marginTop: 6,
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: '#f2c8d0',
            borderTop: '1px solid rgba(242, 200, 208, 0.3)',
            paddingTop: 4,
          }}
        >
          SYNCHRONIZED
        </div>
      )}
    </div>
  );
};
