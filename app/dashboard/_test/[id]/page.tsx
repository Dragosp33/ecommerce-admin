import {
  fetchAllProducts,
  fetchSingleProduct,
} from '@/app/_lib/experimental-data';

export async function generateStaticParams() {
  const products: any = await fetchAllProducts();
  const variantsIDs = [].concat.apply(
    [],
    products.map((p: any) =>
      p.variants.map((x: any) => ({
        id: x.SKU,
      }))
    )
  );

  console.log('VARIANTS IDS: ', variantsIDs);
  return variantsIDs;
}

async function ProductPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const p: any = await fetchSingleProduct(id);
  return (
    <div>
      <h1>{id}</h1>
      {p.title}
    </div>
  );
}

export default ProductPage;
