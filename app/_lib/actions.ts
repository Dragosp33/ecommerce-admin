'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import {
  CreateCategorySchema,
  finalForm,
  finalSubmission,
  variantFormSchema,
  Photo,
  Product,
} from '@/app/_lib/definitions';

import { CategoryModel } from '@/models/Category';
import mongoose from 'mongoose';
import clientPromise from './mongodb';
import { MongoServerError, ObjectId } from 'mongodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { String } from 'aws-sdk/clients/acm';

const S3_BUCKET = 'photobucket333';

const FormSchema = z.object({
  id: z.string(),
  name: z.string(),
  parentCategory: z
    .string({
      invalid_type_error: 'Please select a category',
    })
    .nullable()
    .optional(),
  properties: z.string(),
  /*properties2: z.array(
    z.object({ name: z.string().min(1), value: z.string().min(1) })
  ),*/
});

export const signOutAction = async (cookies: any) => {
  console.log('???', `${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/signout`);
  console.log('COOOKIESS: ', cookies);
  await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/signout`, {
    method: 'POST',
    credentials: 'include', // This includes cookies in the request
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookies,
    },
  });
};

export type CategoryState = {
  errors?: {
    name?: string[];
    parentCategory?: string[];
    properties?: string[];
  };
  message?: string | null;
};

const CreateCategory = FormSchema.omit({ id: true });

/**
 *
 * Function to merge properties into a single array
 * @param k - array of properties
 * @returns mergedProperties, map of properties, removed duplicates, split and merge for duplicate keys
 */
function mergeProperties(k: z.infer<typeof CreateCategorySchema>) {
  const mergedProperties: Record<string, string[]> = {};

  console.log(k.properties);

  k.properties.forEach((element) => {
    const { name, value } = element;
    const splitValues = value.split(/,+/);

    if (mergedProperties[name]) {
      // Merge existing values with new split values
      mergedProperties[name].push(...splitValues);
    } else {
      // Initialize with split values
      mergedProperties[name] = splitValues;
    }
  });

  // Remove duplicates from merged values
  for (const name in mergedProperties) {
    mergedProperties[name] = Array.from(new Set(mergedProperties[name]));
  }

  // Now mergedProperties contains the desired merged values
  console.log('Merged properties:', mergedProperties);
  return mergedProperties;
}

export async function saveCategory(
  formdata: z.infer<typeof CreateCategorySchema>
) {
  const result = CreateCategorySchema.safeParse(formdata);
  console.log('result: ', result);
  let k;
  if (!result.success) {
    return { success: false, error: result.error.format() };
  } else {
    k = { success: true, data: result.data };
    let parent;
    const client = await clientPromise;
    const db = client.db();
    const categoriesCollection = db.collection('categories');
    const mergedProperties = mergeProperties(k.data);
    let newCategory;
    if (k.data.parentCategory?.trim()) {
      try {
        let oid = new ObjectId(k.data.parentCategory);
        parent = await categoriesCollection.findOne({
          _id: oid,
        });
        console.log('searching for parent...');
      } catch {
        return { success: false, error: { parentCategory: 'Not found ' } };
      }
      if (parent) {
        console.log('parent found:  ', parent);
        newCategory = new CategoryModel({
          name: k.data.name,
          properties: mergedProperties || null,
          parent: parent._id,
          path: parent.path
            ? `,${parent.path.slice(1, parent.path.length - 1)},${parent.name},`
            : `,${parent.name},`,
        });
      }
    } else {
      console.log('NO PARENT FOUND.');
      newCategory = new CategoryModel({
        name: k.data.name,
        properties: mergedProperties || null,
        path: null,
      });
    }

    console.log('new category is::: ', newCategory);
    await categoriesCollection.insertOne(newCategory);
    revalidatePath('/dashboard/categories');
    redirect('/dashboard/categories');
  }
}

export async function updateCategory(
  id: string,
  formdata: z.infer<typeof CreateCategorySchema>
) {
  const result = CreateCategorySchema.safeParse(formdata);
  console.log('result: ', result);
  let k;
  if (!result.success) {
    return { success: false, error: result.error.format() };
  } else {
    k = { success: true, data: result.data };

    const client = await clientPromise;
    const db = client.db(); // Use your database name

    // Assuming you have a "categories" collection
    const categoriesCollection = db.collection('categories');
    let parent;
    const mergedProperties = mergeProperties(k.data);

    if (k.data.parentCategory?.trim()) {
      try {
        let oid = new ObjectId(k.data.parentCategory);
        parent = await categoriesCollection.findOne({
          _id: oid,
        });
      } catch {
        return { success: false, error: { parentCategory: 'Not found ' } };
      }
    }
    await categoriesCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: k.data.name,
          properties: mergedProperties,
          parent: parent ? parent._id : undefined,
        },
      }
    );
    revalidatePath('/dashboard/categories');
    redirect('/dashboard/categories');
  }
}

/**
 * function to delete a category.
 * @param id - the id of the category to be deleted.
 *
 */
export async function deleteOneCategory(id: string) {
  const client = await clientPromise;
  const session = client.startSession(); // Start a new session for the transaction

  session.startTransaction(); // Start the transaction

  try {
    const db = client.db(); // Use your database name

    // Assuming you have a "categories" collection
    const categoriesCollection = db.collection('categories');
    const productsCollection = db.collection('products');

    // Get the category to delete
    const categoryToDelete = await categoriesCollection.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });

    if (!categoryToDelete) return;
    // Delete all products in this category
    await productsCollection.deleteMany(
      { category: new mongoose.Types.ObjectId(id) },
      { session }
    );

    // Find all categories that have the name of the deleted category in their path
    const categoriesToUpdate = await categoriesCollection
      .find({ path: new RegExp(`,${categoryToDelete.name},`, 'g') })
      .toArray();

    // For each category, check if the parent is the deleted category
    for (let category of categoriesToUpdate) {
      if (category.parent.toString() === id) {
        // If true, change path and parent to be null
        await categoriesCollection.updateOne(
          { _id: category._id },
          { $set: { parent: null, path: null } },
          { session }
        );
      } else {
        // If false, change only the path to exclude the name of the deleted category
        let newPath = category.path.replace(`,${categoryToDelete.name},`, ',');
        await categoriesCollection.updateOne(
          { _id: category._id },
          { $set: { path: newPath } },
          { session }
        );
      }
    }

    // Delete the category
    await categoriesCollection.deleteOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { session }
    );

    await session.commitTransaction(); // Commit the transaction
  } catch (error) {
    console.error('Error processing transaction', error);
    session.abortTransaction(); // Abort the transaction
  } finally {
    session.endSession(); // End the session
    revalidatePath('/dashboard/categories');
    redirect('/dashboard/categories');
  }
}

// ===================================================================================================
// =============================  PRODUCTS ACTIONS ===================================================
// These functions refer to actions needed for products operations ( e.g. inserting a new product)
// ===================================================================================================

/**
 * Function to get a presignedUrl with a client - aws s3 for file uploads
 * Used for creating and editing products photos, if the permanent link is already there,
 * The permaLink is not updated.
 *
 * @param key - string, key of the file
 * @param permanentLink - optional, string, link of the permanent location
 * @returns link to aws s3 bucket object to upload the file to, and a permanent link too.
 */
export async function createPresignedUrlWithClient(
  key: string,
  permanentLink?: string
) {
  const s3Client = new S3Client({
    region: process.env.AWS_REGION, // Read from environment variable
  });
  let id = randomUUID();
  const uidKey = `${id}-${key}`;
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: `temporary/${uidKey}`,
  });
  if (permanentLink) {
    const copyCommand = new CopyObjectCommand({
      Bucket: S3_BUCKET,
      CopySource: permanentLink,
      Key: `temporary/${uidKey}`,
    });
    await s3Client.send(copyCommand);
  }
  let presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  let previewLink = `${process.env.AWS_ENDPOINT}/temporary/${id}-${key}`;
  let permaLink =
    permanentLink || `${process.env.AWS_ENDPOINT}/permanent/${id}-${key}`;
  return { presignedUrl, previewLink, uidKey, permaLink };
}

/**
 * moves a file from the temporary folder to the permanent folder
 * it deletes the file from temporary.
 * @param key - key of the file
 * @param permaLink - optional, string. The permanent location of the file, if already available.
 * @returns `permanentLink` string
 */
export async function moveToPermanentFolder(key: string, permaLink?: string) {
  try {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
    });

    // Copy the object to the 'permanent' folder
    //let id = randomUUID();
    let keyFromPermaLink = permaLink?.split('/').pop();
    const copyCommand = new CopyObjectCommand({
      Bucket: S3_BUCKET,
      CopySource: `${S3_BUCKET}/temporary/${key}`,

      Key: keyFromPermaLink
        ? `permanent/${keyFromPermaLink}`
        : `permanent/${key}`,
    });
    await s3Client.send(copyCommand);

    // Delete the object from the 'temporary' folder
    const deleteCommand = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: `temporary/${key}`,
    });
    await s3Client.send(deleteCommand);
    let permanetLink =
      permaLink ||
      `https://photobucket333.s3.eu-west-3.amazonaws.com/permanent/${key}`;
    console.log('successfully copied: ', key);
    return permanetLink;
  } catch (error) {
    console.log('error at key: ', key);
    console.log(error);
    throw new Error(`could not update key=${key}`);
  }
}

/**
 * updates a file from the temporary folder.
 * it uses a S3 client with S3.PutObjectCommand
 * @param key - key of the file
 * @param link - presigned s3 link of the S3 temporary file
 * @param File - file to be put in the s3 link
 * @returns `error` or `message: 'uploaded'` string
 * @example
 * const { presignedUrl, previewLink, uidKey, permaLink } = await createPresignedUrlWithClient('some_key');
 * UpdatePhoto(presignedUrl, uidKey, newFile);
 */
export async function UpdatePhoto(link: string, key: string, file: File) {
  try {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
    });

    const putCommand = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: file,
    });

    await s3Client.send(putCommand);
  } catch (error) {
    console.log(error);
    return { error: "sorry, couldn't upload" };
  }
  return { message: 'uploaded!' };
}

/**
 * Function to move all photos from the temporary folder to permanent.
 * @param photos - photos to be moved to permanent folder;
 */
export async function MoveAllPhotos(photos: Photo[]) {
  const promises = photos.map((photo) =>
    moveToPermanentFolder(photo.altText, photo.permaLink)
  );
  await Promise.all(promises);
  revalidatePath('/dashboard/products');
  redirect('/dashboard/products');
}

/**
 * Inserts a new Product with all its specified variants in the Product collection.
 * @param data - data that represents the product with all its variants
 * @returns
 */
export async function CreateProduct(data: finalSubmission) {
  const result = variantFormSchema.safeParse(data);
  if (!result.success) {
    return result.error;
  }
  const parsedData = result.data;
  const productData = {
    ...data,
    category: new ObjectId(data.category), // Convert string to ObjectId
    variants: parsedData.variants,
  };
  console.log('product to be added to db: ', productData);
  const client = await clientPromise;
  const db = client.db();

  // Assuming you have a "categories" collection
  const productsCollection = db.collection('products');

  const response = await productsCollection.insertOne(productData);
  console.log(response);
  revalidatePath('/dashboard/products');
  redirect('/dashboard/products');
}

/**
 * Function to add a product to the database. It also updates the category properties if needed,
 * or modify the properties input of the product. For example, if the product has
 * `color:Blue` , but the category had `Color:BLUE`, then the product property will be set to `Color:BLUE`.
 *
 * Otherwise, if the category doesn't have the property `color` or the value `Blue` present,
 * the property with the respective value (`color:Blue`) will be added to the category.
 * @param data - finalSubmission - product data, including name, categoryId, properties and variants.
 * @returns
 */
export async function addProduct(data: finalSubmission) {
  const result = variantFormSchema.safeParse(data);
  if (!result.success) {
    return result.error;
  }
  const parsedData = result.data;
  const productData = {
    ...data,
    category: new ObjectId(data.category), // Convert string to ObjectId
    variants: parsedData.variants,
  };
  console.log('product to be added to db: ', productData);
  const client = await clientPromise;
  const db = client.db();

  // Assuming you have a "categories" collection
  const productsCollection = db.collection('products');
  const categoryCollection = db.collection('categories');

  const session = client.startSession();
  session.startTransaction();

  try {
    // Fetch the category by ID
    const categoryId = productData.category;
    const category = await categoryCollection.findOne(
      { _id: categoryId },
      { session }
    );

    if (!category) {
      throw new Error('Category not found');
    }

    // Check and update category properties
    let categoryUpdated = false;
    const categoryProperties = category.properties || {};

    // Normalize category property keys and their values to lowercase for comparison
    const normalizedCategoryProperties: Record<string, string[]> =
      Object.fromEntries(
        Object.entries(categoryProperties).map(
          ([key, values]: [string, any]) => [
            key.toLowerCase(), // Convert key to lowercase
            (values as string[]).map((value) => value.toLowerCase()), // Convert each value to lowercase and use an array
          ]
        )
      );

    /*console.log('NORMALIZE WORKS::::::::::::::::::::::::::::');
    console.log(normalizedCategoryProperties);*/

    const keys: Record<string, string> = Object.fromEntries(
      Object.entries(categoryProperties).map(([key, _]: [string, any]) => [
        key.toLowerCase(), // Convert key to lowercase
        key, // Convert values to lowercase and use Set for fast lookups
      ])
    );

    /*console.log('KEY WORKS::::::::::::::::::::::::::::');
    console.log(keys);*/
    const copyProductProperties = productData.properties;

    for (const [property, values] of Object.entries(productData.properties)) {
      const normalizedProperty = property.toLowerCase(); // Convert property to lowercase

      if (!normalizedCategoryProperties[normalizedProperty]) {
        // If the property is missing (case-insensitively), add it to the category
        categoryProperties[property] = [
          ...new Set(values.map((value) => value)),
        ];
        categoryUpdated = true;
      } else {
        // If the property exists, check for missing values
        const originalKey = keys[normalizedProperty];
        delete copyProductProperties[property];
        copyProductProperties[originalKey] = [];

        values.forEach((v) => {
          //if(categoryProperties[originalKey].findIndex)
          const loweredValue = v.toLowerCase();
          const idx = normalizedCategoryProperties[
            normalizedProperty
          ].findIndex((value) => {
            return value.toLowerCase() === loweredValue;
          });
          if (idx !== -1) {
            copyProductProperties[originalKey].push(
              categoryProperties[originalKey].at(idx)
            );
          } else {
            categoryProperties[originalKey].push(v);
            copyProductProperties[originalKey].push(v);
            categoryUpdated = true;
          }
        });
      }
    }

    // Update the category if it was modified
    if (categoryUpdated) {
      //console.log('CATEGORY    IN UPDATEEE::: ');
      //console.log(category);

      await categoryCollection.updateOne(
        { _id: categoryId },
        { $set: { properties: categoryProperties } },
        { session }
      );
    }

    console.log('PROPERTIES: ');
    console.log({ categoryProperties }, { copyProductProperties });
    console.log('====================================================');

    productData.properties = copyProductProperties;
    // Save the new product
    await productsCollection.insertOne(productData, { session });

    await session.commitTransaction();
    console.log('Product added successfully and category updated');
  } catch (error) {
    await session.abortTransaction();
    console.error('Error adding product:', error);

    if (error instanceof MongoServerError && error.code === 11000) {
      // Use a regular expression to extract the SKU from the error message
      const skuMatch = error.message.match(
        /dup key: { variants.SKU: "(.*?)" }/
      );
      const duplicateSKU = skuMatch ? skuMatch[1] : null;

      console.error(
        `Duplicate key error: A product with SKU "${duplicateSKU}" already exists.`
      );

      const index = productData.variants.findIndex(
        (x) => x.SKU === duplicateSKU
      );
      console.log('INDEX FOUND: ', index);

      throw new Error(
        JSON.stringify({ message: 'SKU-duplicate', index: index })
      );
    }
  } finally {
    session.endSession();
  }
}

/**
 * Deletes one product including all its variants from the database.
 * @param id - the id of the product that will be deleted;
 */
export async function deleteOneProduct(id: String) {
  const client = await clientPromise;
  const db = client.db(); // Use your database name

  // Assuming you have a "categories" collection
  const productsCollection = db.collection('products');
  const response = await productsCollection.deleteOne({
    _id: new ObjectId(id),
  });
  console.log(response);
  revalidatePath('/dashboard/products');
}

export async function EditProduct(id: String, data: finalSubmission) {
  const result = variantFormSchema.safeParse(data);
  if (!result.success) {
    return result.error;
  }
  const parsedData = result.data;
  const productData = {
    ...data,
    category: new ObjectId(data.category), // Convert string to ObjectId
    variants: parsedData.variants,
  };
  console.log('product to be added to db: ', productData);
  const client = await clientPromise;
  const db = client.db();

  const productsCollection = db.collection('products');

  const response = await productsCollection.replaceOne(
    { _id: new ObjectId(id) },
    productData
  );
  console.log(response);
  /*revalidatePath('/dashboard/products');
  redirect('/dashboard/products');*/
}

export async function ReplaceFeaturedProduct(SKU: string, id: string) {
  const client = await clientPromise; // Assume clientPromise is the MongoDB client connection
  const db = client.db();

  // Step 1: Unset the existing featured variant
  await db.collection('products').updateOne(
    { 'variants.featured': true }, // Find the product with the currently featured variant
    { $set: { 'variants.$[elem].featured': false } }, // Unset the `featured` flag for that variant
    { arrayFilters: [{ 'elem.featured': true }] } // Use arrayFilters to target only the featured variant
  );

  // Step 2: Set the new variant as featured
  await db.collection('products').updateOne(
    { _id: new mongoose.Types.ObjectId(id), 'variants.SKU': SKU }, // Find the product by id and the variant by SKU
    { $set: { 'variants.$.featured': true } } // Set the `featured` flag for the matching variant
  );
  revalidatePath(`/dashboard/products/${id}`);
  redirect(`/dashboard/products/${id}`);
}
