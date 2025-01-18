import type { Metadata } from 'next'
import './globals.css'
import Navbar from '../components/Navbar'
import { createServerClient } from '@supabase/ssr'
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
    const cookieStore = cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value ?? ''
          },
          set(name: string, value: string, options: any) {
            try {
              return cookieStore.set(name, value, options)
            } catch {
              return false
            }
          },
          remove(name: string, options: any) {
            try {
              return cookieStore.delete(name, options)
            } catch {
              return false
            }
          },
        },
      }
    )

    const session = await supabase.auth.getSession()

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