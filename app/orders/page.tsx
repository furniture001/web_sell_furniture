'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Image from 'next/image'

interface Order {
  id: string
  quantity: number
  total_price: number
  created_at: string
  products: {
    name: string
    price: number
    image_url: string
  }
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // ย้าย fetchOrders มาเป็น useCallback เพื่อป้องกัน infinite loop
  const fetchOrders = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products (
            name,
            price,
            image_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, []) // ไม่มี dependencies เพราะไม่ได้ใช้ state หรือ props ภายใน

  // ย้าย checkUserAccess มาเป็น useCallback
  const checkUserAccess = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // ตรวจสอบว่าเป็น admin หรือไม่
      const { data: role, error: roleError } = await supabase
        .rpc('get_user_role', {
          user_id: user.id
        })

      if (roleError) {
        throw roleError
      }

      // ถ้าเป็น admin ให้ redirect ไปหน้าแรก
      if (role === 'admin') {
        router.push('/')
        return
      }

      // ถ้าไม่ใช่ admin ให้ดึงข้อมูล orders
      await fetchOrders(user.id)
      
    } catch (error) {
      console.error('Error checking access:', error instanceof Error ? error.message : 'Unknown error')
      router.push('/')
    }
  }, [router, fetchOrders]) // เพิ่ม dependencies ที่จำเป็น

  // แก้ไข useEffect ให้มี dependencies ที่ถูกต้อง
  useEffect(() => {
    checkUserAccess()
  }, [checkUserAccess])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">ประวัติการสั่งซื้อของฉัน</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <Image
                  src={order.products.image_url}
                  alt={order.products.name}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{order.products.name}</h3>
                <p className="text-gray-600">
                  จำนวน: {order.quantity} ชิ้น
                </p>
                <p className="font-bold">
                  ราคารวม: ฿{order.total_price.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  วันที่: {new Date(order.created_at).toLocaleString('th-TH')}
                </p>
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            ยังไม่มีประวัติการสั่งซื้อ
          </div>
        )}
      </div>
    </div>
  )
}