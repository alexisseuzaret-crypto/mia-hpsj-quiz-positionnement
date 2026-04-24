'use client';

import Link from 'next/link';
import AdminTableHead from './AdminTableHead';
import type { Filters } from './AdminFilters';

export type Participant = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  service: string | null;
  level: 'debutant' | 'intermediaire' | 'avance';
  total_score: number;
  max_score: number;
  completed_at: string;
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

type Props = {
  participants: Participant[];
  filters: Filters;
};

export default function AdminTable({ participants, filters }: Props) {
  const filtered = participants.filter((p) => {
    if (filters.level !== 'all' && p.level !== filters.level) return false;
    if (filters.service !== 'all' && p.service !== filters.service) return false;
    return true;
  });

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-center py-12" style={{ color: 'var(--text-muted)' }}>
        Aucun participant ne correspond aux filtres sélectionnés.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--surface)' }}>
      <table className="w-full text-sm">
        <AdminTableHead />
        <tbody>
          {filtered.map((p) => {
            const pct = Math.round((p.total_score / p.max_score) * 100);
            const date = new Date(p.completed_at).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });
            return (
              <tr
                key={p.id}
                className="hover:bg-slate-50 transition-colors"
                style={{ borderBottom: '1px solid var(--surface)' }}
              >
                <td className="px-3 py-2 font-medium" style={{ color: 'var(--text)' }}>
                  <Link
                    href={`/admin/participant/${p.id}`}
                    className="hover:underline"
                    style={{ color: 'var(--primary)' }}
                  >
                    {p.first_name}
                  </Link>
                </td>
                <td className="px-3 py-2" style={{ color: 'var(--text)' }}>{p.last_name}</td>
                <td className="px-3 py-2" style={{ color: 'var(--text-muted)' }}>{p.email}</td>
                <td className="px-3 py-2" style={{ color: 'var(--text-muted)' }}>{p.service ?? '—'}</td>
                <td className="px-3 py-2">
                  <span
                    className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: LEVEL_COLOR[p.level],
                      color: '#fff',
                    }}
                  >
                    {LEVEL_LABEL[p.level]}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap" style={{ color: 'var(--text)' }}>
                  {p.total_score} / {p.max_score} ({pct} %)
                </td>
                <td className="px-3 py-2 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                  {date}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
