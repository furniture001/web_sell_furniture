// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // สร้าง supabase client พร้อม session
  const supabase = createMiddlewareClient({ req, res })

  // รีเฟรช session
  await supabase.auth.getSession()

  return res
}