'use client';
import { withSwal } from 'react-sweetalert2';
import { Category } from '@/app/_lib/definitions';
import { deleteOneCategory } from '@/app/_lib/actions';
import { TrashIcon } from '@heroicons/react/24/outline';

function AlertButton({ swal, category }: { swal: any; category: Category }) {
  console.log('category: ', category);
  function handleClick() {
    swal
      .fire({
        title: 'Are you sure?',
        text: `Do you want to delete ${category.name}? 
        This will delete the subcategories and all the items from this category. Do you want to procceed?`,
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Yes, Delete!',
        confirmButtonColor: '#d55',
        reverseButtons: true,
      })
      .then(async (result: any) => {
        if (result.isConfirmed) {
          const { id } = category;
          await deleteOneCategory(id.toString());
        }
      });
  }

  return (
    <button
      onClick={handleClick}
      className='rounded-md border p-2 hover:bg-gray-100'
    >
      <TrashIcon className='w-5' />
    </button>
  );
}

export default withSwal(AlertButton);
