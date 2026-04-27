import { NextRequest } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase-server';

const bodySchema = z.object({ id: z.string().uuid() });

export async function DELETE(request: NextRequest) {
  // 1. Vérif auth
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!token || !(await verifyAdminSession(token))) {
    return Response.json({ error: 'Non autorisé' }, { status: 401 });
  }

  // 2. Parse body
  const raw = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ error: 'ID invalide' }, { status: 400 });
  }

  // 3. Suppression (les réponses sont supprimées en cascade via ON DELETE CASCADE)
  const supabase = createSupabaseAdmin();
  const { error, count } = await supabase
    .from('participants')
    .delete({ count: 'exact' })
    .eq('id', parsed.data.id);

  if (error) {
    return Response.json({ error: 'Erreur base de données' }, { status: 500 });
  }
  if (count === 0) {
    return Response.json({ error: 'Participant introuvable' }, { status: 404 });
  }

  return Response.json({ success: true, deletedId: parsed.data.id });
}
