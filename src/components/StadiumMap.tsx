import React from 'react';
import { MAP_NODES, MAP_EDGES } from '../services/mapService';
import { Incident } from '../data/arenaData';
import { SeatingSections } from './SeatingSections';
import { GateNodes } from './GateNodes';
import { ServiceConcessions } from './ServiceConcessions';
import { StaffResourceOverlay } from './StaffResourceOverlay';

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
      <SeatingSections handleMapNodeClick={handleMapNodeClick} />

      {/* Gates */}
      <GateNodes handleMapNodeClick={handleMapNodeClick} />

      {/* Service Concessions */}
      <ServiceConcessions handleMapNodeClick={handleMapNodeClick} />

      {/* Render Route Paths */}
      {navigationRouteStr && (
        <polyline
          points={navigationRouteStr}
          className={`wayfinding-path ${!isStaff && accessibleOnly ? 'accessible' : ''}`}
        />
      )}

      {/* Staff Overlay Pins */}
      <StaffResourceOverlay
        isStaff={isStaff}
        showSecurity={showSecurity}
        showMedical={showMedical}
        showVolunteers={showVolunteers}
        showAlerts={showAlerts}
        incidents={incidents}
        setSelectedIncidentId={setSelectedIncidentId}
      />
    </svg>
  );
});
StadiumMap.displayName = 'StadiumMap';
