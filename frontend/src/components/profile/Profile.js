import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Image } from 'react-bootstrap';
import axios from 'axios';

const Profile = () => {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    fullName: '',
    bio: '',
    profilePicture: '',
    followersCount: 0,
    followingCount: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
    } catch (err) {
      setError('Failed to fetch profile');
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:8080/api/profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <Container>
      <Row className="mt-4">
        <Col md={8} className="mx-auto">
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <Image
                  src={profile.profilePicture || 'https://via.placeholder.com/150'}
                  roundedCircle
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
              </div>

              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              {isEditing ? (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Bio</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="bio"
                      value={profile.bio}
                      onChange={handleChange}
                      rows={3}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Profile Picture URL</Form.Label>
                    <Form.Control
                      type="text"
                      name="profilePicture"
                      value={profile.profilePicture}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <div className="d-grid gap-2">
                    <Button variant="primary" type="submit">
                      Save Changes
                    </Button>
                    <Button variant="outline-secondary" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </Form>
              ) : (
                <>
                  <h3 className="text-center mb-3">{profile.fullName || profile.username}</h3>
                  <p className="text-center text-muted mb-4">{profile.bio || 'No bio yet'}</p>
                  <div className="d-flex justify-content-center gap-4 mb-4">
                    <div className="text-center">
                      <h5>{profile.followersCount}</h5>
                      <small className="text-muted">Followers</small>
                    </div>
                    <div className="text-center">
                      <h5>{profile.followingCount}</h5>
                      <small className="text-muted">Following</small>
                    </div>
                  </div>
                  <div className="d-grid">
                    <Button variant="outline-primary" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile; 