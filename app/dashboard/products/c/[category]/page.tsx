import {
  fetchFilteredProducts2,
  fetchProductPages,
  getCategoryTree,
} from '@/app/_lib/data';
import { Suspense } from 'react';
import ProductsTable from '@/app/_ui/products/table';
import Breadcrumbs from '@/app/_ui/categories/BreadCrumbs';
import { lusitana } from '@/app/_ui/fonts';
import Pagination from '@/app/_ui/categories/pagination';
import DropDownClient from '@/app/_ui/products/DropDown';
import CategoryList from '@/app/_ui/categories/CategoryList';

export default async function Products({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams: {
    query?: string;
    page?: string;
  };
}) {
  const categoryName = params.category;
  const categories = await getCategoryTree();

  console.log(searchParams.query, searchParams.page);
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  // const totalCategories = await fetchFilteredCategories(query, currentPage);

  //console.log('items based on category: ', filteredByCategory);
  const totalPages = await fetchProductPages(query, categoryName);
  console.log('totalPages now: ', totalPages);
  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between'>
        <h1 className={`${lusitana.className} text-2xl`}>{params.category}</h1>
      </div>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Products', href: '/dashboard/products' },
          {
            label: params.category,
            href: `/dashboard/products/c/${params.category}`,
            active: true,
          },
        ]}
      />

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
        <DropDownClient title={categoryName}>
          <CategoryList categories={categories} categoryName={categoryName} />
        </DropDownClient>
      </div>
      <Suspense key={query + currentPage} fallback={<p> Loading....</p>}>
        <ProductsTable
          query={query}
          currentPage={currentPage}
          category={categoryName}
        />
      </Suspense>
      <div className='mt-5 flex w-full justify-center'>
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
