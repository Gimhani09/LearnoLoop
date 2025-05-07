import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../axiosConfig'; // Use the configured Axios instance

function PostForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState({ title: '', photoUrl: '', description: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (id) {
      axiosInstance.get(`/api/posts/${id}`) // Use the base URL from axiosConfig
        .then(response => setPost(response.data))
        .catch(error => console.error('Error fetching post:', error));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPost({ ...post, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate the photo URL
    if (!post.photoUrl || !post.photoUrl.startsWith('http')) {
      setErrorMessage('Please provide a valid direct image URL (e.g., starting with http or https).');
      setTimeout(() => setErrorMessage(''), 5000); // Clear error message after 5 seconds
      return;
    }

    console.log('Submitting post:', post); // Log the payload for debugging
    const request = id
      ? axiosInstance.put(`/api/posts/${id}`, post) // Use the base URL from axiosConfig
      : axiosInstance.post('/api/posts', post); // Use the base URL from axiosConfig

    request
      .then(() => {
        setSuccessMessage(id ? 'Post updated successfully!' : 'Post created successfully!');
        setTimeout(() => {
          setSuccessMessage('');
          navigate('/');
        }, 2000); // Redirect after 2 seconds
      })
      .catch(error => {
        console.error('Error creating/updating post:', error.response || error);
        const errorMsg = error.response?.data?.message || 'Failed to create/update post. Please try again.';
        setErrorMessage(errorMsg);
        setTimeout(() => setErrorMessage(''), 3000); // Clear error message after 3 seconds
      });
  };

  return (
    <div className="container">
      <h1>{id ? 'Edit Post' : 'Create Post'}</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Title:
          <input type="text" name="title" value={post.title} onChange={handleChange} required />
        </label>
        <label>
          Photo URL:
          <input
            type="text"
            name="photoUrl"
            value={post.photoUrl}
            onChange={handleChange}
            placeholder="Paste a direct image URL (e.g., https://example.com/image)"
            required
          />
        </label>
        {post.photoUrl && (
          <img
            src={post.photoUrl}
            alt="Preview"
            style={{ maxWidth: '100%', marginTop: '10px', borderRadius: '8px' }}
            onError={(e) => {
              e.target.src = 'https://dummyimage.com/150x150/cccccc/000000&text=No+Image'; // Fallback image
              e.target.alt = 'Image not available';
            }}
          />
        )}
        <label>
          Description:
          <textarea name="description" value={post.description} onChange={handleChange} required />
        </label>
        <button type="submit">{id ? 'Update' : 'Create'} Post</button>
      </form>
      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
}

export default PostForm;
