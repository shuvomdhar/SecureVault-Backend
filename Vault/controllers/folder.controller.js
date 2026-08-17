import {
  getUserFolders,
  createFolder,
  updateFolder,
  deleteFolder,
} from '../services/folder.services.js';
import { validateFolderInput } from '../validators/vault.validator.js';

export const getFolders = async (req, res) => {
  try {
    const folders = await getUserFolders(req.user._id);
    res.status(200).json({ success: true, folders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addFolder = async (req, res) => {
  try {
    const { isValid, errors } = validateFolderInput(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    const folder = await createFolder(req.user._id, req.body);
    res.status(201).json({ success: true, folder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const editFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const folder = await updateFolder(req.user._id, id, req.body);
    res.status(200).json({ success: true, folder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const removeFolder = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteFolder(req.user._id, id);
    res.status(200).json({ success: true, message: 'Folder deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
