import {
  fetchSingleProduct,
  fetchSingleProduct2,
} from '@/app/_lib/experimental-data';
import { notFound } from 'next/navigation';
import Test from '@/app/_ui/products/edit/test';
import { FirstStepFormWithContext } from '@/app/_ui/products/form-context-wrapper';
import { fetchAllCategories } from '@/app/_lib/data';

async function EditProductFirst() {
  const categories = await fetchAllCategories();

  /* if (!product) {
    notFound();
  }*/

  console.log('EDIT PRODUCT FIRST LOGGING.....');
  return (
    <div>
      <div>hello</div>
      <FirstStepFormWithContext categories={categories} mode='edit' />
    </div>
  );
}

export default EditProductFirst;
