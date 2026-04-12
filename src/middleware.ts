import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/saved', '/profile', '/my-recipes', '/dashboard']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Chỉ bảo vệ protected routes, không redirect login/register
  const pathname = request.nextUrl.pathname
  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))

  if (isProtected) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Kiểm tra ban — dùng admin client để bypass RLS
    const { createClient: createAdmin } = await import('@supabase/supabase-js')
    const adminClient = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data: profile } = await adminClient
      .from('users').select('banned_until').eq('id', user.id).single()

    if (profile?.banned_until && new Date(profile.banned_until) > new Date()) {
      // Đăng xuất và redirect về trang báo bị ban
      await supabase.auth.signOut()
      const bannedUrl = new URL('/banned', request.url)
      return NextResponse.redirect(bannedUrl)
    }
  } else {
    // Với các route khác chỉ refresh session token, không block
    await supabase.auth.getSession()
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
