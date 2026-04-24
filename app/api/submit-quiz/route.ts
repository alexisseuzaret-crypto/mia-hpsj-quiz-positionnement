import { NextRequest } from 'next/server';
import { z } from 'zod';
import { QUESTIONS } from '@/lib/questions';
import { calculateScore, calculateMaxScore, classify, applyKnockout } from '@/lib/scoring';
import { createSupabaseAdmin } from '@/lib/supabase-server';

const identitySchema = z.object({
  first_name: z.string().trim().min(1).max(100),
  last_name:  z.string().trim().min(1).max(100),
  email:      z.string().email().max(254),
  service:    z.string().max(100).nullable().optional(),
});

const bodySchema = z.object({
  identity: identitySchema,
  answers:  z.record(z.string(), z.array(z.string())),
});

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return Response.json({ error: 'Données invalides' }, { status: 400 });
    }

    const { identity, answers } = parsed.data;

    const maxScore = calculateMaxScore(QUESTIONS);
    const score    = calculateScore(answers, QUESTIONS);
    const level    = applyKnockout(answers, classify(score, maxScore));

    const responses = QUESTIONS.map((q) => {
      const selected = answers[q.id] ?? [];
      const points = q.options
        .filter((o) => selected.includes(o.value))
        .reduce((sum, o) => sum + o.points, 0);
      return {
        question_id:   q.id,
        answer_values: selected,
        points_earned: points,
      };
    });

    const supabase = createSupabaseAdmin();
    const { error: rpcError } = await supabase.rpc('submit_quiz', {
      p_first_name:   identity.first_name.trim(),
      p_last_name:    identity.last_name.trim(),
      p_email:        identity.email.toLowerCase().trim(),
      p_service:      identity.service ?? null,
      p_completed_at: new Date().toISOString(),
      p_total_score:  score,
      p_max_score:    maxScore,
      p_level:        level,
      p_responses:    responses,
    });

    if (rpcError) {
      console.error('[submit-quiz] RPC error:', rpcError.message);
      return Response.json({ error: 'Erreur lors de l\'enregistrement' }, { status: 500 });
    }

    return Response.json({
      level,
      score,
      maxScore,
      first_name: identity.first_name.trim(),
    });
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
