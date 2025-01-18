'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import type { Product } from '../../types'
import Image from 'next/image'

export default function AddProduct() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'created_at' | 'image_url'>>({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
  })

  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:', userError)
        return
      }
      
      if (user) {
        const { data, error: roleError } = await supabase
          .rpc('get_user_role', {
            user_id: user.id
          })
  
        if (roleError) {
          console.error('เกิดข้อผิดพลาดในการดึง role:', roleError)
          return
        }
  
        setIsAdmin(data === 'admin')
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('เกิดข้อผิดพลาดในการตรวจสอบสถานะ admin:', error.message)
      }
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    
    const file = e.target.files[0]
    if (!file.type.startsWith('image/')) {
      setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
      return
    }

    setImageFile(file)
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
  }

  const validateForm = () => {
    if (!formData.name || !formData.description || !formData.price || 
        !formData.stock || !formData.category) {
      setError('กรุณากรอกข้อมูลให้ครบทุกช่อง')
      return false
    }

    if (!imageFile) {
      setError('กรุณาเลือกรูปภาพสินค้า')
      return false
    }
    
    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      setError('ราคาต้องเป็นตัวเลขและมากกว่า 0')
      return false
    }

    if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      setError('จำนวนสินค้าต้องเป็นตัวเลขและไม่ติดลบ')
      return false
    }

    return true
  }

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAdmin) {
      setError('คุณไม่มีสิทธิ์ในการเพิ่มสินค้า')
      return
    }

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setError('')

      const imageUrl = await uploadImage(imageFile!)

      const { error: insertError } = await supabase
        .from('products')
        .insert([
          {
            name: formData.name.trim(),
            description: formData.description.trim(),
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            category: formData.category.trim(),
            image_url: imageUrl
          }
        ])

      if (insertError) throw insertError

      router.push('/')
      router.refresh()
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error adding product:', error)
        setError('เกิดข้อผิดพลาดในการเพิ่มสินค้า: ' + error.message)
      } else {
        setError('เกิดข้อผิดพลาดในการเพิ่มสินค้า')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) return null

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">เพิ่มสินค้าใหม่</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ชื่อสินค้า
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            รายละเอียด
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ราคา
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              จำนวนคงเหลือ
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              min="0"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            หมวดหมู่
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            รูปภาพสินค้า
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
          {imagePreview && (
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-1">ตัวอย่างรูปภาพ:</p>
              <div className="relative w-full h-48">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-contain rounded"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'กำลังเพิ่มสินค้า...' : 'เพิ่มสินค้า'}
        </button>
      </form>
    </div>
  )
}