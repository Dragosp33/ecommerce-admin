import { getBestSellersInfo } from '@/app/_lib/experimental-data';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parsedProperties = Object.fromEntries(searchParams.entries());
  let limit = 5;
  if (parsedProperties['limit']) {
    limit = Number(parsedProperties[limit]) || 5;
  }

  const bestProducts = await getBestSellersInfo(limit);
  if (!bestProducts || bestProducts.length === 0) {
    return Response.json([]);
  }
  return Response.json([...bestProducts]);
}
