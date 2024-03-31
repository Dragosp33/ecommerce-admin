'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { signIn, signOut } from '@/auth';

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
import { ObjectId } from 'mongodb';
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

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function signOutAction() {
  await signOut();
}

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
    /* */ console.log('properties: ', k.data.properties);
    const client = await clientPromise;
    const db = client.db(); // Use your database name

    // Assuming you have a "categories" collection
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

    //const mergedProperties = mergeProperties(k.data);

    // db.collection('categories');

    //await categoriesCollection.insertOne({ newCategory });
    console.log('new category is::: ', newCategory);
    await categoriesCollection.insertOne(newCategory);
    //await newCategory.save();

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

    // Delete all products in this category
    await productsCollection.deleteMany(
      { category: new mongoose.Types.ObjectId(id) },
      { session }
    );

    if (!categoryToDelete) return;
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
    /* credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    }, // Load AWS access keys from environment variables
    endpoint: 'https://s3.eu-west-3.amazonaws.com',*/
  });
  let id = randomUUID();
  const uidKey = `${id}-${key}`;
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: `temporary/${uidKey}`,
  });
  if (permanentLink) {
    console.log('PERMALINK PRESENT:: ');
    const copyCommand = new CopyObjectCommand({
      Bucket: S3_BUCKET,
      CopySource: permanentLink,
      Key: `temporary/${uidKey}`,
    });
    console.log('COPY COMMAND: ', copyCommand);
    await s3Client.send(copyCommand);
  }
  let presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  let previewLink = `https://photobucket333.s3.eu-west-3.amazonaws.com/temporary/${id}-${key}`;
  let permaLink =
    permanentLink ||
    `https://photobucket333.s3.eu-west-3.amazonaws.com/permanent/${id}-${key}`;
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
    return permanetLink;
  } catch {
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
  const db = client.db(); // Use your database name

  // Assuming you have a "categories" collection
  const productsCollection = db.collection('products');

  const response = await productsCollection.insertOne(productData);
  console.log(response);
  revalidatePath('/dashboard/products');
  redirect('/dashboard/products');
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
  const db = client.db(); // Use your database name

  // Assuming you have a "categories" collection
  const productsCollection = db.collection('products');
  // productsCollection.findOneAndUpdate({ _id: id }, productData);
  const response = await productsCollection.replaceOne(
    { _id: new ObjectId(id) },
    productData
  );
  console.log(response);
  revalidatePath('/dashboard/products');
  redirect('/dashboard/products');
}
