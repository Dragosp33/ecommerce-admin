'use client';
import { useRef, useState } from 'react';
import Image from 'next/image';
import { TrashIcon, FolderArrowDownIcon } from '@heroicons/react/24/outline';
import { Photo } from '@/app/_lib/definitions';

const PreviewCard = ({
  photo,
  updatePhoto,
  index,
  deletePhoto,
}: {
  photo: Photo;
  updatePhoto: (
    file: File,
    presignedUrl: string,
    index: number,
    ref: any
  ) => Promise<void>;
  index: number;
  deletePhoto: (index: number) => void;
}) => {
  const updateRef: any = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

  const toBase64 = (str: string) =>
    typeof window === 'undefined'
      ? Buffer.from(str).toString('base64')
      : window.btoa(str);

  return (
    <div
      //key={photo.altText}
      className='p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 mb-3 relative self-center w-full lg:w-1/2 max-h-[300px] md:max-h-full'
      //className=''
    >
      {isLoading && <p>Loading...</p>} {/* Show loading indicator */}
      <Image
        src={`${photo.previewLink}`}
        alt={photo.altText}
        width={1500}
        height={1500}
        placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(200, 200))}`}
        priority={true}
        onLoad={() => {
          setIsLoading(false);
        }}
        style={{
          maxWidth: '100%',
          height: 'auto',
          objectFit: 'contain',
          // maxHeight: '500px',
        }}
      />
      <input
        type='file'
        accept='image/*'
        className='hidden'
        ref={updateRef}
        onChange={async (e) => {
          setIsLoading(true);
          e.target.files &&
            (await updatePhoto(e.target.files[0], photo.url, index, updateRef));
          setIsLoading(false);
        }}
      />
      {/* buttons to update / delete */}
      <div className='absolute right-0 top-0 left-0 flex items-center justify-center gap-2'>
        <button
          type='button'
          onClick={() => updateRef.current.click()}
          //className='absolute right-0 top-0'
          className='btn-default bg-white-500 hover:bg-blue-400 font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded'
        >
          <FolderArrowDownIcon width={15} height={15} />
        </button>
        <button
          type='button'
          className='btn-default bg-white-500 hover:bg-red-400 hover:text-white font-bold py-2 px-4 border-b-4 border-red-700 hover:border-red-500 rounded'
          onClick={() => deletePhoto(index)}
        >
          <TrashIcon width={15} height={15} />
        </button>
      </div>
    </div>
  );
};

export default PreviewCard;
