import React from 'react';
import { Incident } from '../data/arenaData';

interface DispatchAdviceProps {
  selectedIncidentId: string | null;
  activeInc: Incident | null;
  formatMarkdown: (text: string) => { __html: string };
  dispatchIncident: (id: string) => void;
  resolveIncident: (id: string) => void;
}

export const DispatchAdvice: React.FC<DispatchAdviceProps> = ({
  selectedIncidentId,
  activeInc,
  formatMarkdown,
  dispatchIncident,
  resolveIncident,
}) => {
  return (
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
  );
};
