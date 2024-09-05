import { z } from 'zod';

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Category = {
  id: String;
  name: String;
  parent?: Category | undefined;
  properties?: Array<Object> | undefined;
  path?: String;
};

export type CategoryField = {
  id: string;
  name: string;
};

export const CreateCategorySchema = z.object({
  name: z.string().transform((s, ctx) => {
    const withoutWhitespace = s.replaceAll(/\s*/g, '');
    if (withoutWhitespace.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Property name must be at least 3 characters long',
      });
      return z.NEVER;
    }
    return s.trim();
  }),
  parentCategory: z
    .string({
      invalid_type_error: 'Please select a category',
    })
    .nullable()
    .optional(),
  properties: z.array(
    z.object({
      name: z.string().transform((s, ctx) => {
        const withoutWhitespace = s.replaceAll(/\s*/g, '');
        if (withoutWhitespace.length < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Property name can't be empty",
          });
          return z.NEVER;
        }
        return withoutWhitespace;
      }),
      value: z.string().transform((s, ctx) => {
        const withoutWhitespace = s.replaceAll(/\s*/g, '');
        if (withoutWhitespace.length < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Property value can't be empty",
          });
          return z.NEVER;
        }
        return s.trim();
      }),
    })
  ),
});

/**
 * Schema for a photo, containing s3 temporary link, s3 presigned link, s3 permanent link and
 * altText ( the key of the file in S3 bucket)
 */
export const photoSchema = z.object({
  url: z.string().url(), // Assuming S3 URLs
  altText: z.string(),
  previewLink: z.string().url(),
  permaLink: z.string().url(),
});

export type Photo = z.infer<typeof photoSchema>;
/**
 * Schema for a single variant
 */
const variantSchema = z.object({
  title: z.string().transform((s, ctx) => {
    const withoutWhitespace = s.replaceAll(/\s*/g, '');
    if (withoutWhitespace.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Title can't be empty",
      });
      return z.NEVER;
    }
    return s.trim();
  }),
  SKU: z.string(),
  price: z.coerce.number(),
  properties: z
    .record(z.string().min(2), z.string().min(2))
    .refine((obj) => Object.keys(obj).length > 0, {
      message: 'Properties object must contain at least one key-value pair',
    }),
  description: z.string(),
  stock: z.coerce.number(),
  photos: z.array(z.string().url()),
  thumbnail: z.string(),
});

export type VariantType = z.infer<typeof variantSchema>;
/**
 * schema for the second step of the form, containing an array of Variants;
 */
export const variantFormSchema = z.object({
  variants: z.array(variantSchema).nonempty(),
});

export type VariantForm = z.infer<typeof variantFormSchema>;
/**
 * schema for the first step of the form, containing main properties of a product ( parent product, not variant )
 */
export const productFormSchema = z.object({
  title: z.string().min(5),
  category: z.string().min(1),
  properties: z
    .array(
      z.object({
        name: z.string().transform((s, ctx) => {
          const withoutWhitespace = s.replaceAll(/\s*/g, '');
          if (withoutWhitespace.length < 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Property name can't be empty",
            });
            return z.NEVER;
          }
          return withoutWhitespace;
        }),
        value: z.string().transform((s, ctx) => {
          const withoutWhitespace = s.replaceAll(/\s*/g, '');
          const splitValues = withoutWhitespace.split(',');
          if (withoutWhitespace.length < 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Property value can't be empty",
            });
            return z.NEVER;
          }
          if (splitValues.includes('')) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'double comma / comma at end or start',
            });
            return z.NEVER;
          }

          return withoutWhitespace;
        }),
      })
    )
    .min(1),
  photoDump: z.array(photoSchema),
});

export type productFormType = z.infer<typeof productFormSchema>;
/*export type finalForm = {
  product: productFormType,
  variants:
}*/

type productFormTypeWithoutPhotoDump = Omit<productFormType, 'photoDump'>;

export type finalForm = productFormTypeWithoutPhotoDump & {
  variants: VariantForm['variants'];
};
// export type finalForm = productFormType & { variants: VariantForm['variants'] };
export type finalSubmission = {
  properties: { [key: string]: string[] };
  title: string;
  category: string;
  variants: VariantForm['variants'];
};

export type Product = {
  id: String;
  title: String;
  category: Category;
  properties: { [key: string]: string[] };
  variants: VariantForm['variants'];
};
