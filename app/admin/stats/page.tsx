import { createSupabaseAdmin } from '@/lib/supabase-server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Ordre d'affichage des niveaux
const LEVELS = [
  { key: 'debutant', label: 'Débutant', color: '#F97316' },
  { key: 'intermediaire', label: 'Intermédiaire', color: '#1A203D' },
  { key: 'avance', label: 'Avancé', color: '#22C55E' },
] as const;

// Ordre d'affichage des formats
const FORMATS = [
  { key: 'presentiel', label: 'Présentiel' },
  { key: 'distanciel', label: 'Distanciel' },
  { key: 'indifferent', label: 'Indifférent' },
  { key: null, label: 'Non renseigné' },
] as const;

// Formatage pourcentage
function pct(part: number, total: number): string {
  if (total === 0) return '—';
  return Math.round((part / total) * 100) + ' %';
}

export default async function StatsPage() {
  const supabase = createSupabaseAdmin();

  // --- Requêtes parallèles ---
  const [
    { count: completedCount },
    { count: incompleteCount },
    { data: byLevel },
    { data: byFormat },
    { data: crosstab },
  ] = await Promise.all([
    supabase
      .from('participants')
      .select('id', { count: 'exact', head: true })
      .not('completed_at', 'is', null),
    supabase
      .from('participants')
      .select('id', { count: 'exact', head: true })
      .is('completed_at', null),
    supabase
      .from('participants')
      .select('level')
      .not('completed_at', 'is', null),
    supabase
      .from('participants')
      .select('training_format')
      .not('completed_at', 'is', null),
    supabase
      .from('participants')
      .select('level, training_format')
      .not('completed_at', 'is', null),
  ]);

  const completed = completedCount ?? 0;
  const incomplete = incompleteCount ?? 0;
  const total = completed + incomplete;

  // --- Agrégations niveau ---
  const levelCounts: Record<string, number> = {};
  for (const row of byLevel ?? []) {
    const k = row.level ?? '__null__';
    levelCounts[k] = (levelCounts[k] ?? 0) + 1;
  }

  // --- Agrégations format ---
  const formatCounts: Record<string, number> = {};
  for (const row of byFormat ?? []) {
    const k = row.training_format ?? '__null__';
    formatCounts[k] = (formatCounts[k] ?? 0) + 1;
  }

  // --- Croisement niveau × format ---
  // Structure : crossData[level][format] = count
  const crossData: Record<string, Record<string, number>> = {};
  for (const lvl of LEVELS) {
    crossData[lvl.key] = {};
    for (const fmt of FORMATS) {
      const fmtKey = fmt.key ?? '__null__';
      crossData[lvl.key][fmtKey] = 0;
    }
  }
  for (const row of crosstab ?? []) {
    const lvlKey = row.level;
    const fmtKey = row.training_format ?? '__null__';
    if (lvlKey && crossData[lvlKey] !== undefined) {
      crossData[lvlKey][fmtKey] = (crossData[lvlKey][fmtKey] ?? 0) + 1;
    }
  }

  // Totaux colonnes pour le tableau croisé
  const crossColTotals: Record<string, number> = {};
  for (const fmt of FORMATS) {
    const fmtKey = fmt.key ?? '__null__';
    crossColTotals[fmtKey] = LEVELS.reduce(
      (acc, lvl) => acc + (crossData[lvl.key]?.[fmtKey] ?? 0),
      0
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      {/* Header */}
      <div style={{ background: 'var(--background)', borderBottom: '1px solid var(--surface)' }}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/admin/dashboard"
            className="text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            ← Retour au dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Titre */}
        <h1 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
          Statistiques
        </h1>

        {/* ── Section 1 : Vue d'ensemble ── */}
        <section className="space-y-3">
          <h2
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            Vue d&apos;ensemble
          </h2>
          <div className="flex flex-wrap gap-4">
            {/* Total complétés */}
            <div
              className="rounded-xl p-5 flex-1 min-w-[160px]"
              style={{
                background: 'var(--background)',
                boxShadow: '0 2px 8px rgba(26,32,61,0.06)',
              }}
            >
              <div className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
                {completed}
              </div>
              <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Complétés
              </div>
            </div>

            {/* Incomplets */}
            <div
              className="rounded-xl p-5 flex-1 min-w-[160px]"
              style={{
                background: 'var(--background)',
                boxShadow: '0 2px 8px rgba(26,32,61,0.06)',
              }}
            >
              <div className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
                {incomplete}
              </div>
              <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Incomplets
              </div>
            </div>

            {/* Taux de complétion */}
            <div
              className="rounded-xl p-5 flex-1 min-w-[160px]"
              style={{
                background: 'var(--background)',
                boxShadow: '0 2px 8px rgba(26,32,61,0.06)',
              }}
            >
              <div className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
                {total === 0 ? '—' : Math.round((completed / total) * 100) + ' %'}
              </div>
              <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Taux de complétion
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 2 : Répartition par niveau ── */}
        <section className="space-y-3">
          <h2
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            Répartition par niveau
          </h2>
          <div
            className="overflow-x-auto rounded-xl"
            style={{ border: '1px solid var(--surface)' }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--background)', borderBottom: '1px solid var(--surface)' }}>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>
                    Niveau
                  </th>
                  <th className="text-right px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>
                    Effectif
                  </th>
                  <th className="text-right px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {LEVELS.map((lvl, i) => {
                  const count = levelCounts[lvl.key] ?? 0;
                  return (
                    <tr
                      key={lvl.key}
                      style={{
                        background: i % 2 === 0 ? 'var(--background)' : 'var(--surface)',
                        borderBottom: '1px solid var(--surface)',
                      }}
                    >
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ background: lvl.color }}
                        >
                          {lvl.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right" style={{ color: 'var(--text)' }}>
                        {count}
                      </td>
                      <td className="px-4 py-3 text-right" style={{ color: 'var(--text-muted)' }}>
                        {pct(count, completed)}
                      </td>
                    </tr>
                  );
                })}
                {/* Ligne total */}
                <tr style={{ background: 'var(--background)', fontWeight: 600 }}>
                  <td className="px-4 py-3" style={{ color: 'var(--text)' }}>Total</td>
                  <td className="px-4 py-3 text-right" style={{ color: 'var(--text)' }}>
                    {completed}
                  </td>
                  <td className="px-4 py-3 text-right" style={{ color: 'var(--text-muted)' }}>
                    {completed === 0 ? '—' : '100 %'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Section 3 : Préférence format de formation ── */}
        <section className="space-y-3">
          <h2
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            Préférence format de formation
          </h2>
          <div
            className="overflow-x-auto rounded-xl"
            style={{ border: '1px solid var(--surface)' }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--background)', borderBottom: '1px solid var(--surface)' }}>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>
                    Format
                  </th>
                  <th className="text-right px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>
                    Effectif
                  </th>
                  <th className="text-right px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {FORMATS.map((fmt, i) => {
                  const fmtKey = fmt.key ?? '__null__';
                  const count = formatCounts[fmtKey] ?? 0;
                  return (
                    <tr
                      key={fmtKey}
                      style={{
                        background: i % 2 === 0 ? 'var(--background)' : 'var(--surface)',
                        borderBottom: '1px solid var(--surface)',
                      }}
                    >
                      <td className="px-4 py-3" style={{ color: 'var(--text)' }}>
                        {fmt.label}
                      </td>
                      <td className="px-4 py-3 text-right" style={{ color: 'var(--text)' }}>
                        {count}
                      </td>
                      <td className="px-4 py-3 text-right" style={{ color: 'var(--text-muted)' }}>
                        {pct(count, completed)}
                      </td>
                    </tr>
                  );
                })}
                {/* Ligne total */}
                <tr style={{ background: 'var(--background)', fontWeight: 600 }}>
                  <td className="px-4 py-3" style={{ color: 'var(--text)' }}>Total</td>
                  <td className="px-4 py-3 text-right" style={{ color: 'var(--text)' }}>
                    {completed}
                  </td>
                  <td className="px-4 py-3 text-right" style={{ color: 'var(--text-muted)' }}>
                    {completed === 0 ? '—' : '100 %'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Section 4 : Croisement Niveau × Format ── */}
        <section className="space-y-3">
          <h2
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            Croisement Niveau × Format
          </h2>
          <div
            className="overflow-x-auto rounded-xl"
            style={{ border: '1px solid var(--surface)' }}
          >
            {completed === 0 ? (
              <div
                className="px-4 py-8 text-center text-sm"
                style={{ color: 'var(--text-muted)', background: 'var(--background)' }}
              >
                Aucune donnée disponible
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--background)', borderBottom: '1px solid var(--surface)' }}>
                    <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>
                      Niveau
                    </th>
                    {FORMATS.map((fmt) => (
                      <th
                        key={fmt.key ?? '__null__'}
                        className="text-right px-4 py-3 font-medium"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {fmt.label}
                      </th>
                    ))}
                    <th className="text-right px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {LEVELS.map((lvl, i) => {
                    const rowTotal = FORMATS.reduce(
                      (acc, fmt) => acc + (crossData[lvl.key]?.[fmt.key ?? '__null__'] ?? 0),
                      0
                    );
                    return (
                      <tr
                        key={lvl.key}
                        style={{
                          background: i % 2 === 0 ? 'var(--background)' : 'var(--surface)',
                          borderBottom: '1px solid var(--surface)',
                        }}
                      >
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ background: lvl.color }}
                          >
                            {lvl.label}
                          </span>
                        </td>
                        {FORMATS.map((fmt) => {
                          const fmtKey = fmt.key ?? '__null__';
                          const count = crossData[lvl.key]?.[fmtKey] ?? 0;
                          return (
                            <td
                              key={fmtKey}
                              className="px-4 py-3 text-right"
                              style={{ color: 'var(--text)' }}
                            >
                              {count}
                            </td>
                          );
                        })}
                        <td
                          className="px-4 py-3 text-right font-medium"
                          style={{ color: 'var(--text)' }}
                        >
                          {rowTotal}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Ligne total */}
                  <tr style={{ background: 'var(--background)', fontWeight: 600 }}>
                    <td className="px-4 py-3" style={{ color: 'var(--text)' }}>Total</td>
                    {FORMATS.map((fmt) => {
                      const fmtKey = fmt.key ?? '__null__';
                      return (
                        <td
                          key={fmtKey}
                          className="px-4 py-3 text-right"
                          style={{ color: 'var(--text)' }}
                        >
                          {crossColTotals[fmtKey] ?? 0}
                        </td>
                      );
                    })}
                    <td
                      className="px-4 py-3 text-right font-medium"
                      style={{ color: 'var(--text)' }}
                    >
                      {completed}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
