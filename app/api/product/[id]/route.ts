import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest } from 'next/server';

/*export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug; // 'a', 'b', or 'c'
}*/

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Extract the dynamic route parameter `id` from the query
  const { id } = params;
  console.log(id);

  // Extract any other query parameters
  const searchParams = req.nextUrl.searchParams;

  console.log('Product ID:', id);
  console.log('Search Params:', searchParams);

  // Example: Access specific search parameters
  /*const color = searchParams.color;
  const memory = searchParams.memory;
  const material = searchParams.material;
  const size = searchParams.size;
*/
  // Logic to handle the request based on dynamic parameters
  // ...

  // Example response
  return Response.json({ message: 'GOODDD' });
  /*res.status(200).json({
    id,
    color,
    memory,
    material,
    size,
    allParams: searchParams,
  });*/
}
