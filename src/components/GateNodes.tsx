import React from 'react';
import { MAP_NODES } from '../services/mapService';

interface GateNodesProps {
  handleMapNodeClick: (nodeId: string) => void;
}

export const GateNodes: React.FC<GateNodesProps> = ({ handleMapNodeClick }) => {
  return (
    <>
      {Object.keys(MAP_NODES).map(key => {
        const node = MAP_NODES[key];
        if (node.type !== 'gate') return null;
        return (
          <g 
            key={key} 
            style={{ cursor: 'pointer', outline: 'none' }} 
            onClick={() => handleMapNodeClick(key)}
            role="button"
            tabIndex={0}
            aria-label={`Select Gate ${key.charAt(5)}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleMapNodeClick(key);
              }
            }}
          >
            <rect x={node.x - 12} y={node.y - 12} width={24} height={24} rx={4} className="stadium-gate" />
            <text x={node.x} y={node.y + 4} textAnchor="middle" className="map-node-label" style={{ fontSize: '8px', fontWeight: 'bold', fill: 'var(--neon-cyan)' }}>
              {key.charAt(5)}
            </text>
          </g>
        );
      })}
    </>
  );
};
