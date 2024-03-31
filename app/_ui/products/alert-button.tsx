'use client';
import { withSwal } from 'react-sweetalert2';
import { Product } from '@/app/_lib/definitions';
import { deleteOneProduct } from '@/app/_lib/actions';
import { TrashIcon } from '@heroicons/react/24/outline';

function AlertButton({ swal, product }: { swal: any; product: Product }) {
  console.log('category: ', product);
  function handleClick() {
    swal
      .fire({
        title: 'Are you sure?',
        text: `Do you want to delete ${product.title}? 
        This will delete the product and all the variants for it. Do you want to procceed?`,
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Yes, Delete!',
        confirmButtonColor: '#d55',
        reverseButtons: true,
      })
      .then(async (result: any) => {
        if (result.isConfirmed) {
          const { id } = product;
          await deleteOneProduct(id.toString());
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
