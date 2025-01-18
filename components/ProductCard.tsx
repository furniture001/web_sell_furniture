import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  category: string
  image_url: string
}

interface ProductCardProps {
  product: Product
  isAdmin?: boolean
  onProductDeleted?: () => void
}

export default function ProductCard({ product, isAdmin = false, onProductDeleted }: ProductCardProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    try {
      if (!window.confirm(`ต้องการลบสินค้า "${product.name}" ใช่หรือไม่?`)) {
        return
      }

      setLoading(true)

      // ลบสินค้าจาก database
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)

      if (error) throw error

      // ถ้ามีรูปภาพ ให้ลบออกจาก storage ด้วย
      if (product.image_url) {
        const imagePath = product.image_url.split('/').pop()
        if (imagePath) {
          await supabase.storage
            .from('product-images')
            .remove([imagePath])
        }
      }

      // เรียก callback เพื่ออัพเดทรายการสินค้า
      if (onProductDeleted) {
        onProductDeleted()
      }

    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error deleting product:', error.message)
        alert('เกิดข้อผิดพลาดในการลบสินค้า')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border rounded-lg p-4 relative" style={{background:"white"}}>
      {isAdmin && (
        <button 
          onClick={handleDelete}
          disabled={loading}
          className={`absolute top-2 right-2 text-gray-500 hover:text-red-500 
            transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="ลบสินค้า"
        >
          <X size={20} />
        </button>
      )}
  
      <Link href={`/products/${product.id}`}>
        <div className="cursor-pointer">
          <div className="relative w-full h-48 mb-4">
            <Image 
              src={product.image_url} 
              alt={product.name}
              fill
              className="object-cover rounded hover:opacity-90 transition-opacity"
            />
          </div>
          <h2 className="text-xl font-semibold">{product.name}</h2>
          <p className="text-gray-600 mb-2">{product.description}</p>
          <p className="text-lg font-bold">฿{product.price.toLocaleString()}</p>
          <p className="text-sm text-gray-500">สินค้าคงเหลือ: {product.stock}</p>
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm text-gray-700 mt-2">
            {product.category}
          </span>
        </div>
      </Link>
    </div>
  )
}