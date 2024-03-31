import { FirstStepForm } from '@/app/_ui/products/form/first-step-form';
import { fetchAllCategories } from '@/app/_lib/data';

export default async function Page() {
  const categories = await fetchAllCategories();
  return (
    <div>
      <h1> Test product </h1>
      <FirstStepForm categories={categories} />
    </div>
  );
}
