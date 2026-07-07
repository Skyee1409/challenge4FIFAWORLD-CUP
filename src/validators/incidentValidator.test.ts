import { describe, it, expect } from 'vitest';
import { validateIncidentInput } from './incidentValidator';

describe('Zod Incident Schema Validation Tests', () => {
  it('should validate correctly for a compliant incident payload', () => {
    const payload = {
      type: 'Medical',
      loc: 'Sec_105',
      desc: 'Attendee feeling dizzy in row 5'
    };
    const check = validateIncidentInput(payload);
    expect(check.success).toBe(true);
  });

  it('should reject when type category is unrecognized', () => {
    const payload = {
      type: 'InvalidType',
      loc: 'Sec_105',
      desc: 'Attendee feeling dizzy'
    };
    const check = validateIncidentInput(payload);
    expect(check.success).toBe(false);
  });

  it('should reject when description is too short', () => {
    const payload = {
      type: 'Maintenance',
      loc: 'Gate_A',
      desc: 'abc' // Min length 4
    };
    const check = validateIncidentInput(payload);
    expect(check.success).toBe(false);
  });
});
