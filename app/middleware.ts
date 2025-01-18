import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// กำหนด type สำหรับ cookie options
interface CookieOptions {
  name: string
  value: string
  maxAge?: number
  httpOnly?: boolean
  secure?: boolean
  path?: string
  domain?: string
  sameSite?: 'lax' | 'strict' | 'none'
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // รับค่า cookie
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        // ตั้งค่า cookie
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        // ลบ cookie
        remove(name: string, options: CookieOptions) {
          response.cookies.delete({
            name,
            ...options,
          })
        },
      },
    }
  )

  await supabase.auth.getSession()
  return response
}

// กำหนดเส้นทางที่ต้องการให้ middleware ทำงาน
export const config = {
  matcher: [
    // ยกเว้นไฟล์ static และรูปภาพ
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}