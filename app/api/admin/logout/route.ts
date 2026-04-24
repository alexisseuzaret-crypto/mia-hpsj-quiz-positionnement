export async function POST() {
  const res = Response.json({ ok: true });
  res.headers.set(
    'Set-Cookie',
    'admin_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'
  );
  return res;
}
