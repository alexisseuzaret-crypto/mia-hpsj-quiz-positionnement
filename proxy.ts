import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

function getSecret(): Uint8Array {
  return new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET!);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin') || pathname.startsWith('/admin/login')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('admin_session')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    await jwtVerify(token, getSecret());
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
