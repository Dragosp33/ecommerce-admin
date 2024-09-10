import { fetchLatestInvoices, fetchRevenue } from '@/app/_lib/data-orders';
import CardWrapper from '@/app/_ui/dashboard/cards';
import LatestInvoices from '@/app/_ui/dashboard/latest-invoices';
import RevenueChart from '@/app/_ui/dashboard/revenue-chart';
import { lusitana } from '@/app/_ui/fonts';
import {
  CardsSkeleton,
  LatestInvoicesSkeleton,
  RevenueChartSkeleton,
} from '@/app/_ui/skeletons/skeletons';
import React, { Suspense } from 'react';

/*const page = async () => {
  const data = await fetchCardData();
  console.log('DATA', data);*/
export default async function Page() {
  //await getOrdersByMonth();
  //await fetchLatestInvoices();
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <div className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8'>
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          {/* <LatestInvoices />*/}
          <LatestInvoices />
        </Suspense>
      </div>
    </main>
  );
}

//export default page;
