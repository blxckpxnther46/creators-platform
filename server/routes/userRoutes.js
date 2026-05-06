import express from 'express';
import {
  registerUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes - no authentication required
router.post('/register', registerUser);

// Protected routes - require authentication
router.get('/', protect, getAllUsers);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);

export default router;