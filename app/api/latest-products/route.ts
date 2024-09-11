import clientPromise from '@/app/_lib/mongodb';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const client = await clientPromise;
  const db = client.db();
  const productsCollection = db.collection('products');

  const searchParams = request.nextUrl.searchParams;
  const parsedProperties = Object.fromEntries(searchParams.entries());
  let limit = 5;
  if (parsedProperties['limit']) {
    limit = Number(parsedProperties[limit]) || 5;
  }

  // Fetch the latest 5 items, sorted by descending _id
  const products = await productsCollection
    .find()
    .sort({ _id: -1 }) // Sort by _id in descending order
    .limit(limit)
    .toArray();

  return Response.json(products);
}
