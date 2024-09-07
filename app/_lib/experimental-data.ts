'use server';
import { Product } from './definitions';
import mongoose from 'mongoose';
/*
------------------------------------------------------------------------------------------------------------
---------------    This file includes tries and still developing methods -> not final yet. -----------------
------ For final methods ( used in the deployed app) check @/app/lib/data.ts and @app/lib/actions.ts  ------
------------------------------------------------------------------------------------------------------------
*/
import clientPromise from './mongodb';
import { ProductModel } from '@/models/Product';
import { unstable_noStore } from 'next/cache';

/**
 *
 * @param id - string of the variant, to fetch the product;
 * @returns - product, with the all variants of it
 */
export async function fetchSingleProduct(id: string) {
  //unstable_noStore();

  try {
    const client = await clientPromise;
    const db = client.db(); // Use your database name

    // Assuming you have an "invoices" collection
    const productsCollection = db.collection('products');
    const product = await productsCollection.findOne({
      variants: { $elemMatch: { SKU: id } },
    });
    const ret: Product = JSON.parse(JSON.stringify(product));
    console.log('THIS IS WHAT A FETCHSINGLEPRODUCT RETURNS: ', ret);
    return ret;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function fetchAllProducts() {
  //unstable_noStore();
  try {
    const client = await clientPromise;
    const db = client.db(); // Use your database name

    // Assuming you have an "invoices" collection
    const productsCollection = db.collection('test-products');
    const product = await productsCollection.find().toArray();
    console.log(product);
    return product;
  } catch (error) {
    console.log(error);
    return 'plm';
  }
}

export async function fetchMongoVariants(id: string) {
  const client = await clientPromise;
  const db = client.db(); // Use your database name

  // Assuming you have an "invoices" collection
  const productsCollection = db.collection('test-products');
  const result = await productsCollection
    .aggregate([
      {
        $match: {
          'variants.SKU': id,
        },
      },
      {
        $set: {
          source: {
            $filter: {
              input: '$variants',
              as: 'v',
              cond: {
                $eq: ['$$v.SKU', id],
              },
            },
          },
        },
      },
      {
        $unwind: '$source',
      },
      {
        $project: {
          results: {
            $map: {
              input: {
                $objectToArray: '$source.properties',
              },
              as: 'prop',
              in: {
                $filter: {
                  input: '$variants',
                  as: 'var',
                  cond: {
                    $in: [
                      '$$prop',
                      {
                        $objectToArray: '$$var.properties',
                      },
                    ],
                  },
                },
              },
            },
          },
          _id: 0,
        },
      },
    ])
    .toArray();

  console.log(result[0].results);
}

export async function fetchSingleProduct2(id: string) {
  unstable_noStore();
  if (process.env.MONGODB_URI) {
    // try here
    console.log('connected: ==== ');
    await mongoose.connect(process.env.MONGODB_URI);
    try {
      const ret = await ProductModel.findById(id).populate('category');
      console.log('WITH MONGOOSE: ');
      const k = JSON.parse(JSON.stringify(ret));
      console.log(k);
      return k;
    } catch (error) {
      return;
    }
  }
  return;
}

async function getBestSellersInfo() {
  const client = await clientPromise;
  const db = client.db(); // Use your database name

  const k = await db
    .collection('orders')
    .aggregate([
      // Match only paid orders
      { $match: { status: 'paid' } },

      // Unwind the products array to deconstruct it into multiple documents
      { $unwind: '$products' },

      // Group by SKU and sum the amount sold for each SKU
      {
        $group: {
          _id: '$products.SKU', // Group by SKU
          totalSold: { $sum: '$products.quantity' }, // Sum the amount field to get total quantity sold
        },
      },

      // Sort by totalSold in descending order to get the most sold SKUs at the top
      { $sort: { totalSold: -1 } },

      // Optionally, limit the results to top N most sold SKUs
      { $limit: 10 }, // Replace 10 with the desired number of results

      // Lookup the variant information from the products collection
      {
        $lookup: {
          from: 'products', // The products collection
          localField: '_id', // Field from the aggregation pipeline (SKU)
          foreignField: 'variants.SKU', // Field from the products collection
          as: 'productDetails', // Name of the output array field
        },
      },

      // Unwind the productDetails array to access the individual product documents
      { $unwind: '$productDetails' },

      // Project only the matching variant using $filter
      {
        $project: {
          //SKU: '$_id', // Include the SKU field
          _id: '$productDetails._id',
          totalSold: 1, // Include the totalSold field
          variant: {
            $arrayElemAt: [
              {
                $filter: {
                  input: '$productDetails.variants', // Array to filter
                  as: 'variant', // Alias for the array elements
                  cond: { $eq: ['$$variant.SKU', '$_id'] }, // Condition to match the SKU
                },
              },
              0,
            ],
          },
        },
      },
    ])
    .toArray();

  console.log(k);
}
