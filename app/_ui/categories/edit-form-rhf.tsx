'use client';

import { useState } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { saveCategory, updateCategory } from '@/app/_lib/actions';
import { Category, CategoryField } from '@/app/_lib/definitions';
import { CreateCategorySchema } from '@/app/_lib/definitions';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../button';

type formValues = {
  name: string;
  parentCategory: string;
  properties: {
    name: string;
    value: string;
  }[];
};

type Inputs = z.infer<typeof CreateCategorySchema>;

export const EditFormWithRHF = ({
  categories,
  category,
}: {
  categories: CategoryField[];
  category: Category;
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      properties: category.properties,
      name: category.name.toString(),
      parentCategory: category.parent?.id.toString(),
    },
  });

  //const { errors } = formState;
  //console.log(category);
  // console.log(Inputs)
  const [backError, setBackError] = useState();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log(data);
    const k = await updateCategory(category.id.toString(), data);

    console.log(k);
  };

  //console.log(JSON.stringify(category.properties));
  const { fields, append, remove } = useFieldArray({
    name: 'properties',
    control,
  });

  //console.log('properties json: ', JSON.stringify(category.properties));
  //console.log('category.properties: ', category);
  return (
    <div>
      {/* <h2>Watched value: {watchUsername}</h2> */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='rounded-md bg-gray-50 p-4 md:p-6'>
          {/* name:: /*/}

          <div className='mb-4'>
            <label htmlFor='name' className='mb-2 block text-sm font-medium'>
              Category name
            </label>
            <div className='relative'>
              <input
                type='text'
                id='name'
                {...register('name')}
                name='name'
                className='peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-5 md:pl-10 text-md outline-2 placeholder:text-gray-500'
                defaultValue={category.name.toString()}
                aria-describedby='name-error'
              />
            </div>
            <div id='name-error' aria-live='polite' aria-atomic='true'>
              <p className='mt-2 text-sm text-red-500'>
                {errors.name?.message}
              </p>
            </div>
          </div>

          {/* parentCategory Name */}
          <div className='mb-4'>
            <label
              htmlFor='parentCategory'
              className='mb-2 block text-sm font-medium'
            >
              Choose parentCategory
            </label>
            <div className='relative'>
              <select
                id='parentCategory'
                {...register('parentCategory')}
                name='parentCategory'
                className='peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500'
                defaultValue=''
                aria-describedby='parentCategory-error'
              >
                <option value='' disabled>
                  Select a parentCategory
                </option>

                {categories
                  .filter((parentCategory) => parentCategory.id !== category.id)
                  .map((filteredCategory) => (
                    <option
                      key={filteredCategory.id}
                      value={filteredCategory.id}
                    >
                      {filteredCategory.name}
                    </option>
                  ))}
              </select>
            </div>
            <div
              id='parentCategory-error'
              aria-live='polite'
              aria-atomic='true'
            >
              <p className='mt-2 text-sm text-red-500'>
                {errors.parentCategory?.message}
              </p>
            </div>
          </div>

          {/* properties */}
          <div className='mb-2'>
            <label className='block' htmlFor='properties'>
              Properties
            </label>
            <button
              onClick={() =>
                append({
                  name: '',
                  value: '',
                })
              }
              type='button'
              className='btn-default text-sm mb-2'
            >
              Add new property
            </button>
            {fields.map((field, index) => (
              <div key={field.id} className='flex gap-1 mb-2 items-baseline'>
                <div className='flex-1'>
                  <input
                    type='text'
                    className='mb-0'
                    {...register(`properties.${index}.name` as const)}
                    placeholder='property name (example: color)'
                  />
                  <p className='mt-2 text-sm text-red-500'>
                    {errors.properties &&
                      errors.properties.at &&
                      errors.properties.at(index)?.name?.message}
                  </p>
                </div>
                <div className='flex-1'>
                  <input
                    type='text'
                    className='mb-0'
                    placeholder='values, comma separated'
                    {...register(`properties.${index}.value` as const)}
                  />
                  <p className='mt-2 text-sm text-red-500'>
                    {errors.properties &&
                      errors.properties.at &&
                      errors.properties.at(index)?.value?.message}
                  </p>
                </div>
                <button
                  onClick={() => remove(index)}
                  type='button'
                  className='btn-red md:block'
                >
                  Remove
                </button>
              </div>
            ))}

            <p className='mt-2 text-sm text-red-500'></p>
          </div>
          <Button> Submit </Button>
        </div>
      </form>
    </div>
  );
};
