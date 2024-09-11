import Image from 'next/image';
import { formatDateToLocal, formatCurrency } from '@/app/_lib/utils';
import { fetchAllOrders } from '@/app/_lib/data-orders';
import InvoiceStatus from './status';

export default async function InvoicesTable({
  currentPage,
}: {
  currentPage: number;
}) {
  const invoices = await fetchAllOrders(currentPage);

  return (
    <div className='mt-6 flow-root'>
      <div className='inline-block min-w-full align-middle'>
        <div className='rounded-lg bg-gray-50 p-2 md:pt-0'>
          <div className='md:hidden'>
            {invoices?.map((invoice: any) => (
              <div
                key={invoice._id.toString()}
                className='mb-2 w-full rounded-md bg-white p-4'
              >
                <div className='flex items-center justify-between border-b pb-4'>
                  <div>
                    <div className='mb-2 flex items-center'>
                      {invoice.userInfo.image ? (
                        <>
                          <Image
                            src={invoice.image_url}
                            className='mr-2 rounded-full'
                            width={28}
                            height={28}
                            alt={`${invoice.name}'s profile picture`}
                          />
                          <p>{invoice.name}</p>{' '}
                        </>
                      ) : (
                        <div className='w-8 h-8 mr-4 rounded-full bg-gray-300 flex items-center justify-center'>
                          {invoice.userInfo.name.at(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <p className='text-sm text-gray-500'>{invoice.email}</p>
                  </div>
                  <InvoiceStatus status={invoice.status || 'pending'} />
                </div>
                <div className='flex w-full items-center justify-between pt-4'>
                  <div>
                    <p className='text-xl font-medium'>
                      {formatCurrency(invoice.amountSubTotal * 100)}
                    </p>
                    <p>{formatDateToLocal(invoice.createdAt)}</p>
                  </div>
                  <div className='flex justify-end gap-2'>
                    {/*  <UpdateInvoice id={invoice.id} />
                    <DeleteInvoice id={invoice.id} /> */}
                    #
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className='hidden min-w-full text-gray-900 md:table'>
            <thead className='rounded-lg text-left text-sm font-normal'>
              <tr>
                <th scope='col' className='px-4 py-5 font-medium sm:pl-6'>
                  Customer
                </th>
                <th scope='col' className='px-3 py-5 font-medium'>
                  Email
                </th>
                <th scope='col' className='px-3 py-5 font-medium'>
                  Amount
                </th>
                <th scope='col' className='px-3 py-5 font-medium'>
                  Date
                </th>
                <th scope='col' className='px-3 py-5 font-medium'>
                  Status
                </th>
                <th scope='col' className='py-3 pl-6 pr-3'>
                  Order #
                </th>
              </tr>
            </thead>
            <tbody className='bg-white'>
              {invoices?.map((invoice: any) => (
                <tr
                  key={invoice._id.toString()}
                  className='w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg'
                >
                  <td className='whitespace-nowrap py-3 pl-6 pr-3'>
                    <div className='flex items-center gap-3'>
                      {invoice.userInfo.image ? (
                        <>
                          <Image
                            src={invoice.image_url}
                            className='mr-2 rounded-full'
                            width={28}
                            height={28}
                            alt={`${invoice.name}'s profile picture`}
                          />
                          <p>{invoice.name}</p>{' '}
                        </>
                      ) : (
                        <div className='w-8 h-8 mr-4 rounded-full bg-gray-300 flex items-center justify-center'>
                          {invoice.userInfo.name.at(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-3 py-3'>
                    {invoice.userInfo.email}
                  </td>
                  <td className='whitespace-nowrap px-3 py-3'>
                    {formatCurrency(invoice.amountSubTotal * 100)}
                  </td>
                  <td className='whitespace-nowrap px-3 py-3'>
                    {formatDateToLocal(invoice.createdAt)}
                  </td>
                  <td className='whitespace-nowrap px-3 py-3'>
                    <InvoiceStatus status={invoice.status || 'pending'} />
                  </td>
                  <td className='whitespace-nowrap py-3 pl-6 pr-3'>
                    <div className='flex'>
                      <div className='min-w-0'>
                        {/*<UpdateInvoice id={invoice.id} />
                    <DeleteInvoice id={invoice.id} /> */}
                        <p className='truncate text-sm md:text-base max-w-[100px] md:max-w[150px]'>
                          {invoice._id.toString()}
                        </p>
                      </div>
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
