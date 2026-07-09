import React from 'react';
import { Incident } from '../data/arenaData';

interface IncidentItemProps {
  inc: Incident;
  selectedIncidentId: string | null;
  setSelectedIncidentId: (id: string | null) => void;
}

export const IncidentItem: React.FC<IncidentItemProps> = ({
  inc,
  selectedIncidentId,
  setSelectedIncidentId,
}) => {
  return (
    <div
      onClick={() => setSelectedIncidentId(inc.id)}
      className={`incident-item ${selectedIncidentId === inc.id ? 'selected' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`Select incident ${inc.type} at ${inc.loc.replace('_', ' ')}. Status: ${inc.status}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setSelectedIncidentId(inc.id);
        }
      }}
    >
      <div className="incident-meta">
        <span className="inc-type">
          {inc.type === 'Medical' ? '🩺' : inc.type === 'Security' ? '🛡' : '⚠️'} {inc.type} Report
        </span>
        <span className="inc-time">{inc.time}</span>
      </div>
      <div className="inc-desc">{inc.desc}</div>
      <div className="inc-status-row">
        <span className="inc-loc">📍 Location: {inc.loc.replace('_', ' ')}</span>
        <span className={`inc-status-lbl ${inc.status}`}>{inc.status}</span>
      </div>
    </div>
  );
};
