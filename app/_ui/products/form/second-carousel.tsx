import { useRef } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import styles from '@/app/_styles/Product.module.css';
import Image from 'next/image';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { Photo, VariantType } from '@/app/_lib/definitions';

function VariantCarouselCard({
  photo,
  selectPhoto,
  deselectPhoto,
  setThumbnail,
  field,
}: {
  photo: Photo;
  selectPhoto: () => void;
  deselectPhoto: () => void;
  setThumbnail: () => void;
  field: VariantType;
}) {
  const dropdownRef: any = useRef(null);
  function toggleDropdown() {
    const dropdown = dropdownRef.current;
    if (!dropdown) return;
    dropdown.classList.toggle('h-0');
    dropdown.classList.toggle('opacity-0');
  }
  return (
    <div className='relative'>
      <Image
        src={photo.previewLink}
        alt={photo.altText}
        width={1500}
        height={1500}
        className='max-h-[200px] md:max-h-[400px]'
        style={{ objectFit: 'contain' }}
      />
      <div className='flex absolute left-0 top-0 sm:left-50% w-full '>
        <div className='flex'>
          <div className='relative left-0 sm:left-[50%]'>
            <button
              type='button'
              className='btn w-8 h-8 flex justify-center items-center bg-gray-100'
              onClick={toggleDropdown}
            >
              <Bars3Icon className='w-4 h-4 relative' />
            </button>
            <div
              className='h-full opacity-0.8 absolute h-0 opacity-0 transition-all duration-1000 flex flex-row items-center bg-white'
              ref={dropdownRef}
            >
              <label
                //htmlFor='thumbnail'
                style={{ textWrap: 'nowrap' }}
                className='text-xs'
              >
                set as thumbnail
              </label>
              <input
                //name='thumbnail'

                type='radio'
                onChange={(e) => {
                  if (e.target.checked) {
                    field.thumbnail = photo.permaLink;
                    setThumbnail();
                  }
                }}
                checked={field.thumbnail == photo.permaLink}
                className='m-0'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VariantCarousel({
  photos,
  field,
  setValue,
  index,
}: {
  photos: Photo[];
  field: VariantType;
  setValue: any;
  index: number;
}) {
  const customRenderItem = (item: any, props: any) => (
    <item.type {...item.props} {...props} />
  );

  /**
   * set Thumbnail of the current field.
   * @param photo photo to be set as thumbnail for the current variant
   */
  function setThumbnail(photo: Photo) {
    setValue(`variants.${index}.thumbnail`, photo.permaLink);
    //field.thumbnail = photo.permaLink;

    console.log('field: ', field, 'perma link: ', photo.permaLink);
  }

  /**
   * function to add current photo to the photos of the current variant.
   * @param field the field representing the current field.
   * @param photo the photo to be added in the variant's photos
   */
  function selectPhoto(field: VariantType, photo: Photo) {
    console.log('on selecting photo: field: ', field);
    field.photos.push(photo.permaLink);
  }

  /**
   * function to remove current photo from the photos of the current variant.
   * @param field the field representing the current field.
   * @param photo the photo to be removed from the variant's photos
   */
  function deselectPhoto(field: VariantType, photo: Photo) {
    const photoIndex = field.photos.findIndex((p) => p === photo.permaLink);
    if (photoIndex > -1) {
      // only splice array when item is found
      field.photos.splice(photoIndex, 1); // 2nd parameter means remove one item only
    }
  }

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
                  objectFit='fit-content'
                  //sizes='(max-width: 768px) 10vw, (max-width: 1200px) 20vw, 33vw'
                />
                {field.thumbnail === img.permaLink && (
                  <p className='absolute bottom-0  bg-white opacity-[0.8]'>
                    thumbnail
                  </p>
                )}
                {/* select photos to be used in the variants images. */}
                <input
                  type='checkbox'
                  checked={field.photos.includes(img.permaLink)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      selectPhoto(field, img);
                    } else {
                      deselectPhoto(field, img);
                    }
                  }}
                  className='absolute w-fit top-0 right-0 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mb-0'
                />
              </div>
            ))
          }
          renderItem={customRenderItem}
        >
          {photos.map((photo: Photo, index: number) => (
            <VariantCarouselCard
              key={index}
              selectPhoto={() => selectPhoto(field, photo)}
              deselectPhoto={() => deselectPhoto(field, photo)}
              photo={photo}
              setThumbnail={() => setThumbnail(photo)}
              field={field}
            />
          ))}
        </Carousel>
      </div>
    </div>
  );
}
