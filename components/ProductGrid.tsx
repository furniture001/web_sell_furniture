import ProductCard from './ProductCard'

interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  category: string
  image_url: string
}

interface ProductGridProps {
  products: Product[]
  isAdmin?: boolean
  onProductDeleted?: () => void
}

export default function ProductGrid({ products, isAdmin = false, onProductDeleted }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          isAdmin={isAdmin}
          onProductDeleted={onProductDeleted}
        />
      ))}
    </div>
  )
}