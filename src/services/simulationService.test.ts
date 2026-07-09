import { describe, it, expect } from 'vitest';
import { SimulationService } from './simulationService';

describe('SimulationService Tests', () => {
  it('should return a valid simulation scenario for known keys', () => {
    const scenario = SimulationService.getScenario('thunderstorm');
    expect(scenario).toBeDefined();
    expect(scenario?.name).toContain('Thunderstorm');
    expect(scenario?.impact).toContain('lightning');
    expect(scenario?.actions.length).toBeGreaterThan(0);
  });

  it('should return undefined for unknown simulation scenario keys', () => {
    const scenario = SimulationService.getScenario('unknown_scenario_key');
    expect(scenario).toBeUndefined();
  });
});
