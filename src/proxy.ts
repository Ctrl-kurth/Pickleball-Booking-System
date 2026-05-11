import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Check if the user is accessing the dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const adminAuth = request.cookies.get('adminAuth')?.value;

    // If there's no auth cookie, redirect to login
    if (adminAuth !== 'true') {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
