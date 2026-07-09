import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as React from 'react';
import { useEcoPoints } from './useEcoPoints';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    clear: () => { store = {}; }
  };
})();

global.window = {
  localStorage: localStorageMock
} as any;

// Helper to run react hooks in standard JS env
function runHook<T>(hookFn: () => T) {
  const states: any[] = [];
  let stateIndex = 0;
  
  const mockUseState = (initial: any) => {
    const idx = stateIndex++;
    if (states[idx] === undefined) {
      states[idx] = typeof initial === 'function' ? initial() : initial;
    }
    const setter = (update: any) => {
      states[idx] = typeof update === 'function' ? update(states[idx]) : update;
      triggerReRun();
    };
    return [states[idx], setter];
  };

  let result: T;
  const triggerReRun = () => {
    stateIndex = 0;
    const origUseState = React.useState;
    React.useState = mockUseState as any;
    result = hookFn();
    React.useState = origUseState;
  };

  triggerReRun();
  return {
    get result() { return result; },
    triggerReRun
  };
}

describe('useEcoPoints Hook Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should initialize with default values if localstorage is empty', () => {
    const { result } = runHook(() => useEcoPoints(250));
    expect(result.points).toBe(250);
    expect(result.checkedActions['chk-transit']).toBe(true);
    expect(result.getLevelLabel()).toBe('Lv. 3 Eco Ambassador');
  });

  it('should restore state from localStorage if available', () => {
    localStorageMock.setItem('arenamind_eco_points', '450');
    localStorageMock.setItem('arenamind_checked_actions', JSON.stringify({ 'chk-transit': true, 'chk-bottle': true }));

    const { result } = runHook(() => useEcoPoints(250));
    expect(result.points).toBe(450);
    expect(result.checkedActions['chk-bottle']).toBe(true);
    expect(result.getLevelLabel()).toBe('Lv. 4 Elite Eco Champion');
  });

  it('should toggle actions and update points', () => {
    const { result } = runHook(() => useEcoPoints(250));
    
    // Toggle bottle recycling (+50 points)
    result.toggleAction({ id: 'chk-bottle', label: 'Recycle bottle', points: 50 });
    
    expect(result.points).toBe(300);
    expect(result.checkedActions['chk-bottle']).toBe(true);
    expect(localStorageMock.getItem('arenamind_eco_points')).toBe('300');
  });

  it('should deduct points when claiming rewards', () => {
    const onClaim = vi.fn();
    const { result } = runHook(() => useEcoPoints(300, onClaim));
    
    const success = result.claimReward({ id: 'claim-cup', name: 'Eco Cup', cost: 200 });
    
    expect(success).toBe(true);
    expect(result.points).toBe(100);
    expect(onClaim).toHaveBeenCalled();
    expect(localStorageMock.getItem('arenamind_eco_points')).toBe('100');
  });

  it('should fail reward claim if points are insufficient', () => {
    const onClaim = vi.fn();
    const { result } = runHook(() => useEcoPoints(100, onClaim));
    
    const success = result.claimReward({ id: 'claim-cup', name: 'Eco Cup', cost: 200 });
    
    expect(success).toBe(false);
    expect(result.points).toBe(100);
    expect(onClaim).not.toHaveBeenCalled();
  });
});
