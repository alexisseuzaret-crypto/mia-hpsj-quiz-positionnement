import { NextRequest } from 'next/server';
import { z } from 'zod';
import { QUESTIONS } from '@/lib/questions';
import { calculateScore, calculateMaxScore, classify, applyKnockout } from '@/lib/scoring';
import { createSupabaseAdmin } from '@/lib/supabase-server';

const identitySchema = z.object({
  first_name:      z.string().trim().min(1).max(100),
  last_name:       z.string().trim().min(1).max(100),
  email:           z.string().email().max(254),
  site:            z.string().trim().min(1).max(100),
  pole:            z.string().trim().min(1).max(100),
  service:         z.string().trim().min(1).max(100),
  training_format: z.enum(['presentiel', 'distanciel', 'indifferent']).nullable().optional(),
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

    // Exclure les clés _other du calcul de score (elles ne correspondent à aucune question)
    const scoreAnswers: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(answers)) {
      if (!k.endsWith('_other')) scoreAnswers[k] = v;
    }

    const maxScore = calculateMaxScore(QUESTIONS);
    const score    = calculateScore(scoreAnswers, QUESTIONS);
    const level    = applyKnockout(scoreAnswers, classify(score, maxScore));

    const responses = QUESTIONS.map((q) => {
      const selected = scoreAnswers[q.id] ?? [];
      const rawOther = (answers[`${q.id}_other`] ?? [])[0];
      // Ne stocker other_text que si l'option allowOtherText est réellement sélectionnée
      const hasOtherSelected = q.options.some(o => o.allowOtherText && selected.includes(o.value));
      const otherText = (hasOtherSelected && rawOther) ? rawOther.trim().slice(0, 200) : null;
      const points = q.options
        .filter((o) => selected.includes(o.value))
        .reduce((sum, o) => sum + o.points, 0);
      return {
        question_id:   q.id,
        answer_values: selected,
        points_earned: points,
        other_text:    otherText,
      };
    });

    const supabase = createSupabaseAdmin();
    const { error: rpcError } = await supabase.rpc('submit_quiz', {
      p_first_name:      identity.first_name.trim(),
      p_last_name:       identity.last_name.trim(),
      p_email:           identity.email.toLowerCase().trim(),
      p_site:            identity.site.trim(),
      p_pole:            identity.pole.trim(),
      p_service:         identity.service.trim(),
      p_completed_at:    new Date().toISOString(),
      p_total_score:     score,
      p_max_score:       maxScore,
      p_level:           level,
      p_responses:       responses,
      p_training_format: identity.training_format ?? null,
    });

    if (rpcError) {
      console.error('[submit-quiz] RPC error:', rpcError.message);
      return Response.json({ error: "Erreur lors de l'enregistrement" }, { status: 500 });
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
