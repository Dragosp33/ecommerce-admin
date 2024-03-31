import { FirstStepForm } from '@/app/_ui/products/form/first-step-form';
import { fetchAllCategories } from '@/app/_lib/data';
import Breadcrumbs from '@/app/_ui/categories/BreadCrumbs';
import { FirstStepFormWithContext } from '@/app/_ui/products/form-context-wrapper';

export default async function Page() {
  const categories = await fetchAllCategories();
  return (
    <div>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Products', href: '/dashboard/products' },
          {
            label: 'Create product',
            href: `/dashboard/products/create`,
            active: true,
          },
        ]}
      />
      <FirstStepFormWithContext categories={categories} mode='create' />
    </div>
  );
}
