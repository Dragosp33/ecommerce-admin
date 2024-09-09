import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import clientPromise from '@/app/_lib/mongodb';

export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  let { name } = params;
  name = decodeURIComponent(name);
  const searchParams = req.nextUrl.searchParams;

  console.log('SEARCH PARAMS IN API ::::: ', searchParams);

  // Initialize filters object
  const filters: Record<string, string[]> = {};

  // Iterate through search params and collect all filters
  searchParams.forEach((value, key) => {
    if (key !== 'id') {
      filters[key] = value.split(/[;,]/); // Split each filter by comma or semicolon to handle multiple values
    }
  });

  // Construct MongoDB filter for variants
  const variantFilters = Object.entries(filters).map(([key, values]) => {
    return { $in: [`$$variant.properties.${key}`, values] }; // Match properties within the variant
  });

  // Connect to MongoDB
  const client = await clientPromise;
  const db = client.db();

  // Step 1: Find the path of the selected category
  const category = await db.collection('categories').findOne({ name: name });

  console.log({ category });
  if (!category) {
    return NextResponse.json({ matchedVariants: [] }); // If the category is not found, return an empty response
  }

  // Step 2: Find all categories that are descendants of the selected category
  const categories = await db
    .collection('categories')
    .find({
      $or: [
        { name: name }, // Include the selected category
        { path: { $regex: `,${category.name},` } }, // Match categories whose path includes the selected category's ID
      ],
    })
    .toArray();

  // Step 3: Construct an array of all category IDs to match against
  const categoryIds = categories.map((cat) => cat._id);

  // Step 4: Use aggregation to filter variants and include product _id
  const products = await db
    .collection('products')
    .aggregate([
      {
        $match: {
          category: { $in: categoryIds }, // Match all products from the selected category and its descendants
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

  console.log(products);
  return NextResponse.json({
    matchedVariants: products.map((product) => product.matchedVariants),
  });
}
