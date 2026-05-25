import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { showToast } from '../services/toast';
import ImageUpload from '../components/ImageUpload';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Technology',
    status: 'draft'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [uploadError, setUploadError] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle image upload
  const handleUpload = async (formDataObj) => {
    setUploading(true);
    setUploadError('');
    
    try {
      // Send to backend /api/upload endpoint
      const response = await api.post('/api/upload', formDataObj, {
        headers: {
          // IMPORTANT: Set Content-Type to undefined so axios doesn't override it
          // The browser will automatically set it to multipart/form-data with the correct boundary
          'Content-Type': undefined
        }
      });

      if (response.data.success) {
        setUploadedImageUrl(response.data.data.url);
        showToast.success('Image uploaded successfully!');
        console.log('📤 Uploaded image URL:', response.data.data.url);
        // TODO: Consider orphaned uploads - if user changes image, old one remains on Cloudinary
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      const errorMsg = error.response?.data?.message || 'Image upload failed';
      setUploadError(errorMsg);
      showToast.error(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.content) {
      showToast.error('Title and content are required');
      return;
    }

    setIsLoading(true);

    try {
      // Include the uploaded image URL in the post data
      const postData = {
        ...formData,
        coverImage: uploadedImageUrl // Can be null if no image was uploaded
      };

      const response = await api.post('/api/posts', postData);
      
      if (response.data.success) {
        showToast.success('Post created successfully!');
        
        // Reset form
        setFormData({
          title: '',
          content: '',
          category: 'Technology',
          status: 'draft'
        });
        setUploadedImageUrl(null);
        setUploadError('');
        
        // Redirect to dashboard after successful creation
        navigate('/dashboard');
      }
    } catch (err) {
      showToast.apiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h1>Create New Post</h1>

        <form onSubmit={handleSubmit} style={formStyle}>
          {/* Title */}
          <div style={fieldStyle}>
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter post title"
              required
              style={inputStyle}
            />
          </div>

          {/* Content */}
          <div style={fieldStyle}>
            <label>Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your post content..."
              rows="10"
              required
              style={textareaStyle}
            />
          </div>

          {/* Category */}
          <div style={fieldStyle}>
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="Technology">Technology</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Travel">Travel</option>
              <option value="Food">Food</option>
            </select>
          </div>

          {/* Image Upload */}
          <div style={fieldStyle}>
            <ImageUpload onUpload={handleUpload} />
          </div>

          {/* Upload loading state */}
          {uploading && (
            <p style={{ color: '#007bff', fontWeight: '500' }}>📤 Uploading image, please wait...</p>
          )}

          {/* Upload error message */}
          {uploadError && (
            <p style={{ color: '#dc3545', fontWeight: '500' }}>
              ❌ {uploadError}
            </p>
          )}

          {/* Display uploaded image */}
          {uploadedImageUrl && (
            <div style={uploadedImageContainerStyle}>
              <p style={uploadedImageLabelStyle}>✅ Image uploaded:</p>
              <img 
                src={uploadedImageUrl} 
                alt="Cover image preview" 
                style={uploadedImageStyle}
              />
            </div>
          )}

          {/* Status */}
          <div style={fieldStyle}>
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || uploading}
            style={{
              ...buttonStyle,
              opacity: (isLoading || uploading) ? 0.7 : 1,
              cursor: (isLoading || uploading) ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Creating...' : uploading ? 'Uploading...' : 'Create Post'}
          </button>
        </form>
      </div>
    </div>
  );
};

const containerStyle = {
  minHeight: '100vh',
  padding: '2rem',
  backgroundColor: '#f5f5f5'
};

const formContainerStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem'
};

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
};

const inputStyle = {
  padding: '0.75rem',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '1rem',
  fontFamily: 'inherit'
};

const textareaStyle = {
  padding: '0.75rem',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '1rem',
  fontFamily: 'inherit',
  resize: 'vertical'
};

const buttonStyle = {
  padding: '0.75rem 1.5rem',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '1rem',
  cursor: 'pointer',
  fontWeight: '500',
  transition: 'background-color 0.3s'
};

const errorStyle = {
  padding: '1rem',
  backgroundColor: '#f8d7da',
  color: '#721c24',
  borderRadius: '4px',
  marginBottom: '1rem',
  border: '1px solid #f5c6cb'
};

const uploadedImageContainerStyle = {
  padding: '1rem',
  backgroundColor: '#e8f5e9',
  borderRadius: '6px',
  border: '2px solid #4caf50',
  textAlign: 'center'
};

const uploadedImageLabelStyle = {
  fontWeight: 'bold',
  color: '#2e7d32',
  marginBottom: '0.5rem',
  fontSize: '0.95rem'
};

const uploadedImageStyle = {
  width: '100%',
  maxWidth: '300px',
  height: 'auto',
  borderRadius: '4px',
  marginBottom: '0.5rem',
  border: '1px solid #ddd'
};

const uploadedUrlStyle = {
  fontSize: '0.8rem',
  color: '#666',
  wordBreak: 'break-all',
  margin: '0.5rem 0 0 0',
  fontFamily: 'monospace'
};

export default CreatePost;
