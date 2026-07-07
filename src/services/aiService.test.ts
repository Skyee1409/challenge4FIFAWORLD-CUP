import { describe, it, expect } from 'vitest';
import { AIService } from './aiService';

describe('AIService QA and Recommender Tests', () => {
  it('should match keywords semantically for English query', () => {
    const res = AIService.resolveConciergeQuery('Where is wheelchair access?', 'en');
    expect(res).toContain('Accessibility Guide');
  });

  it('should match keywords semantically for Spanish query', () => {
    const res = AIService.resolveConciergeQuery('comida en puerta A', 'es');
    expect(res).toContain('Concesiones y Alimentos');
  });

  it('should trigger translate handler', () => {
    const res = AIService.resolveConciergeQuery('translate: where is the restroom', 'en');
    expect(res).toContain('Translation Hub');
  });

  it('should generate appropriate dispatch guidelines by category', () => {
    const medRec = AIService.generateDispatchRecommendation('Medical', 'Sec_105');
    expect(medRec).toContain('Team 2');
    expect(medRec).toContain('Sec 105');

    const cleanRec = AIService.generateDispatchRecommendation('Maintenance', 'Sec_103');
    expect(cleanRec).toContain('Sanitation Team-B');
  });
});
