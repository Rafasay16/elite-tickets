import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'fallback_secret_123';
const key = new TextEncoder().encode(secretKey);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  let decodedToken: any = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
      decodedToken = payload;
    } catch (e) {
      console.error('Invalid token', e);
    }
  }

  // Se for organizador mas estiver inativo (suspenso)
  if (decodedToken && decodedToken.role === 'ORGANIZER' && decodedToken.isActive === false) {
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/login?error=suspended', req.url));
    }
  }

  // Proteger rotas /super-admin
  if (pathname.startsWith('/super-admin')) {
    if (!decodedToken) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (decodedToken.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
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
  matcher: ['/admin/:path*', '/super-admin/:path*', '/meus-ingressos/:path*', '/pagamento/:path*'],
};
