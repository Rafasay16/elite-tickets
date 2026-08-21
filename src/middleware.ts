import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = 'elite-tickets-secret-key-super-secure';
const key = new TextEncoder().encode(secretKey);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get('session')?.value;

  let decodedToken: any = null;

  if (session) {
    try {
      const { payload } = await jwtVerify(session, key, { algorithms: ['HS256'] });
      decodedToken = payload;
    } catch (e) {
      console.error('Invalid token', e);
    }
  }

  // Proteger rotas /admin
  if (pathname.startsWith('/admin')) {
    if (!decodedToken) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (decodedToken.role !== 'ORGANIZER') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Proteger /meus-ingressos
  if (pathname.startsWith('/meus-ingressos') || pathname.startsWith('/pagamento')) {
    if (!decodedToken) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/meus-ingressos/:path*', '/pagamento/:path*'],
};
