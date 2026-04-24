'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ResultCard from '@/components/ResultCard';
import type { Level } from '@/lib/scoring';

type QuizResult = {
  level: Level;
  score: number;
  maxScore: number;
  first_name: string;
};

export default function ResultatPage() {
  const router = useRouter();
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('quiz_result');
      if (!raw) { router.replace('/quiz'); return; }
      const parsed = JSON.parse(raw) as QuizResult;
      if (!parsed.level || parsed.score === undefined) { router.replace('/quiz'); return; }
      setResult(parsed);
    } catch {
      router.replace('/quiz');
    }
  }, [router]);

  if (!result) return null;

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div
        className="w-full max-w-[600px] rounded-2xl p-8"
        style={{ background: 'var(--background)', boxShadow: '0 2px 16px 0 rgba(26,32,61,0.08)' }}
      >
        <ResultCard
          level={result.level}
          score={result.score}
          maxScore={result.maxScore}
          firstName={result.first_name}
        />

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm underline-offset-2 hover:underline"
            style={{ color: 'var(--text-muted)' }}
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
