'use client';

import React, { FunctionComponent } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '../../button';
import { TrashIcon, CurrencyEuroIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import VariantCarousel from './second-carousel';
import { useEffect } from 'react';

import {
  VariantForm,
  variantFormSchema,
  finalSubmission,
} from '@/app/_lib/definitions';
import { CreateProduct, EditProduct, MoveAllPhotos } from '@/app/_lib/actions';
import { SecondStepFormProps } from '../form-context-wrapper';

const SecondStepForm: FunctionComponent<SecondStepFormProps> = ({
  context,
  mode,
}) => {
  //const appcontext = useAppState();
  const appcontext = context;
  console.log('SHOW STATE: ', appcontext.state);

  const router = useRouter();
  const path = usePathname();
  const params = useParams();

  console.log('MODE IS: ', mode, 'PARAMS IS: ', params);

  // if photos are not added, redirect to first  step of the form
  useEffect(() => {
    if (appcontext.state.photoDump.length < 1) {
      const newPath = path.split('/');
      newPath.pop();
      const basePath = newPath.join('/');
      router.replace(basePath);
    }
  }, [appcontext.state.photoDump, router, path]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<VariantForm>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: appcontext.state.secondObject || {},
  });

  const onSubmit = async (data: VariantForm) => {
    try {
      appcontext.updateState({
        secondObject: data,
      });
      await MoveAllPhotos(appcontext.state.photoDump);
      const m: finalSubmission = {
        ...appcontext.state.firstObject,
        ...data,
      };
      console.log('final form to submit: ', m, typeof m);
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      mode === 'create' ? await CreateProduct(m) : await EditProduct(id, m);
    } catch (error) {
      console.log('error', error);
      setError('root', {
        type: 'manual',
        message: 'some error occurred..Please try again',
      });
    }
  };

  const { fields, append, remove } = useFieldArray({
    name: 'variants',
    control,
  });

  console.log('state : ', appcontext.state);
  const properties = appcontext.state.firstObject.properties;
  const photoDump = appcontext.state.photoDump;

  //console.log('properties: ', properties);
  console.log('errors: ', errors);

  console.log('fields: ', fields);

  return (
    <div>
      <div>
        <form onSubmit={handleSubmit(onSubmit)} className='mb-2'>
          <button
            onClick={() =>
              append({
                properties: {},
                title: '',
                price: 0,
                description: '',
                SKU: '',
                photos: [],
                thumbnail: '',
              })
            }
            type='button'
            className='btn-default text-sm mb-2'
          >
            Add new Variant
          </button>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className='w-full p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 mb-3'
            >
              <div className='flex flex-col gap-1 mb-2 items-baseline'>
                <div className='w-full flex flex-row justify-between relative'>
                  <div className='flex-1'>
                    <label
                      htmlFor={`variants.${index}.title`}
                      className='mb-2 block text-sm font-bold'
                    >
                      Title
                    </label>
                    <div className='relative'>
                      <input
                        type='text'
                        id={`variants.${index}.title`}
                        {...register(`variants.${index}.title`)}
                        //name='name'
                        className='peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-5 md:pl-10 text-md outline-2 placeholder:text-gray-500 font-bold'
                        defaultValue=''
                        aria-describedby={`variants.${index}.title-error`}
                      />
                    </div>
                    <div
                      id={`variants.${index}.title-error`}
                      aria-live='polite'
                      aria-atomic='true'
                    >
                      {errors?.variants?.at &&
                        errors.variants.at(index)?.title?.message && (
                          <p className='mt-2 text-sm text-red-500'>
                            {' '}
                            {errors.variants.at(index)?.title?.message}
                          </p>
                        )}
                    </div>
                  </div>
                  <button
                    onClick={() => remove(index)}
                    type='button'
                    className='btn-red md:block h-fit absolute top-0 right-0'
                  >
                    <p>
                      <span className='hidden md:block'> Remove</span>
                      <TrashIcon className='block md:hidden w-5' />
                    </p>
                  </button>
                </div>

                {/*properties start: */}
                <div className='flex-1 flex flex-col md:flex-row w-full'>
                  {Object.keys(properties).map((key) => (
                    <div key={key} className='w-full mx-2'>
                      <label
                        htmlFor={`variants.${index}.properties.${key}`}
                        className='mb-2 block text-sm font-medium'
                      >
                        Choose {key}
                      </label>
                      <select
                        id={`variants.${index}.properties.${key}`}
                        className='mb-0'
                        aria-describedby={`variants.${index}.properties.${key}-error`}
                        {...register(
                          `variants.${index}.properties.${key}` as const
                        )}
                      >
                        <option value='' disabled>
                          {' '}
                          Select something here
                        </option>
                        {properties[key].map((property) => (
                          <option key={`${key}=${property}`} value={property}>
                            {property}
                          </option>
                        ))}
                      </select>
                      <div
                        id={`variants.${index}.properties.${key}-error`}
                        aria-live='polite'
                        aria-atomic='true'
                      >
                        {errors.variants?.at &&
                          errors?.variants?.at(index)?.properties && (
                            <p className='mt-2 text-sm text-red-500'>
                              {errors?.variants?.at(index)?.properties?.[key] &&
                                errors?.variants?.at(index)?.properties?.[key]
                                  ?.message}
                            </p>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
                {/*properties end: */}

                {/* SKU + Price */}
                <div className='flex-1 flex flex-col md:flex-row w-full'>
                  {/*SKU: */}
                  <div className='w-full mx-2'>
                    <label
                      htmlFor={`variants.${index}.SKU`}
                      className='mb-2 block text-sm font-md'
                    >
                      SKU (identifier)
                    </label>
                    <input
                      type='text'
                      id={`variants.${index}.SKU`}
                      {...register(`variants.${index}.SKU`)}
                      //name='name'
                      className='peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-5 md:pl-10 text-md outline-2 placeholder:text-gray-500 font-md'
                      defaultValue=''
                      //aria-describedby='name-error'
                    />
                  </div>
                  {/* Price: */}
                  <div className='w-full mx-2'>
                    <label
                      htmlFor={`variants.${index}.price`}
                      className='mb-2 block text-sm font-md'
                    >
                      Price
                    </label>
                    <div className='relative'>
                      <input
                        type='number'
                        step={0.01}
                        id={`variants.${index}.price`}
                        {...register(`variants.${index}.price`)}
                        className='peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-md outline-2 placeholder:text-gray-500 font-md'
                        defaultValue=''
                        aria-describedby={`variants.${index}.price-error`}
                      />
                      <CurrencyEuroIcon className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
                    </div>
                    <div
                      id={`variants.${index}.price-error`}
                      aria-live='polite'
                      aria-atomic='true'
                    >
                      {errors?.variants?.at &&
                        errors.variants.at(index)?.price?.message && (
                          <p className='mt-2 text-sm text-red-500'>
                            {' '}
                            {errors.variants.at(index)?.price?.message}
                          </p>
                        )}
                    </div>
                  </div>
                </div>

                {/*description start */}
                <div className='mb-2 w-full'>
                  <label
                    htmlFor={`variants.${index}.description`}
                    className='mb-2 block text-sm font-md'
                  >
                    Description
                  </label>
                  <textarea
                    id={`variants.${index}.description`}
                    rows={4}
                    className='w-full px-2 text-sm text-gray-900 bg-white border-0 focus:ring-0 resize-none'
                    placeholder=' A brief description of the product, eg. Iphone 15, black, 128gb, 8gb RAM....'
                    required
                    {...register(`variants.${index}.description`)}
                    aria-describedby={`variants.${index}.description-error`}
                  />
                  <div
                    id={`variants.${index}.description-error`}
                    aria-live='polite'
                    aria-atomic='true'
                  >
                    {errors?.variants?.at &&
                      errors.variants.at(index)?.description?.message && (
                        <p className='mt-2 text-sm text-red-500'>
                          {' '}
                          {errors.variants.at(index)?.description?.message}
                        </p>
                      )}
                  </div>
                </div>
                {photoDump && (
                  <VariantCarousel
                    photos={photoDump}
                    field={field}
                    setValue={setValue}
                    index={index}
                  />
                )}
              </div>
            </div>
          ))}

          <Button
            type='submit'
            disabled={fields.length < 1}
            className='disabled:bg-slate-50'
          >
            {' '}
            Submit{' '}
          </Button>
        </form>
      </div>
      <div>
        <button type='button' onClick={() => router.back()}>
          Click here to go back
        </button>
      </div>
    </div>
  );
};

export default SecondStepForm;
