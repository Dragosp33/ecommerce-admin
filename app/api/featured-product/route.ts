import { fetchFeaturedProduct } from '@/app/_lib/data';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  //console.log(request);
  const featProduct = await fetchFeaturedProduct();
  console.log(' FEAT PRODUCT ::: ', featProduct);

  return Response.json(featProduct);
}
