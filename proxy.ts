// proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Define which roles can access which route prefixes
const rolePermissions: Record<string, Array<'admin' | 'bursar' | 'teacher'>> = {
  '/admin': ['admin'],
  '/bursar': ['admin', 'bursar'],
  '/teacher': ['admin', 'teacher'],
}

export async function proxy(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Determine which permission rule applies
  let allowedRoles: Array<'admin' | 'bursar' | 'teacher'> | null = null

  for (const [path, roles] of Object.entries(rolePermissions)) {
    if (req.nextUrl.pathname.startsWith(path)) {
      allowedRoles = roles
      break
    }
  }

  // If this route is protected
  if (allowedRoles) {
    // Not authenticated → login
    if (!user) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Authenticated but role not allowed → unauthorized
    const userRole = user.user_metadata?.role as
      | 'admin'
      | 'bursar'
      | 'teacher'
      | undefined

    if (!userRole || !allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/bursar/:path*',
    '/teacher/:path*',
  ],
}
