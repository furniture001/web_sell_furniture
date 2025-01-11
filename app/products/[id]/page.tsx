'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  image_url: string
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setProduct(data)
      // รีเซ็ตจำนวนเป็น 1 เมื่อโหลดสินค้าใหม่
      setQuantity(1)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBuy = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('กรุณาเข้าสู่ระบบก่อนซื้อสินค้า')
        router.push('/login')
        return
      }
  
      if (!product) return
  
      setBuying(true)
  
      // 1. ตรวจสอบจำนวนสินค้าคงเหลือล่าสุด
      const { data: currentProduct, error: stockError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', params.id)
        .single()
  
      if (stockError) {
        throw stockError
      }
  
      if (!currentProduct) {
        alert('ไม่พบข้อมูลสินค้า')
        return
      }
  
      if (currentProduct.stock < quantity) {
        alert(`สินค้าคงเหลือไม่เพียงพอ (เหลือ ${currentProduct.stock} ชิ้น)`)
        await fetchProduct() // รีโหลดข้อมูลสินค้าใหม่
        return
      }
  
      // 2. อัพเดทจำนวนสินค้า
      const newStock = currentProduct.stock - quantity
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', params.id)
  
      if (updateError) throw updateError
  
      // 3. บันทึกประวัติการสั่งซื้อ
      const { error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            product_id: params.id,
            quantity: quantity,
            total_price: product.price * quantity
          }
        ])
  
      if (orderError) throw orderError
  
      // 4. ดึงข้อมูลสินค้าใหม่เพื่ออัพเดทหน้าจอ
      await fetchProduct()
  
      alert('สั่งซื้อสำเร็จ')
      router.push('/orders')
      
    } catch (error: any) {
      console.error('Error:', error)
      alert('เกิดข้อผิดพลาดในการสั่งซื้อ: ' + error.message)
    } finally {
      setBuying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen" >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8" >
        <div className="text-center text-gray-500">ไม่พบสินค้า</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{paddingLeft:"150px", paddingRight:"150px"}}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* รูปสินค้า */}
        <div>
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        {/* ข้อมูลสินค้า */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <p className="text-2xl font-bold mb-4">฿{product.price.toLocaleString()}</p>
          <p className="text-gray-500 mb-4">
            สินค้าคงเหลือ: <span className={product.stock < 10 ? 'text-red-500' : ''}>{product.stock}</span>
          </p>

          {/* เลือกจำนวน */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">จำนวน:</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                className="px-3 py-1 border rounded hover:bg-gray-100"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                className="w-20 p-2 border rounded focus:ring-2 focus:ring-blue-500 text-center"
              />
              <button
                onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                className="px-3 py-1 border rounded hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* ราคารวม */}
          <div className="text-xl font-bold mb-6">
            ราคารวม: ฿{(product.price * quantity).toLocaleString()}
          </div>

          {/* ปุ่มซื้อ */}
          <button
            onClick={handleBuy}
            disabled={buying || product.stock === 0}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium
              ${product.stock === 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'} 
              transition-colors disabled:opacity-50`}
          >
            {product.stock === 0 
              ? 'สินค้าหมด' 
              : buying 
                ? 'กำลังดำเนินการ...' 
                : 'ซื้อเลย'}
          </button>
        </div>
      </div>
    </div>
  )
}