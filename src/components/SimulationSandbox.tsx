import React, { useState } from 'react';
import { SimulationService } from '../services/simulationService';
import DOMPurify from 'dompurify';

export const SimulationSandbox: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<string>('thunderstorm');
  const [simStatus, setSimStatus] = useState<string>('');
  const [simImpact, setSimImpact] = useState<string>('');
  const [simAgentLogs, setSimAgentLogs] = useState<{ agent: string; role: string; text: string }[]>([]);

  const runSimulation = () => {
    setSimStatus('loading');
    setSimImpact('');
    setSimAgentLogs([]);

    const scenario = SimulationService.getScenario(selectedScenario);
    if (!scenario) {
      setSimStatus('');
      return;
    }

    // Delay representing computing scenario analytics
    setTimeout(() => {
      setSimStatus('complete');
      setSimImpact(scenario.impact);

      // Sequentially load agent coordination outputs
      scenario.actions.forEach((act, idx) => {
        setTimeout(() => {
          setSimAgentLogs(prev => [...prev, act]);
        }, idx * 900);
      });
    }, 1500);
  };

  const sanitize = (dirty: string) => {
    return { __html: DOMPurify.sanitize(dirty) };
  };

  return (
    <section className="card glass-panel simulation-container" aria-label="Multi-Agent Simulation Sandbox">
      <div className="card-header">
        <div className="title-with-subtitle">
          <h2>Multi-Agent Simulation Sandbox</h2>
          <p>Predict response plans for operations scenarios</p>
        </div>
        <span className="badge badge-warning-glow">Sandbox</span>
      </div>

      <div className="simulation-selector">
        <label htmlFor="select-simulation-scenario">Choose Scenario</label>
        <div className="select-btn-row">
          <select 
            id="select-simulation-scenario" 
            value={selectedScenario} 
            onChange={(e) => setSelectedScenario(e.target.value)}
          >
            <option value="thunderstorm">⚠️ Severe Thunderstorm Warning</option>
            <option value="subway_delay">🚇 Metro Subway Power Failure</option>
            <option value="gate_card_reader">🎟️ Gate B Ticket Scanner Outage</option>
            <option value="crowd_rush">📣 Post-match Crowd Congestion</option>
          </select>
          <button onClick={runSimulation} className="btn-action-warning">Run GenAI Simulation</button>
        </div>
      </div>

      <div className="simulation-output-area" aria-live="polite">
        {simStatus === 'loading' && (
          <div className="sim-status-box">
            <div className="spinner animate-spin"></div>
            <div className="status-msg">GenAI agents evaluating scenario impacts...</div>
          </div>
        )}

        {simStatus === 'complete' && (
          <div className="sim-results">
            <div className="sim-summary">
              <h4>GenAI Risk Assessment</h4>
              <p dangerouslySetInnerHTML={sanitize(simImpact)} />
            </div>

            <div className="agent-responses-container" style={{ marginTop: '1rem' }}>
              <h4>Agent Coordination Logs</h4>
              <div className="agent-log-feed">
                {simAgentLogs.map((log, idx) => (
                  <div key={idx} className={`agent-log-item ${log.role}`}>
                    <div className={`agent-log-header ${log.role}`}>
                      <span className="agent-name">🤖 {log.agent}</span>
                      <span className="agent-time">Active</span>
                    </div>
                    <div className="agent-action-taken">{log.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
