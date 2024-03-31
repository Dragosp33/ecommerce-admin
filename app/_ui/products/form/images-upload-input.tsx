import { useRef } from 'react';

import { createPresignedUrlWithClient } from '@/app/_lib/actions';

import MyCarousel from './carousel';
import { ChevronDoubleDownIcon } from '@heroicons/react/24/outline';
import { FirstStepFormProps } from '../form-context-wrapper';
import { VariantForm } from '@/app/_lib/definitions';

export default function FileInputButton({
  field,
  setError,
  errors,
  context,
}: {
  field: any;
  setError: any;
  errors: any;
  context: FirstStepFormProps['context'];
}) {
  const inputFileRef: any = useRef(null);
  const collapseBtnRef: any = useRef(null);
  const collapseRef: any = useRef(null);

  /**
   * removes photos and thumbnails from all the variants, if available.
   * Used for edit, when uploading new photos instead of updating the existing ones.
   */
  function CleanVariantsPhotos() {
    // If state.secondObject exists, remove photos and thumbnail from all the variants
    if (
      context.state.secondObject &&
      context.state.secondObject.variants.length > 0
    ) {
      const updatedVariants = context.state.secondObject.variants.map(
        (variant) => ({
          ...variant,
          photos: [],
          thumbnail: '',
        })
      );
      if (updatedVariants.length > 0) {
        context.updateState({
          secondObject: {
            variants: [updatedVariants[0], ...updatedVariants.slice(1)],
          },
        });
      } else {
        context.updateState({
          secondObject: null,
        });
      }
    }
  }

  /**
   * Transforms input file into an S3 presigned link for updates. It stores the photo as temporary at first.
   * @param file - input file
   * @param name - name of the file - this, together with an uuidv4 will be set as the key in the S3 bucket.
   * @returns photo in form of: `{
        url: presignedUrl,
        altText: uidKey,
        previewLink: previewLink,
        permaLink: permaLink,
      };`
   */
  async function TransformFileToUrl(file: File, name: string) {
    const { presignedUrl, previewLink, uidKey, permaLink } =
      await createPresignedUrlWithClient(name);
    // console.log('????, ', name, presignedUrl);
    // console.log(file);
    try {
      const result = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      console.log(`result: for ${name}`, result);
      if (!result.ok) {
        switch (result.status) {
          case 403:
            console.log('link expired.');
          default:
            console.log('other error', result.status);
        }

        //console.log('not ok: ', field);

        // set error here
      }

      // Clean Variants Photos if new photos have arrived.
      CleanVariantsPhotos();

      return {
        url: presignedUrl,
        altText: uidKey,
        previewLink: previewLink,
        permaLink: permaLink,
      };
    } catch (error) {
      console.log('this not ok: ', error);
    }
  }

  /**
   * function that updates the temporary photo at the presigned S3 url
   * @param file - input file
   * @param presignedUrl - the presigned S3 url to update the image
   * @param index - index of the field in the form
   */
  async function UpdatePhotoURL(
    file: File,
    presignedUrl: string,
    index: number,
    ref: any
  ) {
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('File is not an image');
      }

      const prevLink = presignedUrl.split('?')[0];
      console.log('IN UPDATE, PREVLINK  = ', prevLink);
      const result = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
      console.log(`result: for update`, result, result.ok);
      if (!result.ok) {
        switch (result.status) {
          case 403:
            setError(`photoDump`, {
              message: `Session expired, please reupload your photos`,
              ref: ref,
            });
            field.onChange([]);
            break;
          default:
            console.log('other error', result.status);
        }
        return;
      }

      const updatedPhoto = {
        ...field.value[index],
        /*previewLink: `${field.value[index].previewLink}?${
          new Date().getTime() / 1000
        }`,*/
        previewLink: `${prevLink}?${new Date().getTime() / 1000}`,
        altText: file.name,
      };
      const newValue = [...field.value];
      newValue[index] = updatedPhoto;
      field.onChange(newValue);
    } catch (error) {
      console.log('error: ', error);
      setError(`photoDump`, {
        message: `this should be an Image`,
        ref: ref,
      });
    }
  }

  /**
   * removes input file from the array of photos
   * @param index - index in the array of photos to be removed
   */
  function deletePhoto(index: number) {
    console.log('index is: ', index);
    console.log(field.value);
    const newValue = [...field.value];
    newValue.splice(index, 1);
    field.onChange(newValue);
  }

  const CollapseCarousel = () => {
    const CollapseElement = collapseRef.current;
    if (!collapseRef.current) return;
    CollapseElement.classList.toggle('collapse-carousel');
    collapseBtnRef.current.classList.toggle('rotate-[270deg]');
  };

  return (
    <>
      <input
        type='file'
        // className ='hidden'
        className='file:mr-4 file:py-2 file:px-4
      file:rounded-full file:border-0
      file:text-sm file:font-semibold
      file:bg-violet-50 file:text-violet-700
      hover:file:bg-violet-100'
        ref={inputFileRef}
        onChange={async (e) => {
          //console.log('ON CHANGE TRIGGERED');
          const files = Array.from(e.target.files ?? []);
          const urls = await Promise.all(
            files.map((file) => TransformFileToUrl(file, file.name))
          );

          field.onChange(urls);
        }}
        multiple
        accept='image/*'
        // name='photoDump'
        aria-describedby='photoDump-error'
      />
      <div id='photoDump-error' aria-live='polite' aria-atomic='true'>
        <p className='mt-2 text-sm text-red-500'>{errors.photoDump?.message}</p>
      </div>
      <button
        type='button'
        onClick={() => inputFileRef.current.click()}
        className='hidden'
      >
        Upload File
      </button>

      {field.value && field.value.length > 0 && (
        <>
          <button
            type='button'
            className='btn btn-default flex items-center'
            onClick={CollapseCarousel}
          >
            Gallery
            <ChevronDoubleDownIcon
              width={15}
              height={15}
              ref={collapseBtnRef}
              className='ml-2 transition-all duration-1000'
            />
          </button>
          <div
            className='w-full flex items-center justify-center h-full transition-all duration-1000'
            ref={collapseRef}
          >
            <MyCarousel
              photos={field.value}
              updatePhoto={UpdatePhotoURL}
              deletePhoto={deletePhoto}
            />
          </div>
        </>
      )}
    </>
  );
}
