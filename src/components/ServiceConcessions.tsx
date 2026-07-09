import React from 'react';
import { MAP_NODES } from '../services/mapService';

interface ServiceConcessionsProps {
  handleMapNodeClick: (nodeId: string) => void;
}

export const ServiceConcessions: React.FC<ServiceConcessionsProps> = ({ handleMapNodeClick }) => {
  return (
    <>
      {Object.keys(MAP_NODES).map(key => {
        const node = MAP_NODES[key];
        if (node.type !== 'service') return null;
        let symbol = "🔹";
        if (key === "FirstAid") symbol = "🩺";
        if (key === "Concession_1") symbol = "🍔";
        if (key === "Restroom_1") symbol = "🚾";
        return (
          <g 
            key={key} 
            style={{ cursor: 'pointer', outline: 'none' }} 
            onClick={() => handleMapNodeClick(key)}
            role="button"
            tabIndex={0}
            aria-label={`Select Service Location ${node.name}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleMapNodeClick(key);
              }
            }}
          >
            <circle cx={node.x} cy={node.y} r={12} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
            <text x={node.x} y={node.y + 4} textAnchor="middle" className="map-node-label" style={{ fontSize: '9px' }}>
              {symbol}
            </text>
          </g>
        );
      })}
    </>
  );
};
