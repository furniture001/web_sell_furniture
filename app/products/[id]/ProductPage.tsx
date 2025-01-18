import { Metadata } from 'next'
import ProductDetails from './ProductDetails'

type PageProps = {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `สินค้า - ${params.id}`,
  }
}

export default async function ProductPage({ params }: PageProps) {
  return <ProductDetails productId={params.id} />
}