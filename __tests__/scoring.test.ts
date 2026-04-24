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
  it('retourne 79 pour les 20 questions réelles', () => {
    expect(calculateMaxScore(QUESTIONS)).toBe(79);
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
    expect(classify(27, 79)).toBe('debutant');
  });
  it('>= 35% et < 70% → intermediaire', () => {
    expect(classify(28, 79)).toBe('intermediaire');
    expect(classify(55, 79)).toBe('intermediaire');
  });
  it('>= 70% → avance', () => {
    expect(classify(56, 79)).toBe('avance');
    expect(classify(79, 79)).toBe('avance');
  });
});

describe('applyKnockout', () => {
  it('Q1=never ET Q2 inclut none → force debutant', () => {
    expect(applyKnockout({ q1: ['never'], q2: ['none'] }, 'avance')).toBe('debutant');
    expect(applyKnockout({ q1: ['never'], q2: ['none'] }, 'intermediaire')).toBe('debutant');
  });
  it('Q1=never mais Q2 sans none → conserve level', () => {
    expect(applyKnockout({ q1: ['never'], q2: ['emails'] }, 'intermediaire')).toBe('intermediaire');
  });
  it('Q2 inclut none mais Q1 != never → conserve level', () => {
    expect(applyKnockout({ q1: ['daily'], q2: ['none'] }, 'avance')).toBe('avance');
  });
  it('pas de knockout → conserve level', () => {
    expect(applyKnockout({ q1: ['daily'], q2: ['emails'] }, 'avance')).toBe('avance');
  });
});
