import clientPromise from '@/app/_lib/mongodb';

export async function GET(request: Request) {
  const client = await clientPromise;
  const db = client.db();
  const productsCollection = db.collection('products');

  // Fetch the latest 5 items, sorted by descending _id
  const products = await productsCollection
    .find()
    .sort({ _id: -1 }) // Sort by _id in descending order
    .limit(5)
    .toArray();

  return Response.json(products);
}
