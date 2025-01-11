'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // ดึงข้อมูล user ปัจจุบัน
    const getCurrentUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        setUser(user)
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    // เริ่มต้นดึงข้อมูล user
    getCurrentUser()

    // subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    // cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <nav className="bg-blue-600 p-4" style={{backgroundColor:"#9c6644"}}>
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-2xl font-bold">
          ร้านเฟอร์นิเจอร์
        </Link>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {/* เพิ่มลิงก์ประวัติการสั่งซื้อตรงนี้ */}
              <Link 
                href="/orders"
                className="text-white hover:text-gray-200"
              >
                ประวัติการสั่งซื้อ
              </Link>
              <span className="text-white">
                สวัสดี, {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-white hover:text-gray-200"
              >
                ออกจากระบบ
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login"
                className="text-white hover:text-gray-200"
              >
                เข้าสู่ระบบ
              </Link>
              <Link 
                href="/register"
                className="text-white hover:text-gray-200"
              >
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}