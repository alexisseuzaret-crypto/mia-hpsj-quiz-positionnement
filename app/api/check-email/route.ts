import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createSupabaseAdmin } from '@/lib/supabase-server';

const emailSchema = z.string().email().max(254);

export async function GET(request: NextRequest) {
  try {
    const raw = request.nextUrl.searchParams.get('email') ?? '';
    const parsed = emailSchema.safeParse(raw.toLowerCase().trim());

    if (!parsed.success) {
      return Response.json({ exists: false }, { headers: { 'Cache-Control': 'no-store' } });
    }

    const supabase = createSupabaseAdmin();
    const { data } = await supabase
      .from('participants')
      .select('id')
      .eq('email', parsed.data)
      .not('completed_at', 'is', null)
      .limit(1)
      .maybeSingle();

    return Response.json(
      { exists: data !== null },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return Response.json({ exists: false }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
