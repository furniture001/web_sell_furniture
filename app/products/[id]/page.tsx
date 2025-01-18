import ProductDetails from './ProductDetails'

interface PageProps {
  params: {
    id: string
  }
}

export default async function Page({ params }: PageProps) {
  return (
    <ProductDetails productId={params.id} />
  )
}