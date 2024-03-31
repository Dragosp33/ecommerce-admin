import mongoose, { model, Schema, models } from 'mongoose';

const ProductSchema = new Schema(
  {
    title: { type: String, required: true },
    category: { type: mongoose.Types.ObjectId, ref: 'Category' },
    properties: { type: Map, of: [String] }, // Map with string keys and array of strings values
    variants: [{ type: Object }], // Assuming VariantForm['variants'] is an array of objects
  },

  { strict: true, timestamps: true }
);

ProductSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    //returnedObject.username = returnedObject.username.toString();
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

export const ProductModel = models.Product || model('Product', ProductSchema);
