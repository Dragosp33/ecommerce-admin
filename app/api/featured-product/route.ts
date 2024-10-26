import { fetchFeaturedProduct } from '@/app/_lib/data';

export async function GET(request: Request) {
  //console.log(request);
  const featProduct = await fetchFeaturedProduct();

  return Response.json(featProduct);
}
