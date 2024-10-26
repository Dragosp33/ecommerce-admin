import { NextRequest, NextResponse } from 'next/server';
import { fetchFilteredProducts2 } from '@/app/_lib/data';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  //console.log(url.searchParams);

  const query = url.searchParams.get('query') || '';
  const currentPage = url.searchParams.get('page') || '1';
  const category = url.searchParams.get('category') || '';

  console.log({ query }, { currentPage }, { category });

  const products = await fetchFilteredProducts2(
    query || '',
    Number(currentPage) || 1,
    category
  );
  return products
    ? NextResponse.json(products)
    : NextResponse.json({ error: 'Product not found' }, { status: 404 });
}
