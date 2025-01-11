import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      if (!window.confirm(`ต้องการลบสินค้า "${product.name}" ใช่หรือไม่?`)) {
        return
      }

      setDeleting(true)

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

    } catch (error) {
      console.error('Error deleting product:', error)
      alert('เกิดข้อผิดพลาดในการลบสินค้า')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="border rounded-lg p-4 relative">
      {isAdmin && (
        <button onClick={handleDelete} className="absolute top-2 right-2...">
          <X size={20} />
        </button>
      )}
  
      <Link href={`/products/${product.id}`}>
        <div className="cursor-pointer">
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-48 object-cover rounded mb-4 hover:opacity-90 transition-opacity"
          />
          <h2 className="text-xl font-semibold">{product.name}</h2>
          <p className="text-gray-600 mb-2">{product.description}</p>
          <p className="text-lg font-bold">฿{product.price.toLocaleString()}</p>
          <p className="text-sm text-gray-500">สินค้าคงเหลือ: {product.stock}</p>
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1...">
            {product.category}
          </span>
        </div>
      </Link>
    </div>
  )
}