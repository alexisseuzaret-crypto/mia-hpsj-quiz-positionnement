import { describe, it, expect } from 'vitest';
import { calculateScore, calculateMaxScore, classify, applyKnockout } from '../lib/scoring';
import { QUESTIONS } from '../lib/questions';
import type { Question } from '../lib/questions';

const singleQ: Question[] = [{
  id: 'test', section: 'profil', type: 'single', label: 'Test',
  options: [
    { value: 'low',  label: 'Low',  points: 1 },
    { value: 'high', label: 'High', points: 5 },
  ],
}];

const multipleQ: Question[] = [{
  id: 'test', section: 'profil', type: 'multiple', label: 'Test',
  options: [
    { value: 'none', label: 'Aucun', points: 0 },
    { value: 'a',    label: 'A',     points: 2 },
    { value: 'b',    label: 'B',     points: 3 },
  ],
}];

describe('calculateMaxScore', () => {
  it('retourne 87 pour les 21 questions réelles', () => {
    expect(calculateMaxScore(QUESTIONS)).toBe(87);
  });
  it('single → max des options', () => {
    expect(calculateMaxScore(singleQ)).toBe(5);
  });
  it('multiple → somme des points positifs uniquement', () => {
    expect(calculateMaxScore(multipleQ)).toBe(5);
  });
});

describe('calculateScore', () => {
  it("single → points de l'option sélectionnée", () => {
    expect(calculateScore({ test: ['high'] }, singleQ)).toBe(5);
  });
  it('multiple → somme des options sélectionnées', () => {
    expect(calculateScore({ test: ['a', 'b'] }, multipleQ)).toBe(5);
  });
  it('aucune réponse → 0', () => {
    expect(calculateScore({}, singleQ)).toBe(0);
  });
  it('option inconnue → 0', () => {
    expect(calculateScore({ test: ['x'] }, singleQ)).toBe(0);
  });
});

describe('classify', () => {
  it('< 35% → debutant', () => {
    expect(classify(30, 87)).toBe('debutant');
  });
  it('>= 35% et < 70% → intermediaire', () => {
    expect(classify(31, 87)).toBe('intermediaire');
    expect(classify(55, 87)).toBe('intermediaire');
  });
  it('>= 70% → avance', () => {
    expect(classify(61, 87)).toBe('avance');
    expect(classify(87, 87)).toBe('avance');
  });
});

describe('applyKnockout', () => {
  it('Q1=no → force debutant (knockout launch)', () => {
    expect(applyKnockout({ q1: ['no'] }, 'avance')).toBe('debutant');
    expect(applyKnockout({ q1: ['no'] }, 'intermediaire')).toBe('debutant');
  });
  it('Q2=never ET Q3 inclut none → force debutant', () => {
    expect(applyKnockout({ q1: ['yes'], q2: ['never'], q3: ['none'] }, 'avance')).toBe('debutant');
  });
  it('Q2=never mais Q3 sans none → conserve level', () => {
    expect(applyKnockout({ q1: ['yes'], q2: ['never'], q3: ['web'] }, 'intermediaire')).toBe('intermediaire');
  });
  it('Q3 inclut none mais Q2 != never → conserve level', () => {
    expect(applyKnockout({ q1: ['yes'], q2: ['daily'], q3: ['none'] }, 'avance')).toBe('avance');
  });
  it('Q1=yes, pas de knockout → conserve level', () => {
    expect(applyKnockout({ q1: ['yes'], q2: ['daily'], q3: ['web'] }, 'avance')).toBe('avance');
  });
});
