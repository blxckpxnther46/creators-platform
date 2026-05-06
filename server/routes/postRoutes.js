import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  createPost, 
  getPosts, 
  getPostById,
  updatePost,
  deletePost
} from '../controllers/postController.js';

const router = express.Router();

// Specific routes BEFORE parameterized routes
router.post('/', protect, createPost);
router.get('/', protect, getPosts);

// Parameterized routes
router.get('/:id', protect, getPostById);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

export default router;
