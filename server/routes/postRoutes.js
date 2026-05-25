import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  createPost, 
  getPosts, 
  getPostById,
  updatePost,
  deletePost
} from '../controllers/postController.js';

// Factory function that accepts io instance
const postRoutes = (io) => {
  const router = express.Router();

  // Create a wrapper for createPost that includes Socket.io emission
  const createPostWithNotification = async (req, res, next) => {
    try {
      const { title, content, category, status } = req.body;

      // Validate required fields
      if (!title || !content) {
        const error = new Error('Please provide title and content');
        error.statusCode = 400;
        throw error;
      }

      // Import Post model
      const Post = (await import('../models/Post.js')).default;

      // Create post with authenticated user as author
      const post = await Post.create({
        title,
        content,
        category,
        status,
        author: req.user._id
      });

      // Emit to all connected clients
      io.emit('newPost', {
        message: `New post created by ${req.user.name}!`,
        post: {
          _id: post._id,
          title: post.title,
          content: post.content,
          category: post.category,
          status: post.status,
          createdBy: req.user.name,
          createdAt: post.createdAt
        }
      });

      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: post
      });

    } catch (error) {
      next(error);
    }
  };

  // Specific routes BEFORE parameterized routes
  router.post('/', protect, createPostWithNotification);
  router.get('/', protect, getPosts);

  // Parameterized routes
  router.get('/:id', protect, getPostById);
  router.put('/:id', protect, updatePost);
  router.delete('/:id', protect, deletePost);

  return router;
};

export default postRoutes;
