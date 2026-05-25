import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { showToast } from '../services/toast';
import ImageUpload from '../components/ImageUpload';

const EditPost = () => {
  const { id } = useParams(); // Get post ID from URL
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    status: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Fetch post data when component mounts
  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await api.get(`/api/posts/${id}`);
      const post = response.data.data;
      
      // Pre-fill form with existing data
      setFormData({
        title: post.title,
        content: post.content,
        category: post.category,
        status: post.status
      });
      
      // Load existing cover image
      if (post.coverImage) {
        setCoverImageUrl(post.coverImage);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      showToast.apiError(err);
      setHasError(true);
      setIsLoading(false);
    }
  };

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
      const response = await api.post('/api/upload', formDataObj, {
        headers: {
          'Content-Type': undefined
        }
      });

      if (response.data.success) {
        setCoverImageUrl(response.data.data.url);
        showToast.success('Image uploaded successfully!');
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
    setIsSaving(true);

    try {
      const postData = {
        ...formData,
        coverImage: coverImageUrl
      };
      
      const response = await api.put(`/api/posts/${id}`, postData);
      
      if (response.data.success) {
        showToast.success('Post updated successfully!');
        // Redirect to dashboard after successful update
        navigate('/dashboard');
      }
    } catch (err) {
      showToast.apiError(err);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div style={loadingStyle}>Loading post...</div>;
  }

  if (hasError) {
    return <div style={errorPageStyle}>Failed to load post. Please try again.</div>;
  }

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h1>Edit Post</h1>

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
          {coverImageUrl && (
            <div style={uploadedImageContainerStyle}>
              <p style={uploadedImageLabelStyle}>✅ Image:</p>
              <img 
                src={coverImageUrl} 
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

          {/* Action Buttons */}
          <div style={buttonGroupStyle}>
            <button 
              type="button"
              onClick={() => navigate('/dashboard')}
              style={cancelButtonStyle}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              style={submitButtonStyle}
            >
              {isSaving ? 'Saving...' : 'Update Post'}
            </button>
          </div>
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

const buttonGroupStyle = {
  display: 'flex',
  gap: '1rem',
  justifyContent: 'flex-end'
};

const cancelButtonStyle = {
  padding: '0.75rem 1.5rem',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '1rem',
  cursor: 'pointer',
  fontWeight: '500'
};

const submitButtonStyle = {
  padding: '0.75rem 1.5rem',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '1rem',
  cursor: 'pointer',
  fontWeight: '500'
};

const errorStyle = {
  padding: '1rem',
  backgroundColor: '#f8d7da',
  color: '#721c24',
  borderRadius: '4px',
  marginBottom: '1rem',
  border: '1px solid #f5c6cb'
};

const loadingStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.1rem',
  color: '#666'
};

const errorPageStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  textAlign: 'center',
  color: '#721c24',
  backgroundColor: '#f8d7da'
};

const uploadedImageContainerStyle = {
  padding: '1rem',
  backgroundColor: '#e8f5e9',
  borderRadius: '4px',
  marginTop: '1rem',
  border: '1px solid #c8e6c9'
};

const uploadedImageLabelStyle = {
  margin: '0 0 0.5rem 0',
  fontWeight: '600',
  color: '#2e7d32'
};

const uploadedImageStyle = {
  width: '100%',
  maxHeight: '200px',
  objectFit: 'cover',
  borderRadius: '4px'
};

export default EditPost;
