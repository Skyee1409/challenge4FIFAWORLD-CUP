import { useState, useCallback, useMemo } from 'react';
import { EcoAction, EcoReward } from '../data/arenaData';

const safeGetLocalStorage = (key: string, fallback: any) => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const safeSetLocalStorage = (key: string, value: any) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
};

export const useEcoPoints = (initialPoints: number = 250, onVoucherClaimed?: (msg: string) => void) => {
  const [points, setPoints] = useState<number>(() => 
    safeGetLocalStorage('arenamind_eco_points', initialPoints)
  );
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>(() => 
    safeGetLocalStorage('arenamind_checked_actions', {
      'chk-transit': true // Completed transit check by default
    })
  );
  const [claimedVouchers, setClaimedVouchers] = useState<Array<{ id: string, name: string, code: string }>>(() =>
    safeGetLocalStorage('arenamind_claimed_vouchers', [])
  );

  // Calculate Champion Badge Level
  const getLevelLabel = useCallback(() => {
    if (points >= 400) return "Lv. 4 Elite Eco Champion";
    if (points >= 250) return "Lv. 3 Eco Ambassador";
    if (points >= 100) return "Lv. 2 Eco Advocate";
    return "Lv. 1 Eco Supporter";
  }, [points]);

  // Toggle checklist checkbox
  const toggleAction = useCallback((action: EcoAction) => {
    setCheckedActions(prev => {
      const isChecking = !prev[action.id];
      const nextChecked = { ...prev, [action.id]: isChecking };
      safeSetLocalStorage('arenamind_checked_actions', nextChecked);
      
      // Update points
      setPoints(current => {
        const diff = isChecking ? action.points : -action.points;
        const nextPoints = Math.max(0, current + diff);
        safeSetLocalStorage('arenamind_eco_points', nextPoints);
        return nextPoints;
      });

      return nextChecked;
    });
  }, []);

  // Purchase/Claim reward voucher
  const claimReward = useCallback((reward: EcoReward) => {
    if (points < reward.cost) return false;

    setPoints(current => {
      const nextPoints = current - reward.cost;
      safeSetLocalStorage('arenamind_eco_points', nextPoints);
      return nextPoints;
    });
    
    // Generate claim ticket
    const code = `WC2026-ECO-${Math.floor(1000 + Math.random() * 9000)}`;
    const voucherMessage = `🎉 **Reward Claimed!**\nYou unlocked **${reward.name}**.\nPresent code to the concession steward:\n` +
      `\`\`\`\nCode: ${code}\n\`\`\`\n` +
      `Thank you for keeping FIFA 2026 green! ♻️`;

    setClaimedVouchers(prev => {
      const nextVouchers = [...prev, { id: reward.id, name: reward.name, code }];
      safeSetLocalStorage('arenamind_claimed_vouchers', nextVouchers);
      return nextVouchers;
    });

    if (onVoucherClaimed) {
      onVoucherClaimed(voucherMessage);
    }
    
    return true;
  }, [points, onVoucherClaimed]);

  return useMemo(() => ({
    points,
    checkedActions,
    claimedVouchers,
    getLevelLabel,
    toggleAction,
    claimReward
  }), [
    points,
    checkedActions,
    claimedVouchers,
    getLevelLabel,
    toggleAction,
    claimReward
  ]);
};

