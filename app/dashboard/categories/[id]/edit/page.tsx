import Breadcrumbs from '@/app/_ui/categories/BreadCrumbs';
import { EditFormWithRHF } from '@/app/_ui/categories/edit-form-rhf';
import { notFound } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';
import { fetchAllCategories, fetchCategoryById } from '@/app/_lib/data';

/*export const metadata: Metadata = {
  title: 'Edit Category',
};*/

type Props = {
  params: { id: string };
  // searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const id = params.id;

  // fetch data
  const category = await fetchCategoryById(id);

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];
  console.log('METADATA PREVIOUS: ', previousImages);
  return {
    title: (category && `Edit ${category.name}`) || 'edit category',
    description: `Edit ${
      (category && category.name) || ''
    } category | DPC dashboard`,
    /*  openGraph: {
      images: [{
         url: previousImages[0].url,
       }],
    },*/
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const [category, categories] = await Promise.all([
    fetchCategoryById(id),
    fetchAllCategories(),
  ]);
  console.log('FOUND CATEGORY', category);
  if (!category) {
    console.log('NOT FOUND CATEGORY!!!!!!!!!!!!!!!!!!');
    notFound();
  }
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Categories', href: '/dashboard/categories' },
          {
            label: 'Edit Category',
            href: `/dashboard/categories/${id}/edit`,
            active: true,
          },
        ]}
      />
      <EditFormWithRHF categories={categories} category={category} />
    </main>
  );
}
