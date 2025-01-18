import ProductDetails from './ProductDetails'
 
export default async function Page({
  params,
}: {
  params: { id: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  return <ProductDetails productId={params.id} />
}