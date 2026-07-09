import React, { useState } from 'react';
import { Incident } from '../data/arenaData';

interface IncidentFormProps {
  newIncType: 'Medical' | 'Crowd' | 'Maintenance' | 'Security' | 'Hardware';
  setNewIncType: (type: 'Medical' | 'Crowd' | 'Maintenance' | 'Security' | 'Hardware') => void;
  newIncLoc: string;
  setNewIncLoc: (loc: string) => void;
  logIncident: (type: Incident['type'], loc: string, desc: string) => { success: boolean; errors?: string[] };
}

export const IncidentForm: React.FC<IncidentFormProps> = ({
  newIncType,
  setNewIncType,
  newIncLoc,
  setNewIncLoc,
  logIncident,
}) => {
  const [newIncDesc, setNewIncDesc] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleIncidentSubmit = () => {
    setValidationErrors([]);
    const res = logIncident(newIncType, newIncLoc, newIncDesc);
    
    if (res.success) {
      setNewIncDesc('');
    } else if (res.errors) {
      setValidationErrors(res.errors);
    }
  };

  return (
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
  );
};
