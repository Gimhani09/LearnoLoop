import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Modal } from 'react-bootstrap';
import axios from 'axios';

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSkill, setNewSkill] = useState({
    title: '',
    description: '',
    category: '',
    level: 'BEGINNER'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/skills', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSkills(response.data);
    } catch (err) {
      setError('Failed to fetch skills');
    }
  };

  const handleChange = (e) => {
    setNewSkill({
      ...newSkill,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/skills', newSkill, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Skill added successfully');
      setShowAddModal(false);
      setNewSkill({
        title: '',
        description: '',
        category: '',
        level: 'BEGINNER'
      });
      fetchSkills();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add skill');
    }
  };

  const getLevelBadge = (level) => {
    const colors = {
      BEGINNER: 'success',
      INTERMEDIATE: 'warning',
      ADVANCED: 'danger',
      EXPERT: 'primary'
    };
    return (
      <span className={`badge bg-${colors[level]}`}>
        {level.charAt(0) + level.slice(1).toLowerCase()}
      </span>
    );
  };

  return (
    <Container>
      <Row className="mt-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Skills</h1>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              Add New Skill
            </Button>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <Row>
            {skills.map((skill) => (
              <Col key={skill.id} md={4} className="mb-4">
                <Card>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title>{skill.title}</Card.Title>
                      {getLevelBadge(skill.level)}
                    </div>
                    <Card.Subtitle className="mb-2 text-muted">{skill.category}</Card.Subtitle>
                    <Card.Text>{skill.description}</Card.Text>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        {skill.followersCount} followers
                      </small>
                      <Button variant="outline-primary" size="sm">
                        Follow
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Skill</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={newSkill.title}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={newSkill.description}
                onChange={handleChange}
                rows={3}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                name="category"
                value={newSkill.category}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Level</Form.Label>
              <Form.Select
                name="level"
                value={newSkill.level}
                onChange={handleChange}
                required
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </Form.Select>
            </Form.Group>
            <div className="d-grid gap-2">
              <Button variant="primary" type="submit">
                Add Skill
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Skills; 