import SecretItem from '../../models/SecretItem.model.js';
import { encryptValue, decryptValue } from '../../utils/encryption.util.js';

/**
 * Process columns before saving: encrypt values for secured columns
 */
const processColumnsForStorage = (columns = []) => {
  return columns.map((col) => {
    const isSecured = Boolean(col.isSecured);
    let val = col.value || '';
    
    if (isSecured && val) {
      val = encryptValue(val);
    }

    return {
      name: col.name.trim(),
      isSecured,
      value: val,
    };
  });
};

/**
 * Process columns after reading: decrypt values for secured columns
 */
const processColumnsForRead = (columns = []) => {
  return columns.map((col) => {
    const isSecured = Boolean(col.isSecured);
    let val = col.value || '';
    
    if (isSecured && val) {
      val = decryptValue(val);
    }

    return {
      _id: col._id,
      name: col.name,
      isSecured,
      value: val,
    };
  });
};

export const getUserSecrets = async (userId, { folderId, search } = {}) => {
  const query = { userId };

  if (folderId === 'root') {
    query.folderId = null;
  } else if (folderId) {
    query.folderId = folderId;
  }

  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  const items = await SecretItem.find(query).sort({ updatedAt: -1 });

  return items.map((item) => {
    const plain = item.toObject();
    plain.columns = processColumnsForRead(plain.columns);
    return plain;
  });
};

export const createSecret = async (userId, { folderId, title, columns, notes, favorite }) => {
  const processedColumns = processColumnsForStorage(columns);

  const newItem = await SecretItem.create({
    userId,
    folderId: folderId || null,
    title: title.trim(),
    columns: processedColumns,
    notes: notes || '',
    favorite: Boolean(favorite),
  });

  const plain = newItem.toObject();
  plain.columns = processColumnsForRead(plain.columns);
  return plain;
};

export const updateSecret = async (userId, secretId, { folderId, title, columns, notes, favorite }) => {
  const item = await SecretItem.findOne({ _id: secretId, userId });
  if (!item) {
    throw new Error('Secret item not found');
  }

  if (title) item.title = title.trim();
  if (folderId !== undefined) item.folderId = folderId || null;
  if (notes !== undefined) item.notes = notes;
  if (favorite !== undefined) item.favorite = Boolean(favorite);
  if (columns) {
    item.columns = processColumnsForStorage(columns);
  }

  await item.save();

  const plain = item.toObject();
  plain.columns = processColumnsForRead(plain.columns);
  return plain;
};

export const deleteSecret = async (userId, secretId) => {
  const deleted = await SecretItem.findOneAndDelete({ _id: secretId, userId });
  if (!deleted) {
    throw new Error('Secret item not found');
  }
  return deleted;
};
