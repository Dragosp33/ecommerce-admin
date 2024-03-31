import { Metadata } from 'next';

import { fetchProductPages, getCategoryTree } from '@/app/_lib/data';
import Search from '@/app/_ui/search';
import { lusitana } from '@/app/_ui/fonts';
import { LinkToCreate } from '@/app/_ui/categories/buttons';
import Breadcrumbs from '@/app/_ui/categories/BreadCrumbs';
import ProductsTable from '@/app/_ui/products/table';
import { Suspense } from 'react';
import Pagination from '@/app/_ui/categories/pagination';

import CategoryList from '@/app/_ui/categories/CategoryList';
import DropDownClient from '@/app/_ui/products/DropDown';

import { ProductTableSkeleton } from '@/app/_ui/skeletons/skeletons';

export const metadata: Metadata = {
  title: 'Products',
};

async function Products({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const categories = await getCategoryTree();

  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchProductPages(query);

  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between'>
        <h1 className={`${lusitana.className} text-2xl`}>Products</h1>
      </div>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          {
            label: 'Products',
            href: `/dashboard/products`,
            active: true,
          },
        ]}
      />
      <div className='mt-4 flex items-center justify-between gap-2 md:mt-8'>
        <Search placeholder='Search products...' />
        <LinkToCreate
          link={'/dashboard/products/create'}
          text={'Create product'}
        />
      </div>
      <div className='mt-4 flex items-center justify-between gap-2 md:mt-8'>
        {/* <ul>
          categories.map((category) => (
            <li key={category.id}>
              <Link href={`/dashboard/products/c/${category.name}`}>
                {' '}
                {category.name}{' '}
              </Link>
            </li>
          ))
        </ul>*/}
        <DropDownClient title='Category filter'>
          <CategoryList categories={categories} />
        </DropDownClient>
      </div>

      <Suspense key={query + currentPage} fallback={<ProductTableSkeleton />}>
        <ProductsTable query={query} currentPage={currentPage} />
      </Suspense>
      <div className='mt-5 flex w-full justify-center'>
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}

export default Products;
