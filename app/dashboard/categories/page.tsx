import { fetchCategoriesPages } from '@/app/_lib/data';

import CategoriesTable from '@/app/_ui/categories/table';
import { Suspense } from 'react';

import { lusitana } from '@/app/_ui/fonts';
import Pagination from '@/app/_ui/categories/pagination';
import Search from '@/app/_ui/search';
import { LinkToCreate } from '@/app/_ui/categories/buttons';

async function categories({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  // const totalCategories = await fetchFilteredCategories(query, currentPage);
  const totalPages = await fetchCategoriesPages(query);
  // console.log('========total categories========', totalCategories);
  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between'>
        <h1 className={`${lusitana.className} text-2xl`}>Categories</h1>
      </div>
      <div className='mt-4 flex items-center justify-between gap-2 md:mt-8'>
        <Search placeholder='Search categories...' />
        <LinkToCreate
          link={'/dashboard/categories/create'}
          text={'Create category'}
        />
      </div>

      <Suspense key={query + currentPage} fallback={<p> Loading....</p>}>
        <CategoriesTable query={query} currentPage={currentPage} />
      </Suspense>
      <div className='mt-5 flex w-full justify-center'>
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}

export default categories;
