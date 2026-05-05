export const dynamic = 'force-dynamic';

import { createSupabaseAdmin } from '@/lib/supabase-server';
import DashboardClient from './DashboardClient';
import type { Participant } from '@/components/AdminTable';

async function getParticipants(): Promise<Participant[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('participants')
    .select('id, first_name, last_name, email, site, pole, service, training_format, level, total_score, max_score, completed_at')
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Participant[];
}

export default async function DashboardPage() {
  const participants = await getParticipants();
  return <DashboardClient participants={participants} />;
}
