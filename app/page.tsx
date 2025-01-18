'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import ProductGrid from '../components/ProductGrid'
import { Plus } from 'lucide-react'

export default function Page() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data } = await supabase
            .rpc('get_user_role', {
              user_id: user.id
            })
          setIsAdmin(data === 'admin')
        } else {
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      }
    }

    // เรียกใช้เพียงครั้งเดียวตอน mount
    checkAdminStatus()
    fetchProducts()
  }, [])

  return (
    <main className="container mx-auto px-4 relative min-h-screen pb-16"
      style={{padding:'50px 100px 50px 100px'}}>
      <Header />
      <div className="my-8" style={{background:"#f0f0f0", padding:"10px", borderRadius:"8px", marginTop:"10px"}}>
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <ProductGrid 
            products={products} 
            isAdmin={isAdmin}
            onProductDeleted={fetchProducts} 
          />
        )}
      </div>
      
      {isAdmin && (
        <Link 
          href="/add-product"
          className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full p-4 
            shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2 z-50"
        >
          <Plus size={24} />
          <span>เพิ่มสินค้า</span>
        </Link>
      )}
    </main>
  )
}