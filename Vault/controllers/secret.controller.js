import {
  getUserSecrets,
  createSecret,
  updateSecret,
  deleteSecret,
} from '../services/secret.services.js';
import { validateSecretInput } from '../validators/vault.validator.js';

export const getSecrets = async (req, res) => {
  try {
    const { folderId, search } = req.query;
    const secrets = await getUserSecrets(req.user._id, { folderId, search });
    res.status(200).json({ success: true, secrets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addSecret = async (req, res) => {
  try {
    const { isValid, errors } = validateSecretInput(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    const secret = await createSecret(req.user._id, req.body);
    res.status(201).json({ success: true, secret });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const editSecret = async (req, res) => {
  try {
    const { id } = req.params;
    const secret = await updateSecret(req.user._id, id, req.body);
    res.status(200).json({ success: true, secret });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const removeSecret = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteSecret(req.user._id, id);
    res.status(200).json({ success: true, message: 'Secret deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
