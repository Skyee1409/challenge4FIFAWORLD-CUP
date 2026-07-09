import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as React from 'react';
import { useIncidents } from './useIncidents';

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

describe('useIncidents Hook Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should initialize with default values if localstorage is empty', () => {
    const { result } = runHook(() => useIncidents([]));
    expect(result.incidents.length).toBe(0);
    expect(result.selectedIncidentId).toBeNull();
  });

  it('should restore incidents from localStorage', () => {
    const mockData = [{ id: 'inc-99', type: 'Medical' as const, desc: 'Test Incident', loc: 'Gate_A', time: '10:00 AM', status: 'pending' as const, recommendation: '' }];
    localStorageMock.setItem('arenamind_incidents', JSON.stringify(mockData));

    const { result } = runHook(() => useIncidents([]));
    expect(result.incidents.length).toBe(1);
    expect(result.incidents[0].id).toBe('inc-99');
    expect(result.incidents[0].type).toBe('Medical');
  });

  it('should log a new incident and update state and localStorage', () => {
    const { result } = runHook(() => useIncidents([]));

    const res = result.logIncident('Medical', 'Gate_A', 'Severe heat exhaustion reported');

    expect(res.success).toBe(true);
    expect(result.incidents.length).toBe(1);
    expect(result.incidents[0].type).toBe('Medical');
    expect(result.incidents[0].desc).toBe('Severe heat exhaustion reported');
    expect(result.selectedIncidentId).toBe(result.incidents[0].id);
    expect(localStorageMock.getItem('arenamind_incidents')).toContain('Severe heat exhaustion reported');
  });

  it('should reject invalid incident logging', () => {
    const { result } = runHook(() => useIncidents([]));

    const res = result.logIncident('Medical', 'Gate_A', 'abc'); // too short

    expect(res.success).toBe(false);
    expect(res.errors).toBeDefined();
    expect(result.incidents.length).toBe(0);
  });

  it('should update incident status to dispatched', () => {
    const mockData = [{ id: 'inc-99', type: 'Medical' as const, desc: 'Test Incident', loc: 'Gate_A', time: '10:00 AM', status: 'pending' as const, recommendation: '' }];
    localStorageMock.setItem('arenamind_incidents', JSON.stringify(mockData));

    const { result } = runHook(() => useIncidents([]));

    result.dispatchIncident('inc-99');

    expect(result.incidents[0].status).toBe('dispatched');
    expect(result.incidents[0].recommendation).toContain('Resources Dispatched');
  });

  it('should update incident status to resolved', () => {
    const mockData = [{ id: 'inc-99', type: 'Medical' as const, desc: 'Test Incident', loc: 'Gate_A', time: '10:00 AM', status: 'pending' as const, recommendation: '' }];
    localStorageMock.setItem('arenamind_incidents', JSON.stringify(mockData));

    const { result } = runHook(() => useIncidents([]));
    result.setSelectedIncidentId('inc-99');

    result.resolveIncident('inc-99');

    expect(result.incidents[0].status).toBe('resolved');
    expect(result.selectedIncidentId).toBeNull();
  });
});
