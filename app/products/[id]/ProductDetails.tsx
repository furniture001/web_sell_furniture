'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  image_url: string
}

interface Props {
  productId: string
}

export default function ProductDetails({ productId }: Props) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProduct()
  }, [productId])  // เพิ่ม dependency productId

  const fetchProduct = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (error) {
        throw error
      }

      setProduct(data)
      setQuantity(1)
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message)
        setError('ไม่สามารถโหลดข้อมูลสินค้าได้')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBuy = async () => {
    if (!product) return

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        alert('กรุณาเข้าสู่ระบบก่อนซื้อสินค้า')
        router.push('/login')
        return
      }
  
      setBuying(true)
  
      // ตรวจสอบสต็อกล่าสุด
      const { data: currentProduct, error: stockError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', productId)
        .single()
  
      if (stockError) throw stockError
  
      if (!currentProduct) {
        alert('ไม่พบข้อมูลสินค้า')
        return
      }
  
      if (currentProduct.stock < quantity) {
        alert(`สินค้าคงเหลือไม่เพียงพอ (เหลือ ${currentProduct.stock} ชิ้น)`)
        await fetchProduct()
        return
      }
  
      // อัพเดทสต็อก
      const newStock = currentProduct.stock - quantity
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId)
  
      if (updateError) throw updateError
  
      // บันทึกคำสั่งซื้อ
      const { error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          product_id: productId,
          quantity: quantity,
          total_price: product.price * quantity
        }])
  
      if (orderError) throw orderError
  
      alert('สั่งซื้อสำเร็จ')
      router.push('/orders')
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error purchasing:', error.message)
      }
      alert('เกิดข้อผิดพลาดในการสั่งซื้อ')
    } finally {
      setBuying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">ไม่พบสินค้า</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{paddingLeft:"150px", paddingRight:"150px"}}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative h-[400px]">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="rounded-lg shadow-lg object-cover"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <p className="text-2xl font-bold mb-4">฿{product.price.toLocaleString()}</p>
          <p className="text-gray-500 mb-4">
            สินค้าคงเหลือ: <span className={product.stock < 10 ? 'text-red-500' : ''}>{product.stock}</span>
          </p>

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

          <div className="text-xl font-bold mb-6">
            ราคารวม: ฿{(product.price * quantity).toLocaleString()}
          </div>

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