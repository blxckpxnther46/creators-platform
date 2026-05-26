import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      minlength: [10, 'Content must be at least 10 characters']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      enum: ['Technology', 'Lifestyle', 'Travel', 'Food'],
      default: 'Technology'
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft'
    },
    coverImage: {
      type: String,
      default: null
    }
  },
  { 
    timestamps: true // Adds createdAt and updatedAt
  }
);

// Add indexes for frequently queried and sorted fields
// Single-field indexes
postSchema.index({ author: 1 });      // Filter by author
postSchema.index({ createdAt: -1 });  // Sort by creation date

// Compound index: filter by author + sort by creation date
// This optimizes queries that filter by author and sort by createdAt
postSchema.index({ author: 1, createdAt: -1 });

const Post = mongoose.model('Post', postSchema);

export default Post;
