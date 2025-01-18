'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // ดึงข้อมูล user เพียงครั้งเดียวตอน mount
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (user) {
          const { data: role } = await supabase
            .rpc('get_user_role', {
              user_id: user.id
            })
          setIsAdmin(role === 'admin')
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }
  
    getCurrentUser()
  
    // ใช้ subscription เฉพาะสำหรับการเปลี่ยนแปลงสถานะ auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsAdmin(false)
      } else if (event === 'SIGNED_IN') {
        getCurrentUser()
      }
    })
  
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setIsAdmin(false)
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
              {/* แสดงลิงก์ประวัติการสั่งซื้อเฉพาะผู้ใช้ที่ไม่ใช่ admin */}
              {!isAdmin && (
                <Link 
                  href="/orders"
                  className="text-white hover:text-gray-200"
                >
                  ประวัติการสั่งซื้อ
                </Link>
              )}
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