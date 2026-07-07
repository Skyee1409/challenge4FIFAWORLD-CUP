import { useState, useCallback } from 'react';
import { ARENA_DATA, Incident } from '../data/arenaData';
import { AIService } from '../services/aiService';
import { validateIncidentInput } from '../validators/incidentValidator';

export const useIncidents = (initialIncidents: Incident[] = ARENA_DATA.incidents) => {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  // Selector details
  const getSelectedIncident = useCallback(() => {
    return incidents.find(inc => inc.id === selectedIncidentId) || null;
  }, [incidents, selectedIncidentId]);

  // Log new incident field report
  const logIncident = useCallback((type: Incident['type'], loc: string, desc: string) => {
    // 1. Zod input validations
    const validation = validateIncidentInput({ type, loc, desc });
    
    if (!validation.success) {
      const errorMsgs = validation.error.errors.map(err => err.message);
      return { success: false, errors: errorMsgs };
    }

    const id = `inc-${Date.now().toString().slice(-4)}`;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const aiRec = AIService.generateDispatchRecommendation(type, loc);

    const newInc: Incident = {
      id,
      type,
      desc,
      loc,
      time,
      status: 'pending',
      recommendation: aiRec
    };

    setIncidents(prev => [newInc, ...prev]);
    setSelectedIncidentId(id);

    return { success: true };
  }, []);

  // Deploy resources dispatcher
  const dispatchIncident = useCallback((id: string) => {
    setIncidents(prev => {
      return prev.map(inc => {
        if (inc.id === id) {
          const dispatchedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            ...inc,
            status: 'dispatched',
            recommendation: `🚀 **Resources Dispatched**\nField team is en-route to **${inc.loc.replace('_', ' ')}**.\n\n*Deployment log: Responder unit dispatched at ${dispatchedTime}.*`
          };
        }
        return inc;
      });
    });
  }, []);

  // Resolve active alert
  const resolveIncident = useCallback((id: string) => {
    setIncidents(prev => {
      return prev.map(inc => {
        if (inc.id === id) {
          return { ...inc, status: 'resolved' };
        }
        return inc;
      });
    });
    setSelectedIncidentId(null);
  }, []);

  return {
    incidents,
    selectedIncidentId,
    setSelectedIncidentId,
    getSelectedIncident,
    logIncident,
    dispatchIncident,
    resolveIncident
  };
};
