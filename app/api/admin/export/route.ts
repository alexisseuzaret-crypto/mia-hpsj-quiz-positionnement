import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase-server';

const LEVEL_LABEL: Record<string, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
};

function csvEscape(value: string | null | undefined): string {
  const s = String(value ?? '');
  if (s.includes(';') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;

  if (!token || !(await verifyAdminSession(token))) {
    return Response.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('participants')
    .select('first_name, last_name, email, service, level, total_score, max_score, completed_at')
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false });

  if (error) {
    return Response.json({ error: 'Erreur base de données' }, { status: 500 });
  }

  const BOM = '﻿';
  const SEP = ';';

  const header = ['Prénom', 'Nom', 'Email', 'Service', 'Niveau', 'Score', 'Score max', 'Pourcentage', 'Date'].join(SEP);

  const rows = (data ?? []).map((p) => {
    const pct = Math.round((p.total_score / p.max_score) * 100);
    const date = new Date(p.completed_at).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    return [
      csvEscape(p.first_name),
      csvEscape(p.last_name),
      csvEscape(p.email),
      csvEscape(p.service),
      csvEscape(LEVEL_LABEL[p.level]),
      String(p.total_score),
      String(p.max_score),
      `${pct}%`,
      csvEscape(date),
    ].join(SEP);
  });

  const csv = BOM + [header, ...rows].join('\n');

  const filename = `participants-hpsj-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
