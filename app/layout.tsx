import type { Metadata } from 'next'
import './globals.css'
import Navbar from '../components/Navbar'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

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
    const cookieStore = await cookies()
    
    const supabase = createServerComponentClient({ 
      cookies: () => cookieStore 
    })

    await supabase.auth.getSession()

    return (
      <html lang="th">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </head>
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
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body className="antialiased">
          <Navbar />
          <main>{children}</main>
        </body>
      </html>
    )
  }
}