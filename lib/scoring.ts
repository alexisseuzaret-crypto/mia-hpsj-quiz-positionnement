import type { Question } from './questions';

export type Level = 'debutant' | 'intermediaire' | 'avance';

export function calculateMaxScore(questions: Question[]): number {
  return questions.reduce((total, q) => {
    if (q.type === 'single') {
      return total + Math.max(...q.options.map(o => o.points));
    }
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
  // Q1 = "sais-tu lancer Copilot?" → non = Débutant systématique
  if (answers['q1']?.[0] === 'no') return 'debutant';

  // Q2 = fréquence jamais + Q3 = aucun outil → Débutant
  const neverUsed = answers['q2']?.[0] === 'never' && answers['q3']?.includes('none');
  return neverUsed ? 'debutant' : level;
}
