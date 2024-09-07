import VariantTest from '@/app/_ui/products/edit/variant-test';
import { SecondStepFormWithContext } from '@/app/_ui/products/form-context-wrapper';
import SecondStepForm from '@/app/_ui/products/form/second-step-form';

async function EditProductVariants() {
  /* const product = await fetchSingleProduct(params.id);

  if (!product) {
    notFound();
  }*/

  return (
    <div>
      <div> Edit your variants </div>
      <SecondStepFormWithContext mode='edit' />
    </div>
  );
}

export default EditProductVariants;
