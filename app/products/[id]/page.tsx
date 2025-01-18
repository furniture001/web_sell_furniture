import { Metadata } from 'next'
import ProductDetails from './ProductDetails'
import { cookies } from 'next/headers'

// เปลี่ยนเป็น Params type ตาม NextJS convention
type Params = {
  id: string;
}

// เปลี่ยนเป็น SearchParams type ตาม NextJS convention
type SearchParams = Record<string, string | string[] | undefined>

// ฟังก์ชันสำหรับดึง params ID แบบ async
async function getParamId(params: Params): Promise<string> {
  return params.id
}

// Metadata Generator
export async function generateMetadata({
  params,
}: {
  params: Params,
  searchParams: SearchParams,
}): Promise<Metadata> {
  const id = await getParamId(params)
  return {
    title: `รายละเอียดสินค้า ${id}`,
    description: `แสดงรายละเอียดสินค้ารหัส ${id}`,
  }
}

// Page Component
export default async function Page({
  params,
}: {
  params: Params,
  searchParams: SearchParams,
}) {
  await cookies()
  const id = await getParamId(params)

  return <ProductDetails productId={id} />
}

// Route Config
export const dynamic = 'force-dynamic'
export const revalidate = 0