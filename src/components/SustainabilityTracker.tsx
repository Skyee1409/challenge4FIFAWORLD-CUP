import React from 'react';
import { ARENA_DATA, EcoReward } from '../data/arenaData';

interface SustainabilityTrackerProps {
  eco: {
    points: number;
    checkedActions: Record<string, boolean>;
    getLevelLabel: () => string;
    toggleAction: (act: any) => void;
    claimReward: (reward: EcoReward) => boolean;
  };
  handleClaim: (reward: EcoReward) => void;
}

export const SustainabilityTracker: React.FC<SustainabilityTrackerProps> = ({ eco, handleClaim }) => {
  const { points, checkedActions, getLevelLabel, toggleAction } = eco;

  return (
    <div className="card glass-panel sustainability-card" aria-label="Sustainability Tracker">
      <div className="card-header">
        <div className="title-with-subtitle">
          <h2>Green Goals Tracker</h2>
          <p>Track your carbon footprint reductions</p>
        </div>
        <div className="points-badge">
          <span aria-label={`${points} sustainability points balance`}>{points}</span> <span className="lbl" aria-hidden="true">PTS</span>
        </div>
      </div>

      <div className="sustainability-body">
        <div className="eco-progress-bar">
          <div className="eco-progress-fill" style={{ width: `${Math.min(100, Math.floor((points / 500) * 100))}%` }}></div>
          <span className="progress-lbl">{getLevelLabel()}</span>
        </div>

        <ul className="eco-checklist">
          {ARENA_DATA.ecoActions.map(act => (
            <li key={act.id}>
              <label htmlFor={act.id} className="custom-checkbox">
                <input
                  id={act.id}
                  type="checkbox"
                  checked={!!checkedActions[act.id]}
                  disabled={act.id === 'chk-transit'} // Default transit disabled
                  onChange={() => toggleAction(act)}
                />
                <span className="checkmark"></span>
                <span className="checkbox-label">
                  {act.label} <span className="points-val">+{act.points} XP</span>
                </span>
              </label>
            </li>
          ))}
        </ul>

        <div className="rewards-section">
          <h4>Claim Rewards</h4>
          <div className="rewards-grid">
            {ARENA_DATA.ecoRewards.map(reward => (
              <button
                key={reward.id}
                onClick={() => handleClaim(reward)}
                disabled={points < reward.cost}
                className="btn-reward"
                aria-label={`Claim ${reward.name} for ${reward.cost} points`}
              >
                <span>{reward.name}</span>
                <span className="cost">{reward.cost} PTS</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
