import { Metadata } from 'next'
import ProductDetails from './ProductDetails'

// ปรับ interface params
interface PageParams {
  id: string;
}

interface PageProps {
  params: PageParams;
  searchParams: Record<string, string | string[] | undefined>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `รายละเอียดสินค้า ${params.id}`,
    description: `แสดงรายละเอียดสินค้ารหัส ${params.id}`
  }
}

export default async function Page(props: PageProps) {
  return <ProductDetails productId={props.params.id} />
}