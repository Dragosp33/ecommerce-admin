import { unstable_noStore } from 'next/cache';
import clientPromise from './mongodb';
import { formatCurrency } from './utils';
import { Revenue } from './definitions';

export async function fetchCardData() {
  unstable_noStore();
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const client = await clientPromise;
    const db = client.db();
    const invoiceCountPromise = db.collection('orders').countDocuments();
    const customerCountPromise = db.collection('users').countDocuments({
      emailVerified: { $exists: true, $ne: null },
    });

    //const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = db
      .collection('orders')
      .aggregate([
        {
          $facet: {
            // Sub-pipeline to get total of orders with status "paid"
            paid: [
              { $match: { status: 'paid' } },
              {
                $group: {
                  _id: 'paid',
                  totalSubTotal: { $sum: '$amountSubTotal' },
                },
              },
            ],
            // Sub-pipeline to get total of orders with any other status
            notPaid: [
              { $match: { status: { $ne: 'paid' } } },
              {
                $group: {
                  _id: 'notPaid',
                  totalSubTotal: { $sum: '$amountSubTotal' },
                },
              },
            ],
          },
        },
        {
          $project: {
            paidTotal: {
              $ifNull: [{ $arrayElemAt: ['$paid.totalSubTotal', 0] }, 0],
            },
            notPaidTotal: {
              $ifNull: [{ $arrayElemAt: ['$notPaid.totalSubTotal', 0] }, 0],
            },
          },
        },
      ])
      .toArray();

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    console.log('DATAAA: ', data);

    const numberOfInvoices = Number(data[0] ?? '0');
    const numberOfCustomers = Number(data[1] ?? '0');
    const totalPaidInvoices = formatCurrency(
      Number(data[2][0].paidTotal * 100 ?? '0')
    );

    const totalPendingInvoices = formatCurrency(
      Number(data[2][0].notPaidTotal * 100 ?? '0')
    );
    console.log(
      numberOfInvoices,
      numberOfCustomers,
      totalPaidInvoices,
      totalPendingInvoices
    );
    //const numberOfInvoices = Number(data[0].rows[0].count ?? '0');
    //const numberOfCustomers = Number(data[1].rows[0].count ?? '0');
    //const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? '0');
    //const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
    //console.log(data);
  } catch (error) {
    console.error('Database Error:', error);
    return {
      numberOfCustomers: 0,
      numberOfInvoices: 0,
      totalPaidInvoices: '$0',
      totalPendingInvoices: '$0',
    };
    throw new Error('Failed to fetch card data.');
  }
}

export async function fetchRevenue(): Promise<Revenue[]> {
  const months = [
    { name: 'JAN', num: 1 },
    { name: 'FEB', num: 2 },
    { name: 'MAR', num: 3 },
    { name: 'APR', num: 4 },
    { name: 'MAY', num: 5 },
    { name: 'JUN', num: 6 },
    { name: 'JUL', num: 7 },
    { name: 'AUG', num: 8 },
    { name: 'SEP', num: 9 },
    { name: 'OCT', num: 10 },
    { name: 'NOV', num: 11 },
    { name: 'DEC', num: 12 },
  ];
  const client = await clientPromise;
  const db = client.db();
  const ordersByMonth = await db
    .collection('orders')
    .aggregate([
      {
        // Filter orders to include only those with a status of "paid"
        $match: {
          status: 'paid',
        },
      },
      {
        // Add a new field `month` extracted from the `createdAt` date
        $addFields: {
          month: { $month: '$createdAt' }, // Extracts the month (1 = January, 2 = February, etc.)
        },
      },
      {
        // Group orders by the extracted month
        $group: {
          _id: '$month', // Group by the month
          totalOrders: { $sum: 1 }, // Count the number of orders in each month
          totalSubTotal: { $sum: '$amountSubTotal' }, // Calculate the sum of `subTotal` for each month
        },
      },
      {
        // Optionally, sort by month in ascending order
        $sort: { _id: 1 },
      },
    ])
    .toArray();

  // Convert `ordersByMonth` to a lookup object for quick access
  const ordersLookup = ordersByMonth.reduce((acc, item) => {
    acc[item._id] = item.totalSubTotal; // Use `_id` (month number) as key
    return acc;
  }, {});

  // Step 3: Create the final array of Revenue objects
  const allMonthsTotals: Revenue[] = months.map((month) => ({
    month: month.name,
    revenue: ordersLookup[month.num] || 0,
  }));

  console.log(allMonthsTotals);
  return allMonthsTotals;
  // console.log(allMonthsTotals);
}

export async function fetchLatestInvoices() {
  const client = await clientPromise;
  const db = client.db();

  try {
    const recentOrdersWithUserInfo = await db
      .collection('orders')
      .aggregate([
        {
          // Sort the orders by createdAt in descending order to get the most recent ones
          $sort: { createdAt: -1 },
        },
        {
          // Limit the results to the last 5 orders
          $limit: 5,
        },
        {
          // Perform a lookup to join with the users collection based on userId
          $lookup: {
            from: 'users', // The collection to join with
            localField: 'userId', // The field from the orders collection
            foreignField: '_id', // The field from the users collection
            as: 'userInfo', // The name for the array field to add
          },
        },
        {
          // Check if userInfo array has values
          $addFields: {
            userInfoExists: { $gt: [{ $size: '$userInfo' }, 0] },
          },
        },
        {
          // Filter out orders where userInfo array is empty
          $match: {
            userInfoExists: true,
          },
        },
        {
          // Unwind the userInfo array to flatten the result
          $unwind: '$userInfo',
        },
        {
          // Project only the necessary fields
          $project: {
            _id: 1, // Order ID
            amountSubTotal: 1, // Order subtotal
            userId: 1, // User ID associated with the order
            'userInfo.name': 1, // User name
            'userInfo.email': 1, // User email
            'userInfo.image': 1, // User image
          },
        },
      ])
      .toArray();

    console.log('Recent Orders with User Info:', recentOrdersWithUserInfo);
    return recentOrdersWithUserInfo;
  } catch (error) {
    console.error('Error fetching latest invoices:', error);
    return [];
  }
}
