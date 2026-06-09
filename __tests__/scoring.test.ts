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
  it('retourne 76 pour les 19 questions réelles', () => {
    expect(calculateMaxScore(QUESTIONS)).toBe(76);
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
    expect(classify(26, 76)).toBe('debutant');
  });
  it('>= 35% et < 70% → intermediaire', () => {
    expect(classify(27, 76)).toBe('intermediaire');
    expect(classify(53, 76)).toBe('intermediaire');
  });
  it('>= 70% → avance', () => {
    expect(classify(54, 76)).toBe('avance');
    expect(classify(76, 76)).toBe('avance');
  });
});

describe('applyKnockout', () => {
  it('Q1=no seul → force debutant (ancien knockout préservé)', () => {
    expect(applyKnockout({ q1: ['no'] }, 'avance')).toBe('debutant');
    expect(applyKnockout({ q1: ['no'] }, 'intermediaire')).toBe('debutant');
  });
  it('Zéro IA complet (5/5 négatifs) → debutant', () => {
    expect(applyKnockout(
      { q1: ['no'], q2: ['never'], q3: ['novice'], q4: ['none'], q5: ['none'] },
      'debutant'
    )).toBe('debutant');
  });
  it('Zéro IA partiel (4/5 négatifs, q1=yes) → conserve level', () => {
    expect(applyKnockout(
      { q1: ['yes'], q2: ['never'], q3: ['novice'], q4: ['none'], q5: ['none'] },
      'intermediaire'
    )).toBe('intermediaire');
  });
  it('Profil avancé normal → avance', () => {
    expect(applyKnockout(
      { q1: ['yes'], q2: ['daily'], q3: ['advanced'], q4: ['chatgpt', 'claude'], q5: ['external'] },
      'avance'
    )).toBe('avance');
  });
});
