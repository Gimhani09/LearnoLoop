import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig'; // Use the configured Axios instance

function PostList() {
  const [posts, setPosts] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    axiosInstance.get('/api/posts') // Use the base URL from axiosConfig
      .then(response => setPosts(response.data))
      .catch(error => console.error('Error fetching posts:', error));
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      axiosInstance.delete(`/api/posts/${id}`)
        .then(() => {
          alert('Post deleted successfully!');
          fetchPosts(); // Refresh the post list after deletion
        })
        .catch(error => {
          console.error('Error deleting post:', error);
          setErrorMessage('Failed to delete the post. Please try again.');
          setTimeout(() => setErrorMessage(''), 3000); // Clear error message after 3 seconds
        });
    }
  };

  return (
    <div className="container">
      <h1>Posts</h1>
      <Link to="/create">
        <button>Create New Post</button>
      </Link>
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            <Link to={`/posts/${post.id}`}>
              <img
                src={post.photoUrl || 'https://dummyimage.com/150x150/cccccc/000000&text=No+Image'}
                alt={post.title}
                style={{ width: '50px', height: '50px', marginRight: '10px', borderRadius: '5px' }}
                onError={(e) => {
                  e.target.src = 'https://dummyimage.com/150x150/cccccc/000000&text=No+Image'; // Fallback image
                  e.target.alt = 'Image not available';
                }}
              />
              {post.title}
            </Link>
            <div style={{ marginTop: '10px' }}>
              <Link to={`/edit/${post.id}`}>
                <button style={{ marginRight: '10px' }}>Update</button>
              </Link>
              <button
                onClick={() => handleDelete(post.id)}
                style={{ backgroundColor: 'red', color: 'white' }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
}

export default PostList;
