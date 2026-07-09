import React from 'react';
import { Incident } from '../data/arenaData';
import { IncidentForm } from './IncidentForm';
import { IncidentItem } from './IncidentItem';
import { DispatchAdvice } from './DispatchAdvice';

interface IncidentFeedProps {
  incidents: {
    incidents: Incident[];
    selectedIncidentId: string | null;
    setSelectedIncidentId: (id: string | null) => void;
    getSelectedIncident: () => Incident | null;
    logIncident: (type: Incident['type'], loc: string, desc: string) => { success: boolean; errors?: string[] };
    dispatchIncident: (id: string) => void;
    resolveIncident: (id: string) => void;
  };
  newIncType: 'Medical' | 'Crowd' | 'Maintenance' | 'Security' | 'Hardware';
  setNewIncType: (type: 'Medical' | 'Crowd' | 'Maintenance' | 'Security' | 'Hardware') => void;
  newIncLoc: string;
  setNewIncLoc: (loc: string) => void;
  formatMarkdown: (text: string) => { __html: string };
}

export const IncidentFeed: React.FC<IncidentFeedProps> = ({
  incidents,
  newIncType,
  setNewIncType,
  newIncLoc,
  setNewIncLoc,
  formatMarkdown,
}) => {
  const { incidents: incidentsList, selectedIncidentId, setSelectedIncidentId, getSelectedIncident, logIncident, dispatchIncident, resolveIncident } = incidents;
  const activeInc = getSelectedIncident();

  return (
    <section className="card glass-panel incidents-container" aria-label="Incident Management Center">
      <div className="card-header">
        <div className="title-with-subtitle">
          <h2>Operations Incident Feed</h2>
          <p>Real-time volunteer and staff alerts</p>
        </div>
        <span className="counter-badge" aria-label={`${incidentsList.filter(i => i.status !== 'resolved').length} active incidents`}>
          {incidentsList.filter(i => i.status !== 'resolved').length}
        </span>
      </div>

      {/* Log incident form subcomponent */}
      <IncidentForm
        newIncType={newIncType}
        setNewIncType={setNewIncType}
        newIncLoc={newIncLoc}
        setNewIncLoc={setNewIncLoc}
        logIncident={logIncident}
      />

      {/* Feed items list */}
      <div className="incident-list" aria-live="polite">
        {incidentsList.filter(inc => inc.status !== 'resolved').map(inc => (
          <IncidentItem
            key={inc.id}
            inc={inc}
            selectedIncidentId={selectedIncidentId}
            setSelectedIncidentId={setSelectedIncidentId}
          />
        ))}
      </div>

      {/* Dispatch Advice Card subcomponent */}
      <DispatchAdvice
        selectedIncidentId={selectedIncidentId}
        activeInc={activeInc}
        formatMarkdown={formatMarkdown}
        dispatchIncident={dispatchIncident}
        resolveIncident={resolveIncident}
      />
    </section>
  );
};/section>
  );
};
