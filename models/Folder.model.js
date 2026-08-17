import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      default: '#8b5cf6',
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Prevent duplicate folder names per user
folderSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model('Folder', folderSchema);
