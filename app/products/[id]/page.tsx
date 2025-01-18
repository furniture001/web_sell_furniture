// pages/products/[id]/page.tsx

import ProductDetails from './ProductDetails'

interface Props {
  params: {
    id: string
  }
}

export default function ProductPage({ params }: Props) {
  return <ProductDetails productId={params.id} />
}