import React from 'react';
import { PresenceNodeInfo } from '../experience/ScenePortal';

interface NodeDescriptorProps {
  hoveredNode: PresenceNodeInfo | null;
  selectedNode: PresenceNodeInfo | null;
}

export const NodeDescriptor = React.forwardRef<HTMLDivElement, NodeDescriptorProps>(({
  hoveredNode,
  selectedNode,
}, ref) => {
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
      ref={ref}
      className="dzx-node-descriptor"
      aria-hidden="true"
      data-placement-x="right"
      data-placement-y="default"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 99980,
        pointerEvents: 'none',
        transform: `translate3d(${Math.round(activeNode.screenX + 20)}px, ${Math.round(activeNode.screenY - 36)}px, 0)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        fontFamily: "'Onest', monospace, sans-serif",
        transition: 'opacity 0.22s ease',
        willChange: 'transform',
      }}
    >
      <style>{`
        .dzx-node-descriptor[data-placement-x="left"] {
          align-items: flex-end;
          text-align: right;
        }
        .dzx-node-descriptor[data-placement-x="right"] {
          align-items: flex-start;
          text-align: left;
        }
        .dzx-node-descriptor[data-placement-x="left"] .dzx-descriptor-lead-line {
          right: -14px;
          bottom: -6px;
          transform-origin: bottom right;
          transform: rotate(45deg);
        }
        .dzx-node-descriptor[data-placement-x="right"] .dzx-descriptor-lead-line,
        .dzx-node-descriptor:not([data-placement-x]) .dzx-descriptor-lead-line {
          left: -14px;
          bottom: -6px;
          transform-origin: bottom left;
          transform: rotate(-45deg);
        }
        .dzx-node-descriptor[data-placement-y="bottom"] .dzx-descriptor-lead-line {
          top: -6px;
          bottom: auto;
          transform: rotate(45deg);
        }
      `}</style>

      {/* Precision Anchor Lead Line */}
      <div
        className="dzx-descriptor-lead-line"
        style={{
          position: 'absolute',
          width: 14,
          height: 1,
          background: activeNode.isSelected ? 'rgba(242, 200, 208, 0.7)' : 'rgba(110, 158, 174, 0.55)',
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
});

NodeDescriptor.displayName = 'NodeDescriptor';
