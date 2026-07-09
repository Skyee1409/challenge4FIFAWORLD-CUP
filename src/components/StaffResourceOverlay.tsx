import React from 'react';
import { STAFF_RESOURCES, MAP_NODES } from '../services/mapService';
import { Incident } from '../data/arenaData';

interface StaffResourceOverlayProps {
  isStaff: boolean;
  showSecurity: boolean;
  showMedical: boolean;
  showVolunteers: boolean;
  showAlerts: boolean;
  incidents: Incident[];
  setSelectedIncidentId?: (id: string | null) => void;
}

export const StaffResourceOverlay: React.FC<StaffResourceOverlayProps> = ({
  isStaff,
  showSecurity,
  showMedical,
  showVolunteers,
  showAlerts,
  incidents,
  setSelectedIncidentId,
}) => {
  if (!isStaff) return null;

  return (
    <>
      {showSecurity && STAFF_RESOURCES.filter(r => r.type === 'security').map(res => (
        <g key={res.id} className="resource-pin" transform={`translate(${res.x}, ${res.y})`}>
          <circle cx={0} cy={0} r={7} fill="var(--neon-magenta)" stroke="#050810" strokeWidth={1.5} />
          <title>{res.label}</title>
        </g>
      ))}
      {showMedical && STAFF_RESOURCES.filter(r => r.type === 'medical').map(res => (
        <g key={res.id} className="resource-pin" transform={`translate(${res.x}, ${res.y})`}>
          <circle cx={0} cy={0} r={7} fill="var(--neon-yellow)" stroke="#050810" strokeWidth={1.5} />
          <title>{res.label}</title>
        </g>
      ))}
      {showVolunteers && STAFF_RESOURCES.filter(r => r.type === 'volunteer').map(res => (
        <g key={res.id} className="resource-pin" transform={`translate(${res.x}, ${res.y})`}>
          <circle cx={0} cy={0} r={7} fill="var(--neon-green)" stroke="#050810" strokeWidth={1.5} />
          <title>{res.label}</title>
        </g>
      ))}
      
      {showAlerts && incidents.filter(inc => inc.status !== 'resolved').map(inc => {
        const node = MAP_NODES[inc.loc];
        if (!node) return null;
        const markerColor = inc.status === 'pending' ? 'var(--neon-magenta)' : 'var(--neon-orange)';
        return (
          <g 
            key={inc.id} 
            style={{ cursor: 'pointer', outline: 'none' }} 
            onClick={() => setSelectedIncidentId && setSelectedIncidentId(inc.id)}
            role="button"
            tabIndex={0}
            aria-label={`Incident alert type ${inc.type} at ${inc.loc.replace('_', ' ')}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedIncidentId && setSelectedIncidentId(inc.id);
              }
            }}
          >
            <polygon
              points={`${node.x},${node.y - 12} ${node.x - 10},${node.y + 6} ${node.x + 10},${node.y + 6}`}
              fill={markerColor}
              stroke="#050810"
              strokeWidth={1.5}
              filter="url(#glow-red)"
            />
            <text x={node.x} y={node.y + 3} textAnchor="middle" fontFamily="Outfit" fontSize="9px" fontWeight="900" fill="white">!</text>
            <circle cx={node.x} cy={node.y + 2} r={15} fill="none" stroke={markerColor} strokeWidth={1.5} style={{ animation: 'pulse 1.8s infinite' }} />
          </g>
        );
      })}
    </>
  );
};
