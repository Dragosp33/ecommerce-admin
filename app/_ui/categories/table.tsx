import { fetchFilteredCategories2 } from '@/app/_lib/data';

import { UpdateElement } from './buttons';

import AlertButton from '@/app/_ui/categories/alert-button';
import { Category } from '@/app/_lib/definitions';

export default async function CategoriesTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const categories: Category[] = await fetchFilteredCategories2(
    query,
    currentPage
  );
  console.log('filtered: ', categories);

  return (
    <div className='mt-6 flow-root'>
      <div className='inline-block min-w-full align-middle'>
        <div className='rounded-lg bg-gray-100 p-2 md:pt-0'>
          <div className='md:hidden'>
            {categories?.map((category) => (
              <div
                key={category.id.toString()}
                className='mb-3 w-full rounded-md bg-white p-4'
              >
                <div className='flex items-center justify-between border-b pb-4'>
                  <div>
                    <div className='mb-2 flex items-center '>
                      <p className='text-xl font-medium'>{category.name}</p>
                    </div>
                  </div>
                  <div className='flex justify-end gap-2'>
                    {/*<UpdateInvoice id={category.id} />
                    <DeleteInvoice id={category.id} /> */}
                    <UpdateElement
                      link={`/dashboard/categories/${category.id}/edit`}
                      id={category.id.toString()}
                    />
                    <AlertButton category={category} />
                  </div>
                </div>
                <div className='flex w-full items-center justify-between pt-4'>
                  {category.parent && (
                    <div>
                      <p className='text-lg font-small'>
                        parent: {category.parent.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <table className='hidden min-w-full text-gray-900 md:table'>
            <thead className='rounded-lg text-left text-sm font-normal'>
              <tr>
                <th scope='col' className='px-4 py-5 font-medium sm:pl-6'>
                  Category
                </th>
                <th scope='col' className='px-3 py-5 font-medium'>
                  Parent Category
                </th>
                {/* }  <th scope='col' className='px-3 py-5 font-medium'>
                  Amount
                </th>
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
              {categories?.map((category) => (
                <tr
                  key={category.id.toString()}
                  className='w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg'
                >
                  <td className='whitespace-nowrap py-3 pl-6 pr-3'>
                    <div className='flex items-center gap-3'>
                      <p>{category.name}</p>
                    </div>
                  </td>

                  <td className='whitespace-nowrap px-3 py-3'>
                    {category.parent ? (
                      <div>
                        <p className='text-lg font-small'>
                          {category.parent.name}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className='text-lg font-small'>Main category.</p>
                      </div>
                    )}
                  </td>
                  <td className='whitespace-nowrap py-3 pl-6 pr-3'>
                    <div className='flex justify-end gap-3'>
                      <UpdateElement
                        id={category.id.toString()}
                        link={`/dashboard/categories/${category.id}/edit`}
                      />
                      <AlertButton category={category} />
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
