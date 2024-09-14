import { fetchLatestInvoices } from '@/app/_lib/data-orders';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { lusitana } from '../fonts';
import clsx from 'clsx';
import Image from 'next/image';

export default async function LatestInvoices() {
  const latestInvoices = await fetchLatestInvoices();
  const now = new Date();

  // Format the date and time
  const formattedDate = now.toLocaleDateString(); // Formats to "9/10/2024" (for example)
  const formattedTime = now.toLocaleTimeString();
  //console.log('latest invoices ', latestInvoices);
  return (
    <div className='flex w-full flex-col md:col-span-4'>
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Latest Invoices
      </h2>
      <div className='flex grow flex-col justify-between rounded-xl bg-gray-50 p-4'>
        {/* NOTE: comment in this code when you get to this point in the course */}

        <div className='bg-white px-6'>
          {latestInvoices.map((invoice, i) => {
            return (
              <div
                key={invoice._id.toString()}
                className={clsx(
                  'flex flex-row items-center justify-between py-4',
                  {
                    'border-t': i !== 0,
                  }
                )}
              >
                <div className='flex items-center'>
                  {invoice.userInfo.image ? (
                    <Image
                      src={invoice.userInfo.image}
                      alt={`${invoice.userInfo.name}'s profile picture`}
                      className='mr-4 rounded-full'
                      width={32}
                      height={32}
                    />
                  ) : (
                    <div className='w-8 h-8 mr-4 rounded-full bg-gray-300 flex items-center justify-center'>
                      {invoice.userInfo.name.at(0).toUpperCase()}
                    </div>
                  )}

                  <div className='min-w-0'>
                    <p className='truncate text-sm font-semibold md:text-base'>
                      {invoice.userInfo.name}
                    </p>
                    <p className='hidden text-sm text-gray-500 sm:block'>
                      {invoice.userInfo.email}
                    </p>
                  </div>
                </div>
                <p
                  className={`${lusitana.className} truncate text-sm font-medium md:text-base`}
                >
                  {invoice.amountSubTotal}
                </p>
              </div>
            );
          })}
        </div>
        <div className='flex items-center pb-2 pt-6'>
          <ArrowPathIcon className='h-5 w-5 text-gray-500' />
          <h3 className='ml-2 text-sm text-gray-500 '>
            Updated at: {formattedDate}, {formattedTime}{' '}
          </h3>
        </div>
      </div>
    </div>
  );
}
