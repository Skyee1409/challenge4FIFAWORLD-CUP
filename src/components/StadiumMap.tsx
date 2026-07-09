import React from 'react';
import { MAP_NODES, MAP_EDGES, STAFF_RESOURCES } from '../services/mapService';
import { Incident } from '../data/arenaData';

interface StadiumMapProps {
  isStaff: boolean;
  startNode?: string;
  endNode?: string;
  accessibleOnly?: boolean;
  navigationRouteStr: string;
  showSecurity?: boolean;
  showMedical?: boolean;
  showVolunteers?: boolean;
  showAlerts?: boolean;
  incidents: Incident[];
  setSelectedIncidentId?: (id: string | null) => void;
  handleMapNodeClick: (nodeId: string) => void;
}

export const StadiumMap: React.FC<StadiumMapProps> = React.memo(({
  isStaff,
  accessibleOnly = false,
  navigationRouteStr,
  showSecurity = true,
  showMedical = true,
  showVolunteers = true,
  showAlerts = true,
  incidents,
  setSelectedIncidentId,
  handleMapNodeClick,
}) => {
  return (
    <svg 
      viewBox="0 0 500 400" 
      width="100%" 
      height="100%" 
      style={{ background: '#050810', display: 'block' }}
      role="application"
      aria-label="Stadium interactive map showing seating layouts, gates, services, and route paths"
    >
      <defs>
        <pattern id="map-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
        </pattern>
        <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <rect width="100%" height="100%" fill="url(#map-grid)" />

      {/* Stadium Rings and Pitch */}
      <ellipse cx="250" cy="200" rx="220" ry="170" className="stadium-outline" />
      <ellipse cx="250" cy="200" rx="190" ry="140" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={2} />
      <ellipse cx="250" cy="200" rx="160" ry="110" fill="none" stroke="rgba(0,114,255,0.15)" strokeWidth={30} />

      <rect x="185" y="150" width="130" height="100" rx="4" className="pitch-green" />
      <rect x="190" y="155" width="120" height="90" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
      <line x1="250" y1="155" x2="250" y2="245" stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
      <circle cx="250" cy="200" r="20" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1} />

      {/* Edge Lines */}
      {MAP_EDGES.map((edge, idx) => {
        const fromNode = MAP_NODES[edge.from];
        const toNode = MAP_NODES[edge.to];
        if (!fromNode || !toNode) return null;
        const color = edge.accessible ? "rgba(0, 242, 254, 0.15)" : "rgba(255, 255, 255, 0.04)";
        const dash = edge.accessible ? "2 2" : undefined;
        return (
          <line
            key={idx}
            x1={fromNode.x}
            y1={fromNode.y}
            x2={toNode.x}
            y2={toNode.y}
            stroke={color}
            strokeWidth={2}
            strokeDasharray={dash}
          />
        );
      })}

      {/* Seating Sections */}
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

      {/* Gates */}
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

      {/* Service Concessions */}
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

      {/* Render Route Paths */}
      {navigationRouteStr && (
        <polyline
          points={navigationRouteStr}
          className={`wayfinding-path ${!isStaff && accessibleOnly ? 'accessible' : ''}`}
        />
      )}

      {/* Staff Overlay Pins */}
      {isStaff && (
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
          
          {/* Pulsing incident warning signs */}
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
      )}
    </svg>
  );
});
StadiumMap.displayName = 'StadiumMap';
