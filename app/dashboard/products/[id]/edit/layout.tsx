import { EditProvider } from '@/app/_lib/EditProvider';
import { createPresignedUrlWithClient } from '@/app/_lib/actions';
import { Photo, Product } from '@/app/_lib/definitions';
import { fetchSingleProduct2 } from '@/app/_lib/experimental-data';

import { notFound } from 'next/navigation';

/**
 *
 * @param photos - strings of the initial photos -- the permanent s3 url
 * @returns photoDump, with data like
 * @example
 * photoDump: {
 *  url: string,
 * altText: string,
 * permaLink: string,
 * previewLink: string
 * }
 */
async function createUrls(photos: Set<string>) {
  let promises: Promise<Photo>[] = [];

  photos.forEach((photo: string) => {
    let split = photo.split('/');
    let key = split[split.length - 1];
    promises.push(
      createPresignedUrlWithClient(key, photo).then(
        ({ presignedUrl, previewLink, uidKey, permaLink }) => {
          return {
            url: presignedUrl,
            altText: uidKey,
            previewLink: permaLink,
            permaLink: permaLink,
          };
        }
      )
    );
  });

  const photoDump: Photo[] = await Promise.all(promises);

  return photoDump;
}

function getPhotoSet(variants: any): Set<string> {
  let photos = new Set<string>();
  variants.forEach((variant: any) => {
    variant.photos.forEach((photo: string) => {
      photos.add(photo);
    });
  });
  return photos;
}

const Layout = async ({
  params,
  children,
}: {
  params: { id: string };
  children: React.ReactNode;
}) => {
  console.log('LOGGING FROM LAYOUT...');
  const product: Product = await fetchSingleProduct2(params.id);
  if (!product) {
    return notFound();
  }
  console.log('PRODUCT: ', product);
  let photoDump = await createUrls(getPhotoSet(product.variants));
  console.log('PHOTO DUMP::: ', photoDump);
  const data = {
    firstObject: {
      title: product.title.toString(),
      properties: product.properties,
      category: product.category.id.toString(),
    },
    photoDump: photoDump,
    secondObject: {
      variants: product.variants,
    },
  };
  return (
    <>
      <EditProvider initialData={data}>{children}</EditProvider>
    </>
  );
};

export default Layout;
