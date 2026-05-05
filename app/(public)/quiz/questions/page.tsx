'use client';

import { useEffect, useReducer, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QUESTIONS } from '@/lib/questions';
import ProgressBar from '@/components/ProgressBar';
import QuizQuestion from '@/components/QuizQuestion';
import { Button } from '@/components/ui/button';

type Identity = {
  first_name: string;
  last_name: string;
  email: string;
  site: string | null;
  pole: string | null;
  service: string | null;
  training_format: 'presentiel' | 'distanciel' | 'indifferent' | null;
};

type State = {
  currentIndex: number;
  answers: Record<string, string[]>;
};

type Action =
  | { type: 'SET_ANSWER'; questionId: string; values: string[] }
  | { type: 'NEXT' }
  | { type: 'PREV' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.values },
      };
    case 'NEXT':
      return { ...state, currentIndex: Math.min(state.currentIndex + 1, QUESTIONS.length - 1) };
    case 'PREV':
      return { ...state, currentIndex: Math.max(state.currentIndex - 1, 0) };
  }
}

export default function QuizQuestionsPage() {
  const router = useRouter();
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otherTexts, setOtherTexts] = useState<Record<string, string>>({});

  const [state, dispatch] = useReducer(reducer, {
    currentIndex: 0,
    answers: {},
  });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('quiz_identity');
      if (!raw) { router.replace('/quiz'); return; }
      const parsed = JSON.parse(raw) as Identity;
      if (!parsed.first_name || !parsed.email) { router.replace('/quiz'); return; }
      setIdentity(parsed);
    } catch {
      router.replace('/quiz');
    }
  }, [router]);

  const question = QUESTIONS[state.currentIndex];
  const selectedValues = state.answers[question.id] ?? [];
  const isLast = state.currentIndex === QUESTIONS.length - 1;
  const canProceed = selectedValues.length > 0;

  const handleSubmit = async () => {
    if (!canProceed || !identity) return;
    setSubmitting(true);
    setError(null);
    try {
      // Fusionner les réponses normales et les textes "Autre"
      const allAnswers: Record<string, string[]> = { ...state.answers };
      for (const [qId, text] of Object.entries(otherTexts)) {
        if (text?.trim()) allAnswers[`${qId}_other`] = [text.trim().slice(0, 200)];
      }

      const res = await fetch('/api/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity, answers: allAnswers }),
      });
      const data = await res.json().catch(() => ({})) as { error?: string; level?: string; score?: number; maxScore?: number; first_name?: string };
      if (!res.ok) throw new Error(data.error ?? 'Erreur serveur');
      sessionStorage.setItem('quiz_result', JSON.stringify(data));
      router.push('/quiz/resultat');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue. Veuillez réessayer.');
      setSubmitting(false);
    }
  };

  if (!identity) return null;

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div
        className="w-full max-w-[640px] rounded-2xl p-8 space-y-8"
        style={{ background: 'var(--background)', boxShadow: '0 2px 16px 0 rgba(26,32,61,0.08)' }}
      >
        <ProgressBar current={state.currentIndex + 1} total={QUESTIONS.length} />

        <QuizQuestion
          question={question}
          selectedValues={selectedValues}
          onAnswer={(values) =>
            dispatch({ type: 'SET_ANSWER', questionId: question.id, values })
          }
          otherText={otherTexts[question.id]}
          onOtherText={(text) =>
            setOtherTexts((prev) => ({ ...prev, [question.id]: text }))
          }
        />

        {error && (
          <p role="alert" className="text-sm text-center" style={{ color: '#EF4444' }}>
            {error}
          </p>
        )}

        <div className="flex justify-between gap-4 pt-2">
          {state.currentIndex > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch({ type: 'PREV' })}
              className="cursor-pointer"
            >
              ← Précédent
            </Button>
          ) : (
            <div />
          )}

          {isLast ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!canProceed || submitting}
              className="cursor-pointer"
              style={{ background: 'var(--primary)', color: '#fff' }}
            >
              {submitting ? 'Envoi en cours…' : 'Soumettre le quiz →'}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => dispatch({ type: 'NEXT' })}
              disabled={!canProceed}
              className="cursor-pointer"
              style={{ background: 'var(--primary)', color: '#fff' }}
            >
              Suivant →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
