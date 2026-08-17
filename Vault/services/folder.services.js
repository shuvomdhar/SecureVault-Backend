import Folder from '../../models/Folder.model.js';
import SecretItem from '../../models/SecretItem.model.js';

export const getUserFolders = async (userId) => {
  return await Folder.find({ userId }).sort({ createdAt: -1 });
};

export const createFolder = async (userId, { name, color, description }) => {
  const existing = await Folder.findOne({ userId, name: name.trim() });
  if (existing) {
    throw new Error(`A folder named '${name}' already exists.`);
  }

  return await Folder.create({
    userId,
    name: name.trim(),
    color: color || '#8b5cf6',
    description: description || '',
  });
};

export const updateFolder = async (userId, folderId, { name, color, description }) => {
  const folder = await Folder.findOne({ _id: folderId, userId });
  if (!folder) {
    throw new Error('Folder not found');
  }

  if (name && name.trim() !== folder.name) {
    const existing = await Folder.findOne({ userId, name: name.trim() });
    if (existing) {
      throw new Error(`A folder named '${name}' already exists.`);
    }
    folder.name = name.trim();
  }

  if (color) folder.color = color;
  if (description !== undefined) folder.description = description;

  return await folder.save();
};

export const deleteFolder = async (userId, folderId) => {
  const folder = await Folder.findOneAndDelete({ _id: folderId, userId });
  if (!folder) {
    throw new Error('Folder not found');
  }

  // Move secrets inside this deleted folder back to root (folderId = null)
  await SecretItem.updateMany({ userId, folderId }, { $set: { folderId: null } });

  return folder;
};
