import express from 'express';
import {
  getFolders,
  addFolder,
  editFolder,
  removeFolder,
} from '../controllers/folder.controller.js';
import {
  getSecrets,
  addSecret,
  editSecret,
  removeSecret,
} from '../controllers/secret.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Apply auth protection middleware to all vault endpoints
router.use(protect);

// Folder routes
router.get('/folders', getFolders);
router.post('/folders', addFolder);
router.put('/folders/:id', editFolder);
router.delete('/folders/:id', removeFolder);

// Secret routes
router.get('/secrets', getSecrets);
router.post('/secrets', addSecret);
router.put('/secrets/:id', editSecret);
router.delete('/secrets/:id', removeSecret);

export default router;
