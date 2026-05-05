export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseAdmin } from '@/lib/supabase-server';
import { QUESTIONS } from '@/lib/questions';
import DeleteParticipantButton from './DeleteParticipantButton';

const FORMAT_LABEL: Record<string, string> = {
  presentiel: 'Présentiel',
  distanciel: 'Distanciel',
  indifferent: 'Indifférent',
};

const LEVEL_LABEL: Record<string, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
};

const LEVEL_COLOR: Record<string, string> = {
  debutant: '#F97316',
  intermediaire: '#0EA5E9',
  avance: '#1A203D',
};

const SECTION_LABEL: Record<string, string> = {
  profil: 'Profil',
  prompting: 'Prompting',
  fonctionnalites: 'Fonctionnalités',
  'usage-responsable': 'Usage responsable',
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ParticipantPage({ params }: Props) {
  const { id } = await params;
  const supabase = createSupabaseAdmin();

  const [{ data: participant }, { data: responses }] = await Promise.all([
    supabase
      .from('participants')
      .select('id, first_name, last_name, email, site, pole, service, training_format, level, total_score, max_score, completed_at')
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('responses')
      .select('question_id, answer_values, points_earned, other_text')
      .eq('participant_id', id)
      .order('question_id'),
  ]);

  if (!participant) notFound();

  const pct = Math.round((participant.total_score / participant.max_score) * 100);
  const date = new Date(participant.completed_at).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const responseMap = Object.fromEntries(
    (responses ?? []).map((r) => [
      r.question_id,
      {
        values: r.answer_values as string[],
        points: r.points_earned,
        otherText: r.other_text as string | null,
      },
    ])
  );

  const currentSection = { ref: '' as string };

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <div style={{ background: 'var(--background)', borderBottom: '1px solid var(--surface)' }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-sm" style={{ color: 'var(--text-muted)' }}>
            ← Retour au dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Résumé participant */}
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{ background: 'var(--background)', boxShadow: '0 2px 16px 0 rgba(26,32,61,0.08)' }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
                {participant.first_name} {participant.last_name}
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {participant.email}
              </p>
              {participant.site && (
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Site : {participant.site}
                </p>
              )}
              {participant.pole && (
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Pôle : {participant.pole}
                </p>
              )}
              {participant.service && (
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Service : {participant.service}
                </p>
              )}
              {participant.training_format && (
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Format préféré : {FORMAT_LABEL[participant.training_format]}
                </p>
              )}
            </div>
            <span
              className="inline-block text-sm font-semibold px-3 py-1 rounded-full shrink-0"
              style={{ background: LEVEL_COLOR[participant.level], color: '#fff' }}
            >
              {LEVEL_LABEL[participant.level]}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
              <span>Score</span>
              <span className="font-semibold" style={{ color: 'var(--text)' }}>
                {participant.total_score} / {participant.max_score} ({pct} %)
              </span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ background: '#E2E8F0' }}>
              <div
                className="h-2 rounded-full"
                style={{ width: `${pct}%`, background: LEVEL_COLOR[participant.level] }}
              />
            </div>
          </div>

          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Complété le {date}
          </p>
        </div>

        {/* Détail des réponses */}
        <div className="space-y-4">
          {QUESTIONS.map((q) => {
            const resp = responseMap[q.id];
            const selectedValues: string[] = resp?.values ?? [];
            const showSectionHeader = q.section !== currentSection.ref;
            if (showSectionHeader) currentSection.ref = q.section;

            return (
              <div key={q.id}>
                {showSectionHeader && (
                  <h2 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                    {SECTION_LABEL[q.section]}
                  </h2>
                )}
                <div
                  className="rounded-xl p-4 space-y-2"
                  style={{ background: 'var(--background)' }}
                >
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    {q.label}
                  </p>
                  <div className="space-y-1">
                    {q.options.map((opt) => {
                      const isSelected = selectedValues.includes(opt.value);
                      return (
                        <div key={opt.value}>
                          <div
                            className="flex items-center justify-between px-3 py-1.5 rounded-lg text-sm"
                            style={{
                              background: isSelected ? 'var(--primary)' : 'transparent',
                              color: isSelected ? '#fff' : 'var(--text-muted)',
                            }}
                          >
                            <span>{opt.label}</span>
                            {isSelected && (
                              <span className="text-xs opacity-80">+{opt.points} pt{opt.points > 1 ? 's' : ''}</span>
                            )}
                          </div>
                          {isSelected && opt.allowOtherText && resp?.otherText && (
                            <p className="text-xs mt-0.5 ml-3 italic" style={{ color: 'var(--text-muted)' }}>
                              Précision : {resp.otherText}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Suppression */}
        <div
          className="rounded-2xl p-6"
          style={{ background: 'var(--background)', boxShadow: '0 2px 16px 0 rgba(26,32,61,0.08)' }}
        >
          <DeleteParticipantButton
            id={participant.id}
            firstName={participant.first_name}
            lastName={participant.last_name}
            email={participant.email}
          />
        </div>
      </div>
    </div>
  );
}
