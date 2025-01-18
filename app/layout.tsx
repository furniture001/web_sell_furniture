import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '../components/Navbar'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

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
    const {
      data: { session },
    } = await supabase.auth.getSession()

    return (
      <html lang="th">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <Navbar />
          <main>{children}</main>
        </body>
      </html>
    )
  }
}