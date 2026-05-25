import { useState, useEffect } from 'react';

const ImageUpload = ({ onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');

  // Validate file type and size
  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return 'Please select an image file (JPEG, PNG, WebP, or GIF)';
    }

    if (file.size > maxSizeInBytes) {
      return `File is too large. Maximum size is 5MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
    }

    return null; // null means no error
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    // If user cancels the picker without selecting, files[0] will be undefined
    if (!file) return;

    // Clear previous errors
    setError('');

    // Validate the file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // Set the file and generate a preview
    setSelectedFile(file);

    // Revoke previous preview URL to prevent memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  // Clean up blob URLs when component unmounts or previewUrl changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle form submission
  const handleSubmit = () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    // Create FormData and append the file
    const formData = new FormData();
    formData.append('image', selectedFile); // 'image' must match upload.single('image') on the backend

    // Pass formData up to the parent component via the onUpload prop
    if (onUpload) {
      onUpload(formData);
    }
  };

  return (
    <div style={formStyle}>
      <div style={formGroupStyle}>
        <label htmlFor="image-input" style={labelStyle}>
          Upload Image
        </label>
        
        <input
          id="image-input"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          style={inputStyle}
        />

        {/* Display validation errors */}
        {error && (
          <p style={errorStyle}>
            ❌ {error}
          </p>
        )}

        {/* Display image preview */}
        {previewUrl && (
          <div style={previewContainerStyle}>
            <p style={previewLabelStyle}>Preview:</p>
            <img
              src={previewUrl}
              alt="Selected file preview"
              style={previewImageStyle}
            />
            <p style={fileSizeStyle}>
              File size: {(selectedFile.size / (1024 * 1024)).toFixed(2)}MB
            </p>
          </div>
        )}

        {/* Submit button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedFile || !!error}
          style={{
            ...buttonStyle,
            opacity: !selectedFile || !!error ? 0.5 : 1,
            cursor: !selectedFile || !!error ? 'not-allowed' : 'pointer'
          }}
        >
          {selectedFile ? '📤 Upload Image' : 'Select an Image First'}
        </button>
      </div>
    </div>
  );
};

// Styling
const formStyle = {
  width: '100%',
  marginBottom: '2rem'
};

const formGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem'
};

const labelStyle = {
  fontWeight: 'bold',
  fontSize: '1rem',
  color: '#333'
};

const inputStyle = {
  padding: '0.75rem',
  border: '2px solid #ddd',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.95rem'
};

const errorStyle = {
  color: '#dc3545',
  backgroundColor: '#f8d7da',
  padding: '0.75rem',
  borderRadius: '4px',
  borderLeft: '4px solid #dc3545',
  margin: '0.5rem 0'
};

const previewContainerStyle = {
  textAlign: 'center',
  padding: '1rem',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  border: '1px solid #eee'
};

const previewLabelStyle = {
  fontWeight: 'bold',
  marginBottom: '0.5rem',
  color: '#666'
};

const previewImageStyle = {
  width: '200px',
  height: '200px',
  objectFit: 'cover',
  borderRadius: '6px',
  marginBottom: '0.5rem',
  border: '2px solid #ddd'
};

const fileSizeStyle = {
  fontSize: '0.85rem',
  color: '#999',
  margin: '0.5rem 0 0 0'
};

const buttonStyle = {
  padding: '0.75rem 1.5rem',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '1rem',
  fontWeight: 'bold'
};

export default ImageUpload;
