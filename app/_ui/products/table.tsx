import { fetchFilteredProducts, fetchFilteredProducts2 } from '@/app/_lib/data';

import { UpdateElement } from '@/app/_ui/categories/buttons';

import AlertButton from '@/app/_ui/products/alert-button';
import { Product } from '@/app/_lib/definitions';
import Link from 'next/link';
import { EyeIcon } from '@heroicons/react/24/outline';

export default async function ProductsTable({
  query,
  currentPage,
  category,
}: {
  query: string;
  currentPage: number;
  category?: string;
}) {
  const products: Product[] = await fetchFilteredProducts2(
    query,
    currentPage,
    category
  );
  console.log('filtered: ', products);

  return (
    <div className='mt-6 flow-root'>
      <div className='inline-block min-w-full align-middle'>
        <div className='rounded-lg bg-gray-100 p-2 md:pt-0'>
          <div className='md:hidden'>
            {products?.map((product) => (
              <div
                key={product.id.toString()}
                className='mb-3 w-full rounded-md bg-white p-4'
              >
                <div className='flex items-center justify-between border-b pb-4'>
                  <div>
                    <div className='mb-2 flex items-center '>
                      <p className='text-xl font-medium'>{product.title}</p>
                    </div>
                  </div>
                  <div className='flex justify-end gap-2'>
                    {/*<UpdateInvoice id={product.id} />
                    <DeleteInvoice id={product.id} /> */}
                    <UpdateElement
                      link={`/dashboard/products/${product.id}/edit`}
                      id={product.id.toString()}
                    />
                    <AlertButton product={product} />
                  </div>
                </div>
                <div className='flex w-full items-center justify-between pt-4'>
                  <div>
                    {product.category && (
                      <p className='text-lg font-small'>
                        category: {product.category.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/dashboard/products/${product.id}/variants`}
                      className='no-underline hover:underline text-sky-600'
                    >
                      {' '}
                      see variants{' '}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className='hidden min-w-full text-gray-900 md:table'>
            <thead className='rounded-lg text-left text-sm font-normal'>
              <tr>
                <th scope='col' className='px-4 py-5 font-medium sm:pl-6'>
                  Title
                </th>
                <th scope='col' className='px-3 py-5 font-medium'>
                  Category
                </th>
                <th scope='col' className='px-3 py-5 font-medium'>
                  Variants
                </th>
                {/* }
                <th scope='col' className='px-3 py-5 font-medium'>
                  Date
                </th>
                <th scope='col' className='px-3 py-5 font-medium'>
                  Status
                </th> */}
                <th scope='col' className='relative py-3 pl-6 pr-3'>
                  <span className='sr-only'>Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className='bg-white'>
              {products?.map((product) => (
                <tr
                  key={product.id.toString()}
                  className='w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg'
                >
                  <td className='whitespace-nowrap py-3 pl-6 pr-3'>
                    <div className='flex items-center gap-3'>
                      <p>{product.title}</p>
                    </div>
                  </td>

                  <td className='whitespace-nowrap px-3 py-3'>
                    {product.category ? (
                      <div>
                        <p className='text-lg font-small'>
                          {product.category.name}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className='text-lg font-small'>Main product.</p>
                      </div>
                    )}
                  </td>
                  <td className='whitespace-nowrap py-3 pl-6 pr-3'>
                    <Link
                      href={`/dashboard/products/${product.id}/variants`}
                      className='hover:text-sky-400'
                    >
                      <EyeIcon className='w-5 ' />
                    </Link>
                  </td>
                  <td className='whitespace-nowrap py-3 pl-6 pr-3'>
                    <div className='flex justify-end gap-3'>
                      <UpdateElement
                        id={product.id.toString()}
                        link={`/dashboard/products/${product.id}/edit`}
                      />
                      <AlertButton product={product} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
