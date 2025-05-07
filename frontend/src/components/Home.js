import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
  const isAuthenticated = localStorage.getItem('token');

  return (
    <Container>
      <Row className="mt-5">
        <Col md={8} className="mx-auto text-center">
          <h1 className="display-4 mb-4">Welcome to Skill Share</h1>
          <p className="lead mb-4">
            Share your skills, learn from others, and take quizzes to test your knowledge.
            Join our community of learners and experts today!
          </p>
          {!isAuthenticated && (
            <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
              <Button as={Link} to="/register" variant="primary" size="lg" className="px-4 me-sm-3">
                Get Started
              </Button>
              <Button as={Link} to="/login" variant="outline-primary" size="lg" className="px-4">
                Login
              </Button>
            </div>
          )}
        </Col>
      </Row>

      <Row className="mt-5">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <i className="fas fa-share-alt fa-3x mb-3 text-primary"></i>
              <Card.Title>Share Skills</Card.Title>
              <Card.Text>
                Share your expertise with others and help them learn new skills.
                Create detailed tutorials and guides.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <i className="fas fa-graduation-cap fa-3x mb-3 text-primary"></i>
              <Card.Title>Learn from Others</Card.Title>
              <Card.Text>
                Discover new skills and knowledge from our community of experts.
                Follow your favorite teachers and stay updated.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <i className="fas fa-question-circle fa-3x mb-3 text-primary"></i>
              <Card.Title>Take Quizzes</Card.Title>
              <Card.Text>
                Test your knowledge with interactive quizzes.
                Track your progress and earn achievements.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {isAuthenticated && (
        <Row className="mt-5">
          <Col className="text-center">
            <Button as={Link} to="/skills" variant="primary" size="lg" className="px-5">
              Explore Skills
            </Button>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Home; 