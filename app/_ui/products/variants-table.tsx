'use client';

import Link from 'next/link';
import { Button } from '../button';
import Image from 'next/image';
import { ReplaceFeaturedProduct } from '@/app/_lib/actions';
import { lusitana } from '../fonts';

export default function variantsTable({
  variants,
  productId,
}: {
  variants: any[];
  productId: string;
}) {
  return (
    <div className='mt-6 flow-root'>
      <div className='inline-block min-w-full align-middle'>
        <div className='rounded-lg bg-gray-100 p-2 md:pt-0'>
          <div className='md:hidden'>
            {variants.length === 0 && (
              <p>Sorry, no variants were founded for this item</p>
            )}
            {variants?.map((variant: any) => (
              <div
                key={variant.SKU.toString()}
                className='mb-3 w-full rounded-md bg-white p-4'
              >
                <div className='flex items-center justify-between border-b pb-4'>
                  <div>
                    <div className='mb-2 flex items-center h-28 w-28 rounded-full'>
                      {variant.thumbnail && (
                        <Image
                          width={200}
                          height={200}
                          src={variant.thumbnail}
                          alt={variant.SKU}
                          className='object-contain'
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className='text-lg font-medium'>{variant.title}</p>
                  </div>
                  <div className='flex justify-end gap-2'>
                    {/*<UpdateInvoice id={product.id} />
                    <DeleteInvoice id={product.id} /> 
                    <UpdateElement
                      link={`/dashboard/products/${product.id}/edit`}
                      id={product.id.toString()}
                    />
                    <AlertButton product={product} />*/}
                    aici buton
                  </div>
                </div>
                <div className='flex w-full items-center justify-between pt-4'>
                  <div>
                    {variant.price && (
                      <p className='text-lg font-small'>$ {variant.price}</p>
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/dashboard/products`}
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

          <table className='hidden min-w-full text-gray-900 md:table w-full'>
            <thead className='rounded-lg text-left text-sm font-normal'>
              <tr>
                <th scope='col' className='px-3 py-5 font-medium sm:pl-6'>
                  Thumbnail
                </th>
                <th scope='col' className='px-3 py-5 font-medium'>
                  Title
                </th>
                <th scope='col' className='px-3 py-5 font-medium'>
                  Price
                </th>
                <th scope='col' className='relative py-2 pl-2 pr-3'>
                  <span className='sr-only'>Featured action</span>
                </th>
              </tr>
            </thead>
            <tbody className='bg-white'>
              {variants?.map((variant) => (
                <tr
                  key={variant.SKU.toString()}
                  className='w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg'
                >
                  <td>
                    <div className='mb-2 flex items-center h-32 w-32 rounded-full'>
                      {variant.thumbnail && (
                        <Image
                          width={200}
                          height={200}
                          src={variant.thumbnail}
                          alt={variant.SKU}
                          className='object-contain'
                        />
                      )}
                    </div>
                  </td>
                  <td className=' py-3 pl-6 pr-3'>
                    <div className='flex items-center gap-3'>
                      <p>{variant.title}</p>
                    </div>
                  </td>

                  <td className='whitespace-nowrap px-3 py-3'>
                    {variant.price ? (
                      <div>
                        <p className='text-sm text-emerald-500'>
                          $ {variant.price}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className='text-lg font-small'>...</p>
                      </div>
                    )}
                  </td>
                  {/*<td className='whitespace-nowrap py-3 pl-6 pr-3'>
                    <Link
                      href={`/dashboard/products/${product.id}`}
                      className='hover:text-sky-400'
                    >
                      <EyeIcon className='w-5 ' />
                    </Link>
                  </td>*/}
                  <td className='whitespace-nowrap py-3 pl-6 pr-3'>
                    <div className='flex justify-end gap-3'>
                      {variant.featured ? (
                        <div
                          className={`${lusitana.className} bg-violet-500 text-white p-2 text-sm rounded-lg`}
                        >
                          {' '}
                          featured{' '}
                        </div>
                      ) : (
                        <Button
                          onClick={() =>
                            ReplaceFeaturedProduct(variant.SKU, productId)
                          }
                        >
                          feat this
                        </Button>
                      )}
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
