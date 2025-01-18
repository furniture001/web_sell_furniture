import type { Metadata } from 'next'
import './globals.css'
import Navbar from '../components/Navbar'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export const metadata: Metadata = {
  title: 'ร้านเฟอร์นิเจอร์',
  description: 'ร้านเฟอร์นิเจอร์ออนไลน์',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  try {
    // We only need to check if session exists, no need to use the session data
    await supabase.auth.getSession()

    return (
      <html lang="th">
        <body className="antialiased">
          <Navbar />
          <main>{children}</main>
        </body>
      </html>
    )
  } catch (error) {
    console.error('Layout error:', error)
    // ถ้าเกิดข้อผิดพลาดก็ยังแสดง UI ปกติ
    return (
      <html lang="th">
        <body className="antialiased">
          <Navbar />
          <main>{children}</main>
        </body>
      </html>
    )
  }
}