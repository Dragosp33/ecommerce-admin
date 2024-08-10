'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Button } from '@/app/_ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ProductState,
  useAppState,
} from '@/app/dashboard/products/create/layout';
import { useRouter, usePathname } from 'next/navigation';
import FileInputButton from '@/app/_ui/products/form/images-upload-input';
import {
  productFormType,
  productFormSchema,
  CategoryField,
} from '@/app/_lib/definitions';
import { useEditState } from '@/app/_lib/EditProvider';
import { FunctionComponent } from 'react';
import { FirstStepFormProps } from '../form-context-wrapper';

type InputProperty = {
  name: string;
  value: string;
};

// remove formSchema and replace with productFormType

type Inputs = productFormType;

/**
 * transforms properties from a form of {name: string, value: string} to a -> {string: string[]}
 * where the key is the name from the object, and the array is the value split at every (,).
 * this also accounts for multiple occurances of the same key.
 * @param data is the initial input, in form of `{name: string, value: string}[]`
 * @returns `mergedProperties` - in form of `Record<string, string[]>`
 * @example
 * data = [{name: 'color', value: 'black,white,red'}, {name: 'memory', value: '64gb,128gb'}, {name: 'color', value: 'black,purple'}]
 * merged = mergeProperties(data);
 * // merged = {color: ['black','white','red','purple'], memory: ['64gb', '128gb']  }
 */
function mergeProperties(data: InputProperty[]) {
  const mergedProperties: Record<string, string[]> = {};
  data.forEach((element) => {
    const { name, value } = element;
    const splitValues = value.split(/,+/);

    if (mergedProperties[name]) {
      // Merge existing values with new split values
      mergedProperties[name].push(...splitValues);
    } else {
      // Initialize with split values
      mergedProperties[name] = splitValues;
    }
  });

  // Remove duplicates from merged values
  for (const name in mergedProperties) {
    mergedProperties[name] = Array.from(new Set(mergedProperties[name]));
  }
  return mergedProperties;
}

/**
 * function to parse the properties into the desired form to use in react-hook-form,
 * for an array of objects, in our case, properties.
 * Properties are turn from an array of objects with [{name: string, value: string}] to an Record of key: string (the name),
 * value - array of strings. The rest of the fields remain the same, if the safeParse against the formSchema is successful with convenient changes ( strip() for strings )
 * @param initial -> is the data that is passed from the context state,
 * and is then transformed into inputs.
 * @returns Record<string, string[]>, properties. see example
 * @example
 * initial:
 *  ...rest_of_fields
 *  properties: [{name: 'color', value: 'black,white,red'}]
 * } => parsedData for the form:
 * ...safeParsed_rest_of_fields
 * properties: [{color: ['black', 'white', 'red']}]
 * }
 */
function transformInputs(initial: Inputs) {
  const res = productFormSchema.safeParse(initial);
  console.log(res);
  if (res.success) {
    const k = {
      properties: mergeProperties(res.data.properties),
    };
    return k;
  } else {
    throw new Error('error');
  }
}

export const FirstStepForm: FunctionComponent<FirstStepFormProps> = ({
  categories,
  context,
  mode,
}) => {
  /**
   * transform properties from the app context to properties for the `react-hook-form array`
   * It reverts the changes made in `transformInputs(data)`
   * @param properties - type of properties: { [key: string]: string[] }
   * @returns `properties` in form of: [{name: string, value: string}]
   */
  function parse_properties(properties: { [key: string]: string[] }) {
    const res = Object.keys(properties).map((key) => {
      return { name: key, value: properties[key].join(',') };
    });
    console.log(res);
    return res;
  }

  console.log('state: ', context);
  const router = useRouter();
  const path = usePathname();
  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      ...context.state.firstObject,
      properties: parse_properties(context.state.firstObject.properties),
      photoDump: context.state.photoDump,
    },
  });

  /**
   * onSubmitting the first step of the form, parse the data against the zod formSchema,
   * save it into the app state context, and redirect to the second step of the form
   * @param data - data from the form
   */
  const onSubmit = async (data: Inputs) => {
    const k = transformInputs(data);
    // Get all keys from context.state.firstObject.properties
    const firstObjectPropertiesKeys = Object.keys(
      context.state.firstObject.properties
    );
    // Check if all keys from firstObjectPropertiesKeys exist in k.properties
    const allKeysExist = firstObjectPropertiesKeys.every(
      (key) => key in k.properties
    );
    let updatingState: Partial<ProductState>;
    updatingState = {
      firstObject: {
        ...context.state.firstObject,
        title: data.title,
        category: data.category,
        properties: k.properties,
      },
      photoDump: data.photoDump,
    };
    if (!allKeysExist && context.state.secondObject) {
      const updatedVariants = (context.state.secondObject?.variants || []).map(
        (variant) => ({
          ...variant,
          properties: {},
        })
      );
      updatingState = {
        ...updatingState,
        secondObject:
          {
            variants: [updatedVariants[0], ...updatedVariants.slice(1)],
          } || null,
      };
    }
    context.updateState(updatingState);
    router.push(`${path}/variants`);
  };

  const {
    fields: propertyFields,
    append: appendProperty,
    remove: removeProperty,
  } = useFieldArray({
    name: 'properties',
    control,
  });

  const watchDump = watch('photoDump');
  console.log('watch dump is :::: ', watchDump);
  console.log('errors in first step: ', errors);
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* name:: /*/}

        <div className='mb-4'>
          <label htmlFor='title' className='mb-2 block text-sm font-medium'>
            Product title
          </label>
          <div className='relative'>
            <input
              type='text'
              id='title'
              {...register('title')}
              name='title'
              className='peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-5 md:pl-10 text-md outline-2 placeholder:text-gray-500'
              defaultValue=''
              aria-describedby='title-error'
            />
          </div>
          <div id='title-error' aria-live='polite' aria-atomic='true'>
            <p className='mt-2 text-sm text-red-500'>{errors.title?.message}</p>
          </div>
        </div>

        {/* parentCategory Name */}
        <div className='mb-4'>
          <label htmlFor='category' className='mb-2 block text-sm font-medium'>
            Choose parentCategory
          </label>
          <div className='relative'>
            <select
              id='category'
              {...register('category')}
              name='category'
              className='peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500'
              defaultValue=''
              aria-describedby='parentCategory-error'
            >
              <option value='' disabled>
                Select a parentCategory
              </option>
              {categories.map((parentCategory) => (
                <option key={parentCategory.id} value={parentCategory.id}>
                  {parentCategory.name}
                </option>
              ))}
            </select>
          </div>
          <div id='parentCategory-error' aria-live='polite' aria-atomic='true'>
            <p className='mt-2 text-sm text-red-500'>
              {errors.category?.message}
            </p>
          </div>
        </div>

        {/*images */}
        <div className='mb-2 '>
          <Controller
            name={'photoDump'}
            control={control}
            //{...register('photoDump')}
            render={({ field }) => (
              <FileInputButton
                field={field}
                setError={setError}
                errors={errors}
                context={context} // Pass the context as a prop
              />
            )}
          />
        </div>
        {/* properties */}
        <div className='mb-2'>
          <label className='block' htmlFor='properties'>
            Properties
          </label>
          <button
            onClick={() =>
              appendProperty({
                name: '',
                value: '',
              })
            }
            type='button'
            className='btn-default text-sm mb-2'
          >
            Add new property
          </button>
          <p className='mt-2 text-sm text-red-500'>
            {errors.properties &&
              errors.properties.message &&
              'Please add at least one property.'}
          </p>
          {propertyFields.map((field, index) => (
            <div key={field.id} className='flex gap-1 mb-2 items-baseline'>
              <div className='flex-1'>
                <input
                  type='text'
                  className='mb-0'
                  {...register(`properties.${index}.name` as const)}
                  placeholder='property name (example: color)'
                />
                {
                  <p className='mt-2 text-sm text-red-500'>
                    {errors.properties &&
                      errors.properties.at &&
                      errors.properties.at(index)?.name?.message}
                  </p>
                }
              </div>
              <div className='flex-1'>
                <input
                  type='text'
                  className='mb-0'
                  placeholder='values, comma separated'
                  {...register(`properties.${index}.value` as const)}
                />
                {
                  <p className='mt-2 text-sm text-red-500'>
                    {errors.properties &&
                      errors.properties.at &&
                      errors.properties.at(index)?.value?.message}
                  </p>
                }
              </div>
              <button
                onClick={() => removeProperty(index)}
                type='button'
                className='btn-red md:block'
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <Button> Submit </Button>
      </form>
    </>
  );
};
