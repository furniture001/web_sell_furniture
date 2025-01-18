import type { Metadata } from 'next'
import './globals.css'
import Navbar from '../components/Navbar'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: 'ร้านเฟอร์นิเจอร์',
  description: 'ร้านเฟอร์นิเจอร์ออนไลน์',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = createServerComponentClient({ cookies })

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