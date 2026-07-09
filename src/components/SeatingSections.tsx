import React from 'react';
import { MAP_NODES } from '../services/mapService';

interface SeatingSectionsProps {
  handleMapNodeClick: (nodeId: string) => void;
}

export const SeatingSections: React.FC<SeatingSectionsProps> = ({ handleMapNodeClick }) => {
  return (
    <>
      {Object.keys(MAP_NODES).map(key => {
        const node = MAP_NODES[key];
        if (node.type !== 'seating') return null;
        const colorClass = node.accessible ? "seating-sec accessibility-sec" : "seating-sec";
        return (
          <g 
            key={key} 
            style={{ cursor: 'pointer', outline: 'none' }} 
            onClick={() => handleMapNodeClick(key)}
            role="button"
            tabIndex={0}
            aria-label={`Select Seating Section ${key.split('_')[1]}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleMapNodeClick(key);
              }
            }}
          >
            <circle cx={node.x} cy={node.y} r={14} className={colorClass} />
            <text x={node.x} y={node.y + 3} textAnchor="middle" className="map-node-label" style={{ fontSize: '7px', fill: 'white' }}>
              {key.split('_')[1]}
            </text>
          </g>
        );
      })}
    </>
  );
};
