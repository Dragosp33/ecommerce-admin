import { unstable_noStore } from 'next/cache';
import clientPromise from './mongodb';
import { Category, CategoryField, Product } from '@/app/_lib/definitions';
import mongoose from 'mongoose';
import { CategoryModel } from '@/models/Category';
import { ProductModel } from '@/models/Product';
import { replaceIdDoc } from './utils';

const ITEMS_PER_PAGE = 3;
/**
 * Function to fetch a page of categories,
 * it only fetches @constant ITEMS_PER_PAGE number of items
 * based on the @param query searched and @param currentPage - the page you are on
 */
export async function fetchFilteredCategories2(
  query: string,
  currentPage: number
): Promise<Category[]> {
  unstable_noStore();
  if (process.env.MONGODB_URI) {
    // try here

    await mongoose.connect(process.env.MONGODB_URI);
    const categories = await CategoryModel.find({
      name: { $regex: query, $options: 'i' },
    })
      .populate('parent')
      .sort('name')
      .skip((currentPage - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    console.log('categories::: ', categories);
    //console.log('tojson start:');
    const ret: Category[] = categories.map((k) =>
      JSON.parse(JSON.stringify(k))
    );
    // categories.forEach((k) => console.log(k.toJSON()));
    //console.log('tojson end');
    return ret;
    //return categories;
  }
  return [];
}

export async function fetchCategoryById(id: string) {
  unstable_noStore();
  console.log(id, typeof id);
  if (process.env.MONGODB_URI) {
    // try here

    await mongoose.connect(process.env.MONGODB_URI);
    try {
      const category = await CategoryModel.findById(id).populate(
        'parent',
        'name'
      );
      const propertiesFormatted = [];
      console.log('CATEGORY IN FINDBYID', category);

      if (category.properties) {
        for (const [key, value] of Object.entries<String[]>(
          category.properties
        )) {
          console.log(`${key}: ${value}`);
          propertiesFormatted.push({
            name: key,
            value: value.join(','),
          });
        }
      }
      console.log('FORMATED PROPRIETIS', propertiesFormatted);
      const k = {
        id: category._id.toString(),
        name: category.name,
        properties: propertiesFormatted,
        path: category.path,
        parent: category.parent
          ? {
              name: category.parent.name,
              id: category.parent._id.toString(),
            }
          : undefined,
      };
      return k;
    } catch (error) {
      console.error(error);
      return;
    }
  }
  return;
}

export async function fetchFilteredCategories(
  query: string,
  currentPage: number
) {
  unstable_noStore();
  try {
    const client = await clientPromise;
    const db = client.db(); // Use your database name

    // Assuming you have an "invoices" collection
    const invoicesCollection = db.collection('categories');

    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    // Aggregation pipeline to filter and paginate results
    const pipeline = [
      {
        $match: {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            /*{ 'customers.email': { $regex: query, $options: 'i' } },
            { 'invoices.amount': { $regex: query, $options: 'i' } },
            { 'invoices.date': { $regex: query, $options: 'i' } },
            { 'invoices.status': { $regex: query, $options: 'i' } },*/
          ],
        },
      },
      { $sort: { name: 1 } },
      { $skip: offset },
      { $limit: ITEMS_PER_PAGE },
    ];

    const invoices = await invoicesCollection.aggregate(pipeline).toArray();
    console.log('invoices: ', invoices);
    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch categories.');
  }
}

export async function fetchCategoriesPages(query: string) {
  try {
    const client = await clientPromise;
    const db = client.db(); // Use your database name

    const count = await db.collection('categories').countDocuments({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        /*
          { 'parentCategory': { $regex: query, $options: 'i' } },
          { 'invoices.amount': { $regex: query, $options: 'i' } },
          { 'invoices.date': { $regex: query, $options: 'i' } },
          { 'invoices.status': { $regex: query, $options: 'i' } },
            */
      ],
    });

    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of categories.');
  }
}

export async function isAdmin(email: string) {
  const client = await clientPromise;
  const db = client.db(); // Use your database name

  // Assuming you have an "invoices" collection
  const userinfo = await db.collection('userinfos').findOne({ email: email });
  if (!userinfo || !userinfo.admin) {
    return false;
  }
  return true;
}

export async function fetchAllCategories() {
  unstable_noStore();
  try {
    const client = await clientPromise;
    const db = client.db(); // Use your database name

    // Assuming you have an "invoices" collection
    const categoriesCollection = db.collection('categories');
    const categories = await categoriesCollection.find({}).toArray();
    const formattedCategories: CategoryField[] = categories.map((doc) => ({
      id: doc._id.toString(), // Convert ObjectId to string
      name: doc.name,
    }));
    return formattedCategories;
  } catch (error) {
    console.log(error);
    return [];
  }
}

interface HierarchicalCategory {
  id: string;
  name: string;
  parent?: HierarchicalCategory;
  subcategories: HierarchicalCategory[];
}

function buildTree(category: any): any {
  const newNode: any = {
    id: category._id.toString(),
    name: category.name,
    subcategories: [],
  };

  if (category.parent) {
    newNode.subcategories.push(buildTree(category.parent));
  }

  return newNode;
}

async function filterCategories(): Promise<any[]> {
  try {
    const categories = await CategoryModel.find({}).lean(); // Retrieve all categories

    // Define a recursive function to build the hierarchical tree

    const filteredCategories = categories
      .filter((category: any) => category.parent) // Filter out root categories
      .map(buildTree); // Build the hierarchical tree for each category

    console.log(filteredCategories); // Adjust output as needed
    return filteredCategories;
  } catch (error) {
    console.error('Error filtering categories:', error);
    return [];
  }
}

/**
 *
 * @param name - name of the category to search for products.
 * @returns array of products ( together with variants) .
 */
export async function getItemsBasedOnCategory(name: string) {
  const client = await clientPromise;
  const db = client.db();
  const regex = new RegExp(`,${name},`, 'i'); // Create a regex from the name
  console.log(regex);
  const x = await db
    .collection('categories')
    .aggregate([
      {
        $match: {
          $or: [
            { path: regex }, // Find categories with "name" in their path
            { name: new RegExp(name, 'i') }, // Or categories with "name" equal to the name parameter
          ],
        },
      },
      {
        $lookup: {
          from: 'products', // Replace with your actual items collection name
          localField: '_id',
          foreignField: 'category',
          as: 'items',
        },
      },
      {
        $unwind: '$items',
      },
      /*{
        $project: {
          id: '$items._id',
          title: '$items.title',
        },
      },*/
    ])
    .toArray();

  // Transform the result to match the format of ProductModel.find().populate('category')
  const transformedResult = x.map((item) => ({
    properties: item.items.properties,
    title: item.items.title,
    category: {
      name: item.name,
      parent: item.parent.toString(),
      properties: item.properties,
      path: item.path,
      id: item._id.toString(),
    },
    variants: item.items.variants,
    id: item.items._id.toString(),
  }));
  console.log('transformedrESULT = ', transformedResult);
  /*const ret: Product[] = x.map((k) => JSON.parse(JSON.stringify(k)));
  console.log('ret: ', ret);
  console.log('direct stringify : ', JSON.stringify(x));*/
  return x;
}

export async function getCategoryTree() {
  unstable_noStore();
  if (process.env.MONGODB_URI) {
    // try here

    await mongoose.connect(process.env.MONGODB_URI);
    // Fetch categories from MongoDB (customize this query as needed)
    const categories = await CategoryModel.find({}).exec();

    // Transform data into a nested structure (parse path, link parent-child)
    const transformedCategories = categories.map((category) => ({
      ...category.toObject(),
      children: categories.filter(
        (child) => child.parent?._id.toString() === category._id.toString()
      ),
    }));
    console.log('TRANSFORMED CATEGORIES IN CAT TREE', transformedCategories);
    return transformedCategories;
  }
  return [];
}

export async function getAllProducts() {
  const client = await clientPromise;
  const db = client.db();
  const productsCollection = db.collection('products');
  // Fetch categories from MongoDB (customize this query as needed)
  const products = await productsCollection.find({}).toArray();
  return products;
}

export async function fetchProductPages(
  query: string,
  category?: string
): Promise<number> {
  console.log('CATEGORY AND QUERY: ', category, query);
  try {
    const client = await clientPromise;
    const db = client.db(); // Use your database name

    let matchCondition;
    matchCondition = { title: { $regex: query, $options: 'i' } };

    if (category) {
      // If a category is provided, find the category ID and add it to the match condition
      matchCondition = { 'items.title': { $regex: query, $options: 'i' } };
      console.log('MATCHING IS: ', matchCondition);
      const regex = new RegExp(`,${category},`, 'i'); // Create a regex from the category
      const categories = await db
        .collection('categories')
        .aggregate([
          {
            $match: {
              $or: [
                { path: regex }, // Find categories with "name" in their path
                { name: new RegExp(category, 'i') }, // Or categories with "name" equal to the category parameter
              ],
            },
          },
          {
            $lookup: {
              from: 'products', // Replace with your actual items collection name
              localField: '_id',
              foreignField: 'category',
              as: 'items',
            },
          },
          {
            $match: matchCondition,
          },
          {
            $unwind: '$items',
          },
          {
            $count: 'total',
          },
        ])
        .toArray();

      const count = categories[0]?.total || 0;
      const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
      console.log('returned max of ', totalPages);
      return totalPages;
    }

    const count = await db
      .collection('products')
      .countDocuments(matchCondition);

    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    console.log('returned max of : ', totalPages);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of products.');
  }
}

/**
 * Function to fetch a page of categories,
 * it only fetches @constant ITEMS_PER_PAGE number of items
 * based on the @param query searched and @param currentPage - the page you are on
 */
export async function fetchFilteredProducts(
  query: string,
  currentPage: number
): Promise<Product[]> {
  unstable_noStore();
  if (process.env.MONGODB_URI) {
    // try here

    await mongoose.connect(process.env.MONGODB_URI);
    const products = await ProductModel.find({
      title: { $regex: query, $options: 'i' },
    })
      .populate('category')
      .sort('name')
      .skip((currentPage - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    console.log('categories::: ', products);
    //console.log('tojson start:');
    const ret: Product[] = products.map((k) => JSON.parse(JSON.stringify(k)));
    // categories.forEach((k) => console.log(k.toJSON()));
    //console.log('tojson end');
    return ret;
    //return categories;
  }
  return [];
}

/**
 * Function to fetch a page of categories,
 * it only fetches @constant ITEMS_PER_PAGE number of items
 * based on the @param query searched and @param currentPage - the page you are on
 * and @param category if available, to filter by category.
 */
export async function fetchFilteredProducts2(
  query: string,
  currentPage: number,
  category?: string
): Promise<Product[]> {
  unstable_noStore();
  const client = await clientPromise;
  const db = client.db();
  const productsCollection = db.collection('products');

  if (process.env.MONGODB_URI) {
    // try here
    await mongoose.connect(process.env.MONGODB_URI);
    let products;
    if (category) {
      // If a category is provided, filter products based on the category and the query + page
      const regex = new RegExp(`,${category},`, 'i'); // Create a regex from the category
      products = await productsCollection
        .aggregate([
          {
            $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'category',
            },
          },
          { $unwind: '$category' },
          {
            $match: {
              $and: [
                {
                  $or: [
                    { 'category.path': regex }, // Find products with "category" in their path
                    { 'category.name': new RegExp(category, 'i') }, // Or products with "category" equal to the category parameter
                  ],
                },
                { title: { $regex: query, $options: 'i' } }, // And products with "title" matching the query
              ],
            },
          },
          { $sort: { name: 1 } },
          { $skip: (currentPage - 1) * ITEMS_PER_PAGE },
          { $limit: ITEMS_PER_PAGE },
        ])
        .toArray();
      products = products.map((item) => ({
        properties: item.properties,
        title: item.title,
        category: {
          name: item.category.name,
          parent: item.category.parent.toString(),
          properties: item.properties,
          path: item.path,
          id: item.category._id.toString(),
        },
        variants: item.variants,
        id: item._id.toString(),
      }));
    } else {
      // If no category is provided, filter products based on the query and page only
      products = await ProductModel.find({
        title: { $regex: query, $options: 'i' },
      })
        .populate('category')
        .sort('name')
        .skip((currentPage - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    }
    console.log('products::: ', products);
    const ret: Product[] = products.map((k) => JSON.parse(JSON.stringify(k)));
    return ret;
  }
  return [];
}

export async function fetchFeaturedProduct() {
  const client = await clientPromise;
  const db = client.db(); // Use your database name
  const featuredVariant = await db
    .collection('products')
    .aggregate([
      {
        $match: {
          'variants.featured': true,
        },
      },
      {
        $project: {
          title: 1, // Include the main product title
          variants: {
            $filter: {
              input: '$variants',
              as: 'variant',
              cond: { $eq: ['$$variant.featured', true] },
            },
          },
        },
      },
    ])
    .toArray();

  // Now `featuredVariant` contains an array with the featured variant(s)
  console.log(featuredVariant[0]); // If you expect only one featured variant
  return replaceIdDoc(featuredVariant[0]);
}

export async function getProductById(id: string) {
  if (!id) {
    return null;
  }
  unstable_noStore();
  try {
    const client = await clientPromise;
    const db = client.db().collection('products');

    const product = await db.findOne({ _id: new mongoose.Types.ObjectId(id) });
    return product;
  } catch {
    return null;
  }
}
