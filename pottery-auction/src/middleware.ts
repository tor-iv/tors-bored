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

  // Default to the "receipt" aesthetic, but honor a valid theme cookie so the
  // Y2K / Win98 theme stays available as a fallback via the theme toggle.
  const cookieTheme = request.cookies.get('theme')?.value as Theme | undefined;
  const isValidTheme = cookieTheme && (VALID_THEMES as readonly string[]).includes(cookieTheme);

  const theme: Theme = isValidTheme ? cookieTheme : 'receipt';

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-theme', theme);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (!isValidTheme) {
    response.cookies.set('theme', theme, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
