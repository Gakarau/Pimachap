import { NextRequest, NextResponse } from 'next/server'

// Routes that require an authenticated session
const WORKSPACE_PREFIXES = ['/admin', '/ops', '/compliance', '/finance', '/partner']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isWorkspace = WORKSPACE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  )

  if (!isWorkspace) {
    return NextResponse.next()
  }

  const session = request.cookies.get('pimachap_session')
  if (!session) {
    const loginUrl = new URL('/login', request.nextUrl)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/ops/:path*',
    '/compliance/:path*',
    '/finance/:path*',
    '/partner/:path*',
  ],
}
