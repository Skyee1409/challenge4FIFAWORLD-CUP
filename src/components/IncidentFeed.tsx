import React, { useState } from 'react';
import { Incident } from '../data/arenaData';

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
  const [newIncDesc, setNewIncDesc] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { incidents: incidentsList, selectedIncidentId, setSelectedIncidentId, getSelectedIncident, logIncident, dispatchIncident, resolveIncident } = incidents;

  const handleIncidentSubmit = () => {
    setValidationErrors([]);
    const res = logIncident(newIncType, newIncLoc, newIncDesc);
    
    if (res.success) {
      setNewIncDesc('');
    } else if (res.errors) {
      setValidationErrors(res.errors);
    }
  };

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

      {/* Log incident form */}
      <div className="new-incident-form">
        <h3>Log Field Report</h3>
        
        {validationErrors.length > 0 && (
          <div 
            style={{ background: 'rgba(255, 42, 95, 0.15)', border: '1px solid var(--neon-magenta)', padding: '8px', borderRadius: '4px', marginBottom: '8px' }}
            role="alert"
          >
            {validationErrors.map((err, idx) => (
              <div key={idx} style={{ fontSize: '0.75rem', color: 'var(--neon-magenta)', fontWeight: '600' }}>⚠️ {err}</div>
            ))}
          </div>
        )}

        <div className="form-row">
          <div className="select-wrapper-form" style={{ flex: 1, marginRight: '8px' }}>
            <label htmlFor="inc-type-select" className="sr-only" style={{ display: 'none' }}>Incident Type</label>
            <select
              id="inc-type-select"
              value={newIncType}
              onChange={(e) => setNewIncType(e.target.value as any)}
              aria-label="Select Incident Type"
            >
              <option value="Medical">Medical Assistance</option>
              <option value="Crowd">Crowd Congestion</option>
              <option value="Maintenance">Maintenance / Spill</option>
              <option value="Security">Security Issue</option>
              <option value="Hardware">Hardware / Card Reader</option>
            </select>
          </div>
          
          <div className="select-wrapper-form" style={{ flex: 1 }}>
            <label htmlFor="inc-loc-select" className="sr-only" style={{ display: 'none' }}>Incident Location</label>
            <select
              id="inc-loc-select"
              value={newIncLoc}
              onChange={(e) => setNewIncLoc(e.target.value)}
              aria-label="Select Incident Location"
            >
              <option value="Gate_A">Gate A Corridor</option>
              <option value="Gate_B">Gate B Corridor</option>
              <option value="Gate_C">Gate C Corridor</option>
              <option value="Gate_D">Gate D Corridor</option>
              <option value="Sec_103">Section 103</option>
              <option value="Sec_105">Section 105</option>
              <option value="Restroom_1">Restrooms A</option>
              <option value="FirstAid">First Aid Center</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <input
            type="text"
            placeholder="Details (e.g. Spill block near food court)..."
            value={newIncDesc}
            onChange={(e) => setNewIncDesc(e.target.value)}
            aria-label="Incident details description"
          />
          <button onClick={handleIncidentSubmit} className="btn-action-primary">Report</button>
        </div>
      </div>

      {/* Feed items list */}
      <div className="incident-list" aria-live="polite">
        {incidentsList.filter(inc => inc.status !== 'resolved').map(inc => (
          <div
            key={inc.id}
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
        ))}
      </div>

      {/* Dispatch Advice Card */}
      <div className="ai-dispatch-box" aria-live="assertive">
        <div className="dispatch-header">
          <span className="ai-badge">GenAI Copilot</span>
          <h4>Smart Dispatch Recommendation</h4>
        </div>
        <div className="dispatch-body">
          {selectedIncidentId ? (
            activeInc ? (
              <>
                <div dangerouslySetInnerHTML={formatMarkdown(activeInc.recommendation)} />
                
                <div className="dispatch-actions">
                  {activeInc.status === 'pending' && (
                    <button
                      onClick={() => dispatchIncident(activeInc.id)}
                      className="btn-action-primary"
                    >
                      Approve & Dispatch Personnel
                    </button>
                  )}
                  <button
                    onClick={() => resolveIncident(activeInc.id)}
                    className="btn-action"
                    style={{ background: 'rgba(255, 42, 95, 0.05)', border: '1px solid var(--neon-magenta)', color: 'var(--neon-magenta)' }}
                  >
                    Resolve Alert
                  </button>
                </div>
              </>
            ) : null
          ) : (
            <p className="placeholder-text">Select an active incident from the feed above to generate GenAI dispatch recommendations.</p>
          )}
        </div>
      </div>
    </section>
  );
};
