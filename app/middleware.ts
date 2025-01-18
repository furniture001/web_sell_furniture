import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  try {
    const supabase = createMiddlewareClient({ req, res })
    
    // ดึง session และรอให้เสร็จสมบูรณ์
    await supabase.auth.getSession()
    
    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return res
  }
}

// กำหนดให้ใช้ middleware กับทุก route ยกเว้น static files
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}