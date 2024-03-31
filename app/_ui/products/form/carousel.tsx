import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import styles from '@/app/styles/Product.module.css';
import Image from 'next/image';
import PreviewCard from './preview-image-card';
import { Photo } from '@/app/_lib/definitions';

export default function MyCarousel({
  photos,
  updatePhoto,
  deletePhoto,
}: {
  photos: Photo[];
  updatePhoto: (
    file: File,
    presignedUrl: string,
    index: number,
    ref: any
  ) => Promise<void>;
  deletePhoto: (index: number) => void;
}) {
  const customRenderItem = (item: any, props: any) => (
    <item.type {...item.props} {...props} />
  );
  return (
    <div className='relative flex items-center justify-center w-full h-auto'>
      <div className='relative w-full'>
        <Carousel
          showThumbs={true}
          dynamicHeight={false}
          verticalSwipe='natural'
          renderThumbs={() =>
            photos.map((img: Photo, idx: number) => (
              <div
                key={idx}
                className='w-full h-20 relative flex items-center justify-center'
              >
                <Image
                  //src={`${img.previewLink}?${new Date().getTime() / 1000000}`}
                  src={`${img.previewLink}`}
                  alt='logo'
                  width={50}
                  height={50}
                  //sizes='(max-width: 768px) 10vw, (max-width: 1200px) 20vw, 33vw'
                />
              </div>
            ))
          }
          renderItem={customRenderItem}
        >
          {photos.map((photo: Photo, index: number) => (
            <PreviewCard
              key={index}
              photo={photo}
              index={index}
              updatePhoto={updatePhoto}
              deletePhoto={deletePhoto}
            />
          ))}
        </Carousel>
      </div>
    </div>
  );
}
