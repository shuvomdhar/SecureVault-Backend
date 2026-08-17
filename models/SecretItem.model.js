import mongoose from 'mongoose';

const columnSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isSecured: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const secretItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null, // null means stored in root (no folder)
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    columns: [columnSchema],
    notes: {
      type: String,
      default: '',
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('SecretItem', secretItemSchema);
