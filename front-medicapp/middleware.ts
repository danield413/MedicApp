// En middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  let role: string | undefined;
  if (token) {
    try {
      // Intentar decodificar el token para ver el rol (sin verificar la firma)
      const payloadBase64 = token.split('.')[1];
      const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
      role = JSON.parse(payloadJson)?.role;
    } catch (e) {
      // Token inválido o corrupto, tratar como si no hubiera token
      role = undefined;
    }
  }

  // --- Rutas de Autenticación de Usuario ---
  const authRoutes = ['/', '/login', '/register']; 
  if (token && role === 'Usuario' && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // --- Rutas de Autenticación de Domiciliario ---
  const domiLoginRoute = '/domiciliario/login';
  if (token && role === 'Domiciliario' && pathname === domiLoginRoute) {
    return NextResponse.redirect(new URL('/domiciliario/dashboard', request.url));
  }
  if (!token && pathname.startsWith('/domiciliario/dashboard')) {
     return NextResponse.redirect(new URL(domiLoginRoute, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/', 
    '/login', 
    '/register', 
    '/dashboard/:path*', 
    '/domiciliario/login', 
    '/domiciliario/dashboard/:path*'
  ],
};