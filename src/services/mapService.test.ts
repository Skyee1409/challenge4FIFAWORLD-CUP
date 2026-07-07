import { describe, it, expect } from 'vitest';
import { MapService } from './mapService';

describe('MapService Pathfinding Tests', () => {
  it('should find a valid path between Gate B and Section 105', () => {
    const path = MapService.findPath('Gate_B', 'Sec_105', false);
    expect(path).not.toBeNull();
    expect(path![0]).toBe('Gate_B');
    expect(path![path!.length - 1]).toBe('Sec_105');
  });

  it('should utilize elevators/ramps when accessibleOnly is true', () => {
    const path = MapService.findPath('Gate_B', 'Sec_105', true);
    expect(path).not.toBeNull();
    // Verify elevator/ramp connections in path
    expect(path).toContain('FirstAid'); // Central elevator hub connects to Section 105
  });

  it('should return null for invalid nodes', () => {
    const path = MapService.findPath('InvalidNode', 'Sec_105', false);
    expect(path).toBeNull();
  });
});
