import { describe, it, expect } from 'vitest';
import { MapService } from './mapService';

describe('MapService Dijkstra Pathfinding Tests', () => {
  it('should find a valid path between Gate B and Section 105', () => {
    const res = MapService.findPath('Gate_B', 'Sec_105', false);
    expect(res.path).not.toBeNull();
    expect(res.path![0]).toBe('Gate_B');
    expect(res.path![res.path!.length - 1]).toBe('Sec_105');
  });

  it('should find the mathematically shortest path based on edge weights', () => {
    // Gate_A to Sec_103:
    // Route 1: Gate_A -> Sec_103 (distance = 120)
    // Route 2: Gate_A -> Sec_102 (60) -> Sec_103 (110) = 170
    // Route 3: Gate_A -> Sec_102 (60) -> FirstAid (65) -> Restroom_1 (155) -> Sec_103 (50) = 330
    // Therefore, Dijkstra should select the direct edge Gate_A -> Sec_103 (dist: 120) rather than standard BFS if BFS had hops but different weights,
    // or select Gate_A -> Sec_102 (dist 60) for Gate_A -> Sec_102.
    const res = MapService.findPath('Gate_A', 'Sec_103', false);
    expect(res.path).toEqual(['Gate_A', 'Sec_103']);
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

