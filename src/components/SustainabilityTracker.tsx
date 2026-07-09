import React from 'react';
import { ARENA_DATA, EcoReward } from '../data/arenaData';

interface SustainabilityTrackerProps {
  eco: {
    points: number;
    checkedActions: Record<string, boolean>;
    claimedVouchers: Array<{ id: string, name: string, code: string }>;
    getLevelLabel: () => string;
    toggleAction: (act: any) => void;
    claimReward: (reward: EcoReward) => boolean;
  };
  handleClaim: (reward: EcoReward) => void;
}

export const SustainabilityTracker: React.FC<SustainabilityTrackerProps> = ({ eco, handleClaim }) => {
  const { points, checkedActions, claimedVouchers, getLevelLabel, toggleAction } = eco;

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

        {claimedVouchers && claimedVouchers.length > 0 && (
          <div className="claimed-vouchers-section" style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
            <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600' }}>My Claimed Coupons</h4>
            <div className="vouchers-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {claimedVouchers.map((voucher, idx) => (
                <div key={idx} className="voucher-item" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{voucher.name}</div>
                    <code style={{ fontSize: '0.75rem', color: 'var(--neon-green)', fontFamily: 'Space Mono, monospace' }}>{voucher.code}</code>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Active</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
