import Post from '../models/Post.js';

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res, next) => {
  try {
    const { title, content, category, status, coverImage } = req.body;

    // Validate required fields
    if (!title || !content) {
      const error = new Error('Please provide title and content');
      error.statusCode = 400;
      throw error;
    }

    // Create post with authenticated user as author
    const post = await Post.create({
      title,
      content,
      category,
      status,
      coverImage: coverImage || null, // Optional - can be null for text-only posts
      author: req.user._id // From protect middleware
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

// @desc    Get posts with pagination - OPTIMIZED
// @route   GET /api/posts?page=1&limit=10
// @access  Private
// Performance optimizations:
// - .select() to return only needed fields
// - .populate() to avoid N+1 queries
// - .lean() to return plain objects (faster for read-only)
// - Promise.all() to run count and query in parallel
export const getPosts = async (req, res) => {
  try {
    // Get page and limit from query params (with defaults)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Calculate skip value
    const skip = (page - 1) * limit;

    // Run count and query in parallel for better performance
    const [posts, total] = await Promise.all([
      Post.find({ author: req.user._id })
        .select('title content author createdAt category status coverImage') // Only needed fields
        .populate('author', 'name email avatar')  // Avoid N+1: get author data in one query
        .sort({ createdAt: -1 }) // Newest first (uses index)
        .skip(skip)
        .limit(limit)
        .lean(), // Return plain objects instead of Mongoose documents (faster)
      Post.countDocuments({ author: req.user._id })
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching posts',
      error: error.message
    });
  }
};

// @desc    Get single post by ID - OPTIMIZED
// @route   GET /api/posts/:id
// @access  Private
// Performance note: Single item routes can return more fields since it's just one document
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email avatar'); // Populate author in one query (no N+1)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check ownership
    if (post.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this post'
      });
    }

    res.status(200).json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching post',
      error: error.message
    });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if post exists
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    // Check ownership - CRITICAL SECURITY CHECK
    if (post.author.toString() !== req.user._id.toString()) {
      const error = new Error('Not authorized to update this post');
      error.statusCode = 403;
      throw error;
    }

    // Update fields
    const { title, content, category, status, coverImage } = req.body;
    
    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (status) post.status = status;
    if (coverImage !== undefined) post.coverImage = coverImage; // Can be null to remove image

    // Save updated post
    const updatedPost = await post.save();

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: updatedPost
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if post exists
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    // Check ownership - CRITICAL SECURITY CHECK
    if (post.author.toString() !== req.user._id.toString()) {
      const error = new Error('Not authorized to delete this post');
      error.statusCode = 403;
      throw error;
    }

    // Delete the post
    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      data: { id: req.params.id }
    });

  } catch (error) {
    next(error);
  }
};
