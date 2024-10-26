import clientPromise from '@/app/_lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Extract the dynamic route parameter `id` from the query
  const { id } = params;
  const searchParams = req.nextUrl.searchParams;

  console.log('Product ID:', id);
  console.log('Search Params:', searchParams);
  try {
    const client = await clientPromise;
    const db = client.db();
    if (!id) {
      return Response.json({ error: 'not found' }, { status: 404 });
    }

    /*const product = await db
      .collection('products')
      .findOne({ _id: new ObjectId(id) });*/

    const productWithCategory = await db
      .collection('products')
      .aggregate([
        {
          // Match the product by its ID
          $match: { _id: new ObjectId(id) },
        },
        {
          // Perform a lookup to join with the categories collection
          $lookup: {
            from: 'categories', // The name of the categories collection
            localField: 'category', // The field in products that references the category by ObjectId
            foreignField: '_id', // The field in categories to match with
            as: 'categoryInfo', // The name of the field in the output document where the matched categories will be stored
          },
        },
        {
          // Unwind the categoryInfo array to treat it as an object
          $unwind: {
            path: '$categoryInfo',
            preserveNullAndEmptyArrays: true, // Optional: if you want products without a category to still appear
          },
        },
        {
          // Optionally project the fields you want
          $project: {
            title: 1,
            description: 1,
            // Include other product fields as needed
            'categoryInfo.name': 1, // Include the category name
            'categoryInfo.path': 1, // Include the category path
            variants: 1,
            properties: 1,
          },
        },
      ])
      .toArray();

    // Assuming you want just the first item
    const product = productWithCategory[0];

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    searchParams.forEach((param, key) => console.log(key, param));
    console.log('Error after line 80');

    // Convert searchParams to an object for easier handling
    const parsedProperties = Object.fromEntries(searchParams.entries());
    console.log('Error after line 84');

    // Find the exact matching variant
    const exactMatch = product.variants.find((variant: any) => {
      return Object.entries(parsedProperties).every(([key, value]) => {
        return variant.properties[key] === value;
      });
    });
    console.log('Error after line 91', exactMatch);
    exactMatch.id = product._id.toString();

    if (!exactMatch) {
      return Response.json({ error: 'Variant not found' }, { status: 404 });
    }

    //console.log({ exactMatch });
    // Find related variants (differ by only one property)
    const relatedVariants = product.variants.filter((variant: any) => {
      // Count the number of differing properties
      const differingProperties = Object.entries(exactMatch.properties).filter(
        ([key, value]) => {
          return variant.properties[key] !== value;
        }
      );
      // Keep only those variants where exactly one property differs
      return differingProperties.length === 1;
    });

    console.log('Related Variants:', relatedVariants);

    const { categoryInfo } = product;
    console.log('CATEGORY: ', categoryInfo);

    return Response.json(
      { exactMatch, relatedVariants, categoryInfo },
      { status: 200 }
    );
  } catch (exception: any) {
    console.error('Exception caught:', exception);

    // Use a switch statement to handle different types of exceptions
    switch (
      exception.name // 'name' property is commonly used to identify error types
    ) {
      case 'MongoNetworkError':
        return Response.json(
          { error: 'Database connection error' },
          { status: 500 }
        );
      case 'BSONError':
        return Response.json({ error: 'Malformed ID' }, { status: 400 });
      case 'MongoParseError':
        return Response.json(
          { error: 'Database query error' },
          { status: 400 }
        );
      case 'TypeError':
        return Response.json(
          { error: 'Type error in processing data' },
          { status: 500 }
        );
      case 'SyntaxError':
        return Response.json({ error: 'JSON parsing error' }, { status: 400 });
      default:
        return Response.json(
          { error: 'Internal server error', details: exception.message },
          { status: 500 }
        );
    }
  }
  //  return Response.json({ message: 'GOODDD' });
  /*res.status(200).json({
    id,
    color,
    memory,
    material,
    size,
    allParams: searchParams,
  });*/
}
