import { describe, it, expect } from 'vitest';
import { validateRouteInput } from './routeValidator';

describe('Zod Route Schema Validation Tests', () => {
  it('should validate correctly for a valid start and end node', () => {
    const payload = {
      startNode: 'Gate_A',
      endNode: 'Sec_105'
    };
    const check = validateRouteInput(payload);
    expect(check.success).toBe(true);
  });

  it('should reject when startNode is unrecognized', () => {
    const payload = {
      startNode: 'InvalidNode',
      endNode: 'Sec_105'
    };
    const check = validateRouteInput(payload);
    expect(check.success).toBe(false);
  });

  it('should reject when endNode is unrecognized', () => {
    const payload = {
      startNode: 'Gate_A',
      endNode: 'InvalidNode'
    };
    const check = validateRouteInput(payload);
    expect(check.success).toBe(false);
  });

  it('should reject when startNode and endNode are identical', () => {
    const payload = {
      startNode: 'Sec_105',
      endNode: 'Sec_105'
    };
    const check = validateRouteInput(payload);
    expect(check.success).toBe(false);
    if (!check.success) {
      expect(check.error.errors[0].message).toContain('cannot be the same');
    }
  });
});
