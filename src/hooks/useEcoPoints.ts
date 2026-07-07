import { useState, useCallback } from 'react';
import { EcoAction, EcoReward } from '../data/arenaData';

export const useEcoPoints = (initialPoints: number = 250, onVoucherClaimed?: (msg: string) => void) => {
  const [points, setPoints] = useState(initialPoints);
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({
    'chk-transit': true // Completed transit check by default
  });

  // Calculate Champion Badge Level
  const getLevelLabel = useCallback(() => {
    if (points >= 400) return "Lv. 4 Elite Eco Champion";
    if (points >= 200) return "Lv. 3 Eco Ambassador";
    return "Lv. 1 Eco Supporter";
  }, [points]);

  // Toggle checklist checkbox
  const toggleAction = useCallback((action: EcoAction) => {
    setCheckedActions(prev => {
      const isChecking = !prev[action.id];
      const nextChecked = { ...prev, [action.id]: isChecking };
      
      // Update points
      setPoints(current => {
        const diff = isChecking ? action.points : -action.points;
        return Math.max(0, current + diff);
      });

      return nextChecked;
    });
  }, []);

  // Purchase/Claim reward voucher
  const claimReward = useCallback((reward: EcoReward) => {
    if (points < reward.cost) return false;

    setPoints(current => current - reward.cost);
    
    // Generate claim ticket
    const code = `WC2026-ECO-${Math.floor(1000 + Math.random() * 9000)}`;
    const voucherMessage = `🎉 **Reward Claimed!**\nYou unlocked **${reward.name}**.\nPresent code to the concession steward:\n` +
      `\`\`\`\nCode: ${code}\n\`\`\`\n` +
      `Thank you for keeping FIFA 2026 green! ♻️`;

    if (onVoucherClaimed) {
      onVoucherClaimed(voucherMessage);
    }
    
    return true;
  }, [points, onVoucherClaimed]);

  return {
    points,
    checkedActions,
    getLevelLabel,
    toggleAction,
    claimReward
  };
};
