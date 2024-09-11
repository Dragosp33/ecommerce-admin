import { fetchAllOrders, fetchOrdersPages } from '@/app/_lib/data-orders';
import { lusitana } from '@/app/_ui/fonts';
import Pagination from '@/app/_ui/categories/pagination';
import Search from '@/app/_ui/search';
import InvoicesTable from '@/app/_ui/orders/orders-table';
import { Suspense } from 'react';
import { InvoicesTableSkeleton } from '@/app/_ui/skeletons/skeletons';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchOrdersPages(query);
  const x = await fetchAllOrders(1);
  console.log(x);

  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between'>
        <h1 className={`${lusitana.className} text-2xl`}>Orders</h1>
      </div>
      <div className='mt-4 flex items-center justify-between gap-2 md:mt-8'>
        <Search placeholder='Search orders...' />
      </div>
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <InvoicesTable currentPage={currentPage} />
      </Suspense>
      <div className='mt-5 flex w-full justify-center'>
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
