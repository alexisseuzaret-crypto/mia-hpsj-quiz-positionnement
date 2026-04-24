import { NextRequest } from 'next/server';
import { z } from 'zod';
import { signAdminJwt } from '@/lib/auth';

const bodySchema = z.object({
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return Response.json({ error: 'Mot de passe requis' }, { status: 400 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error('[admin/login] ADMIN_PASSWORD non configuré');
      return Response.json({ error: 'Configuration serveur manquante' }, { status: 500 });
    }

    if (parsed.data.password !== adminPassword) {
      return Response.json({ error: 'Mot de passe incorrect' }, { status: 401 });
    }

    const token = await signAdminJwt();

    const res = Response.json({ ok: true });
    res.headers.set(
      'Set-Cookie',
      `admin_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24}`
    );
    return res;
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
