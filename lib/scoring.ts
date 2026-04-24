import type { Question } from './questions';

export type Level = 'debutant' | 'intermediaire' | 'avance';

export function calculateMaxScore(questions: Question[]): number {
  return questions.reduce((total, q) => {
    if (q.type === 'single') {
      return total + Math.max(...q.options.map(o => o.points));
    }
    // multiple : somme des points strictement positifs uniquement
    return total + q.options.filter(o => o.points > 0).reduce((s, o) => s + o.points, 0);
  }, 0);
}

export function calculateScore(
  answers: Record<string, string[]>,
  questions: Question[]
): number {
  return questions.reduce((total, q) => {
    const selected = answers[q.id] ?? [];
    return total + q.options
      .filter(o => selected.includes(o.value))
      .reduce((s, o) => s + o.points, 0);
  }, 0);
}

export function classify(score: number, maxScore: number): Level {
  const pct = (score / maxScore) * 100;
  if (pct < 35) return 'debutant';
  if (pct < 70) return 'intermediaire';
  return 'avance';
}

export function applyKnockout(
  answers: Record<string, string[]>,
  level: Level
): Level {
  // Q1 est single-choice → on vérifie l'index 0
  const neverUsed = answers['q1']?.[0] === 'never' && answers['q2']?.includes('none');
  return neverUsed ? 'debutant' : level;
}
