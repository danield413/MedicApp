import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Lista de rutas de autenticación (login/registro)
  const authRoutes = ['/', '/login']; 

  // 2. Si el usuario NO está autenticado (no hay token) y trata de acceder a /dashboard...
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', request.url)); // Redirige al login principal
  }

  // 3. Si el usuario SÍ está autenticado (hay token) y trata de acceder a CUALQUIER ruta de auth...
  if (token && authRoutes.includes(pathname)) {
    // Lo redirigimos al dashboard, porque ya inició sesión.
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // 4. El matcher DEBE incluir '/login' para que el middleware lo revise.
  matcher: ['/dashboard/:path*', '/', '/login'],
};