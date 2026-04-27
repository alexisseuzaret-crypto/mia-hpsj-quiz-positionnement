'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import AdminTableHead from './AdminTableHead';
import type { Filters } from './AdminFilters';

export type Participant = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  service: string | null;
  training_format: 'presentiel' | 'distanciel' | 'indifferent' | null;
  level: 'debutant' | 'intermediaire' | 'avance';
  total_score: number;
  max_score: number;
  completed_at: string;
};

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

type Props = {
  participants: Participant[];
  filters: Filters;
};

export default function AdminTable({ participants, filters }: Props) {
  const router = useRouter();

  const handleDelete = async (p: Participant) => {
    const confirmed = window.confirm(
      `Supprimer définitivement ${p.first_name} ${p.last_name} (${p.email}) ? Cette action est irréversible.`
    );
    if (!confirmed) return;

    const res = await fetch('/api/admin/delete-participant', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({})) as { error?: string };
      alert(data.error ?? 'Erreur lors de la suppression');
    }
  };

  const filtered = participants.filter((p) => {
    if (filters.level !== 'all' && p.level !== filters.level) return false;
    if (filters.format !== 'all' && p.training_format !== filters.format) return false;
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
                <td className="px-3 py-2" style={{ color: 'var(--text-muted)' }}>
                  {FORMAT_LABEL[p.training_format ?? ''] ?? '—'}
                </td>
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
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => handleDelete(p)}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors"
                    style={{ color: '#EF4444' }}
                    title="Supprimer ce participant"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Supprimer
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
