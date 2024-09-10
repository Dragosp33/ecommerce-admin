import { getCategoryTree } from '@/app/_lib/data';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const k = await getCategoryTree();
  return Response.json(k);
}
