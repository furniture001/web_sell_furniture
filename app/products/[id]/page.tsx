import { Metadata } from 'next'
import ProductDetails from './ProductDetails'

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `สินค้า - ${params.id}`,
  }
}

export default async function ProductPage({ params }: Props) {
  return (
    <ProductDetails productId={params.id} />
  )
}