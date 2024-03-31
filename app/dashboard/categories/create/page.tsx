import { fetchAllCategories } from '@/app/_lib/data';
import { FormWithRHF } from '@/app/_ui/categories/create-form-rhf';
import Link from 'next/link';

async function create() {
  const categories = await fetchAllCategories();

  return (
    <div>
      <div className='flex'>
        {/* some change here -> instead of a link, create a client button for replacing the pathname with the previous one,
            so that when the back location is actually backwards, not pushed on top of current history.
        */}
        <Link href={'/dashboard/categories'} className='mr-2'>
          {' '}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth='1.5'
            stroke='currentColor'
            className='w-6 h-6'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3'
            />
          </svg>
        </Link>
        <h1>Create a new category.</h1>
      </div>
      <FormWithRHF categories={categories} />
    </div>
  );
}

export default create;
