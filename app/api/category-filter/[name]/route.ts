import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import clientPromise from '@/app/_lib/mongodb';
import { Category } from '@/app/_lib/definitions';

export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  const { name } = params;
  //console.log(name);
  // Connect to MongoDB
  try {
    const client = await clientPromise;
    const db = client.db();
    const categories = await db
      .collection('categories')
      .find({
        $or: [
          { name: name }, // Include the selected category
          { path: { $regex: `,${name},` } }, // Match categories whose path includes the selected category's ID
        ],
      })
      .toArray();

    // Merge properties
    const mergedProperties: Record<string, Set<string>> = {};
    let resultProperties = categories[0].properties;
    let catPath = categories[0].path || '';

    if (categories.length > 1) {
      categories.forEach((cat) => {
        //console.log('Cat: ', cat);
        // Type assertion to specify the type of cat.properties
        Object.entries(cat.properties || []).forEach(
          ([key, values]: [string, any]) => {
            if (!mergedProperties[key]) {
              mergedProperties[key] = new Set<string>();
            }
            values.forEach((value: string) => mergedProperties[key].add(value));
          }
        );
      });

      // Convert Set to Array
      resultProperties = Object.fromEntries(
        Object.entries(mergedProperties).map(([key, values]) => [
          key,
          Array.from(values),
        ])
      );
    } else {
      catPath = categories[0].path;
    }
    /*console.log({
      properties: resultProperties,
      path: catPath,
    });*/
    return NextResponse.json({ properties: resultProperties, path: catPath });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error }, { status: 404 });
  }
}
