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
