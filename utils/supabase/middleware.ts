import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // === LOGIC BARU ===

  // 1. KONDISI: User BELUM Login (!user)
  if (!user) {
    // Kita cek path saat ini.
    // Izinkan lewat JIKA:
    // a. Sedang di halaman login
    // b. ATAU Sedang di halaman root '/' (Landing Page)
    if (
        !request.nextUrl.pathname.startsWith('/login') && 
        request.nextUrl.pathname !== '/'
    ) {
      // Jika bukan keduanya, tendang ke login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 2. KONDISI: User SUDAH Login (user)
  if (user) {
    // Jika user iseng buka halaman Login lagi, lempar ke POS
    if (request.nextUrl.pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/pos', request.url))
    }
    
    // Opsi Tambahan: Jika user buka Landing Page ('/') tapi sudah login,
    // apakah mau dilempar ke POS atau dibiarkan lihat Landing Page?
    // Jika ingin auto-redirect ke POS (lebih cepat buat kasir), uncomment baris di bawah:
    
    // if (request.nextUrl.pathname === '/') {
    //   return NextResponse.redirect(new URL('/pos', request.url))
    // }
  }

  return response
}