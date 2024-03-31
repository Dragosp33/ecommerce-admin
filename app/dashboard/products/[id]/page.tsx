import {
  fetchMongoVariants,
  fetchSingleProduct,
  fetchSingleProduct2,
} from '@/app/_lib/experimental-data';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';

interface Product {
  title: string;
  SKU: string;
  price: number;
  properties: {
    memory: string;
    color: string;
    material: string;
  };
  stock: number;
}

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
  const product: any = await fetchSingleProduct(id);
  if (!product) {
    return {};
  }
  const currentVariant = product.variants.find((v: any) => v.SKU === params.id);

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: (currentVariant && `See ${currentVariant.title}`) || 'DPC Dashboard',
    description: `${
      (currentVariant && currentVariant.description) || 'DPC Ecommerce'
    }`,
    openGraph: {
      images: [...previousImages, currentVariant.thumbnail],
    },
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const wholeProduct: any = await fetchSingleProduct(id);
  //const l = await fetchSingleProduct2(params.id);
  //console.log('FETCHED WITH MONGOOOSE: ', l);
  console.log(wholeProduct);
  if (!wholeProduct) {
    notFound();
  }
  const currentVariant = wholeProduct.variants.find(
    (v: any) => v.SKU === params.id
  );

  function getVariantsLinks() {
    let variantsLinks: any = {};
    for (const [key, value] of Object.entries(currentVariant.properties)) {
      console.log(`${key}: ${value}`);
      let filter: any = {};
      for (const [key2, value2] of Object.entries(currentVariant.properties)) {
        if (key2 !== key) {
          filter[key2] = value2;
        }
      }
      let o = wholeProduct.variants.filter((x: any) => {
        for (const [key3, value3] of Object.entries(filter)) {
          if (x.properties[key3] !== value3) {
            return false;
          }
        }
        return true;
      });
      variantsLinks[key] = o;
    }
    return variantsLinks;
  }

  const inactiveLink = 'flex gap-1 p-1';
  const activeLink = inactiveLink + ' bg-highlight text-black rounded-sm';
  return (
    <div>
      <h1>{currentVariant.title && currentVariant.title}</h1>
      <div className='rounded'>
        <Image
          src={currentVariant.thumbnail}
          alt='image'
          width={500}
          height={500}
        />
      </div>
      {Object.entries(getVariantsLinks()).map(
        ([key, value]: [key: any, value: any]) => (
          <div key={key}>
            <p> {key} </p>
            {value.map((variant: any) => (
              <div key={`${key}_${variant.SKU}`} className='mb-2'>
                <Link
                  className={`rounded-md border p-2 ${
                    variant.SKU === params.id ? activeLink : inactiveLink
                  }`}
                  href={`/dashboard/products/${variant.SKU}`}
                >
                  {' '}
                  {variant.title}{' '}
                </Link>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
