'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminFilters, { type Filters } from '@/components/AdminFilters';
import AdminTable, { type Participant } from '@/components/AdminTable';
import { Button } from '@/components/ui/button';

type Props = {
  participants: Participant[];
};

export default function DashboardClient({ participants }: Props) {
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>({ level: 'all', format: 'all' });

  const filtered = participants.filter((p) => {
    if (filters.level !== 'all' && p.level !== filters.level) return false;
    if (filters.format !== 'all' && p.training_format !== filters.format) return false;
    return true;
  });

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      {/* Header admin */}
      <div style={{ background: 'var(--background)', borderBottom: '1px solid var(--surface)' }}>
        <div
          className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between"
        >
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
              Dashboard — Quiz Copilot Chat
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Hôpitaux Paris Saint-Joseph
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/stats"
              className="text-sm px-3 py-1.5 rounded-lg border cursor-pointer"
              style={{ borderColor: 'var(--surface)', color: 'var(--text)' }}
            >
              Statistiques →
            </Link>
            <a
              href="/api/admin/export"
              className="text-sm px-3 py-1.5 rounded-lg border cursor-pointer"
              style={{ borderColor: 'var(--surface)', color: 'var(--text)' }}
            >
              Exporter CSV
            </a>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="cursor-pointer text-sm"
            >
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">
        <AdminFilters
          filters={filters}
          onChange={setFilters}
          total={participants.length}
          filtered={filtered.length}
        />
        <AdminTable participants={participants} filters={filters} />
      </div>
    </div>
  );
}
