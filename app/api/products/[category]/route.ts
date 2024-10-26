import clientPromise from '@/app/_lib/mongodb';
import mongoose from 'mongoose';
import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { category: string } }
) {
  const { category } = params;
  const searchParams = req.nextUrl.searchParams;
  console.log(searchParams);
  console.log(category);
  // Initialize filters object
  const filters: Record<string, string[]> = {};

  // Iterate through search params and collect all filters
  searchParams.forEach((value, key) => {
    if (key !== 'id') {
      filters[key] = value.split(/[;,]/); // Split each filter by comma or semicolon to handle multiple values
    }
  });

  // Construct MongoDB query
  const queryFilters = Object.entries(filters).map(([key, values]) => {
    return { [`variants.properties.${key}`]: { $in: values } };
  });
  console.log(queryFilters);
  // Construct MongoDB query for matching variants
  /*const variantFilters = Object.entries(filters).map(([key, values]) => {
    return { [`properties.${key}`]: { $in: values } };
  });*/
  /*const query = {
    category: new mongoose.Types.ObjectId(category), // Match the category ID
    $or: queryFilters, // Apply property filters
  };*/
  // Construct MongoDB filter for variants
  const variantFilters = Object.entries(filters).map(([key, values]) => {
    return { $in: [`$$variant.properties.${key}`, values] }; // Match properties within the variant
  });

  const query = {
    category: new mongoose.Types.ObjectId(category), // Match the category ID
    variants: {
      $elemMatch: {
        $and: variantFilters, // Apply all property filters to find matching variants
      },
    },
  };
  console.log(variantFilters);
  console.log(query);
  const client = await clientPromise;
  const db = client.db();
  // Use aggregation to filter variants and include product _id
  const p = await db
    .collection('products')
    .aggregate([
      {
        $match: {
          category: new mongoose.Types.ObjectId(category), // Match the category ID
        },
      },
      {
        $addFields: {
          matchedVariants: {
            $map: {
              input: {
                $filter: {
                  input: '$variants',
                  as: 'variant',
                  cond: { $and: variantFilters }, // Apply all property filters to find matching variants
                },
              },
              as: 'matchedVariant',
              in: {
                $mergeObjects: [
                  '$$matchedVariant', // Include all fields from the matched variant
                  { productId: '$_id' }, // Add the product _id to each matched variant
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          matchedVariants: 1, // Only include the matched variants with the product _id
        },
      },
      {
        $unwind: '$matchedVariants', // Unwind to return each matched variant as a separate document
      },
    ])
    .toArray();

  return Response.json({
    matchedVariants: p.map((product) => product.matchedVariants),
  });
}
