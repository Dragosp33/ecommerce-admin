import mongoose, { model, models, Schema } from 'mongoose';

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    /*ChildCategories: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    ],*/
    properties: { type: Object },
    path: { type: String },
  },
  { strict: true, timestamps: true }
);

CategorySchema.set('toJSON', {
  transform: (document, returnedObject) => {
    //returnedObject.username = returnedObject.username.toString();
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});
export const CategoryModel =
  models?.Category || model('Category', CategorySchema);
