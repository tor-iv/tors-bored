import { NextRequest, NextResponse } from 'next/server';

const VALID_THEMES = ['y2k', 'receipt'] as const;
type Theme = typeof VALID_THEMES[number];

export function middleware(request: NextRequest) {
  // Redirect /gallery → /browse
  if (request.nextUrl.pathname === '/gallery') {
    const browseUrl = request.nextUrl.clone();
    browseUrl.pathname = '/browse';
    return NextResponse.redirect(browseUrl, { status: 301 });
  }

  const cookieTheme = request.cookies.get('theme')?.value as Theme | undefined;
  const isValidTheme = cookieTheme && (VALID_THEMES as readonly string[]).includes(cookieTheme);

  if (isValidTheme) {
    return NextResponse.next();
  }

  // First visit or invalid cookie: pick random theme
  const theme = VALID_THEMES[Math.floor(Math.random() * VALID_THEMES.length)];

  // Forward the chosen theme to the RSC layout via a request header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-theme', theme);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Set the cookie on the response so subsequent requests have it
  response.cookies.set('theme', theme, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
