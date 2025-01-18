import ProductDetails from './ProductDetails'

export default async function Page({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const { id } = await Promise.resolve(params)
  return <ProductDetails productId={id} />
}