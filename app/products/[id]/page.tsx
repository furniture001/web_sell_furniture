import { Metadata } from 'next'
import ProductDetails from './ProductDetails'

interface SearchParams {
  [key: string]: string | string[] | undefined
}

interface PageProps<T extends Record<string, unknown>, S extends SearchParams = SearchParams> {
  params: T
  searchParams: S
}

interface ProductPageParams {
  id: string
}

export async function generateMetadata({ 
  params 
}: PageProps<ProductPageParams>): Promise<Metadata> {
  return {
    title: `สินค้า - ${params.id}`,
  }
}

export default function ProductPage({ 
  params 
}: PageProps<ProductPageParams>) {
  return <ProductDetails productId={params.id} />
}