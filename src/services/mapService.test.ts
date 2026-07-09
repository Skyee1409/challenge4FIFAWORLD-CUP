import { describe, it, expect } from 'vitest';
import { MapService } from './mapService';

describe('MapService Pathfinding Tests', () => {
  it('should find a valid path between Gate B and Section 105', () => {
    const res = MapService.findPath('Gate_B', 'Sec_105', false);
    expect(res.path).not.toBeNull();
    expect(res.path![0]).toBe('Gate_B');
    expect(res.path![res.path!.length - 1]).toBe('Sec_105');
  });

  it('should utilize elevators/ramps when accessibleOnly is true', () => {
    const res = MapService.findPath('Gate_B', 'Sec_105', true);
    expect(res.path).not.toBeNull();
    expect(res.accessible).toBe(true);
    // Verify elevator/ramp connections in path
    expect(res.path).toContain('FirstAid'); // Central elevator hub connects to Section 105
  });

  it('should return null for invalid nodes', () => {
    const res = MapService.findPath('InvalidNode', 'Sec_105', false);
    expect(res.path).toBeNull();
  });
});

