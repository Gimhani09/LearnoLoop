import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    axiosInstance.get(`/api/posts/${id}`)
      .then(response => setPost(response.data))
      .catch(error => console.error(error));
  }, [id]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      axiosInstance.delete(`/api/posts/${id}`)
        .then(() => {
          alert('Post deleted successfully!');
          navigate('/'); // Redirect to the post list after deletion
        })
        .catch(error => {
          console.error('Error deleting post:', error);
          setErrorMessage('Failed to delete the post. Please try again.');
          setTimeout(() => setErrorMessage(''), 3000); // Clear error message after 3 seconds
        });
    }
  };

  if (!post) return <p>Loading...</p>;

  return (
    <div className="container">
      <h1>{post.title}</h1>
      {post.photoUrl ? (
        <img
          src={post.photoUrl}
          alt={post.title}
          style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '20px' }}
          onError={(e) => {
            e.target.src = 'https://dummyimage.com/150x150/cccccc/000000&text=No+Image'; // Fallback image
            e.target.alt = 'Image not available';
          }}
        />
      ) : (
        <p>No image available</p>
      )}
      <p>{post.description}</p>
      <div>
        <Link to={`/edit/${post.id}`}>
          <button style={{ marginRight: '10px' }}>Update</button>
        </Link>
        <button onClick={handleDelete} style={{ backgroundColor: 'red' }}>Delete</button>
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
}

export default PostDetails;
