'use server';

import { getProductById } from '@/app/_lib/data';
import Breadcrumbs from '@/app/_ui/categories/BreadCrumbs';
import { lusitana } from '@/app/_ui/fonts';
import VariantsTable from '@/app/_ui/products/variants-table';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { id: string } }) {
  console.log('PAGE: ', params);
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }
  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between'>
        <h1 className={`${lusitana.className} text-lg truncate`}>
          {' '}
          {product.title}
        </h1>
      </div>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          {
            label: 'Products',
            href: `/dashboard/products`,
          },
          {
            label: `${product.title} - variants`,
            href: `/dashboard/products/${params.id}`,
            active: true,
          },
        ]}
      />
      <VariantsTable variants={product.variants} productId={params.id} />
    </div>
  );
}
