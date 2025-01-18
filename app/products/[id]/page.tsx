import { Metadata } from 'next'
import ProductDetails from './ProductDetails'

interface PageProps {
  params: {
    id: string
  }
  searchParams: { [key: string]: string | string[] | undefined }
}

export function generateMetadata({ params }: PageProps): Metadata {
  return {
    title: `สินค้า - ${params.id}`,
  }
}

export default function ProductPage({ params, searchParams }: PageProps) {
  return <ProductDetails productId={params.id} />
}