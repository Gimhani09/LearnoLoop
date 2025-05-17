import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar, Form } from 'react-bootstrap';
import axios from 'axios';

const Quiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/quizzes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuizzes(response.data);
    } catch (err) {
      setError('Failed to fetch quizzes');
    }
  };

  const startQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setScore(null);
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitQuiz = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:8080/api/quizzes/${selectedQuiz.id}/submit`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setScore(response.data);
      setSelectedQuiz(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  const getProgress = () => {
    if (!selectedQuiz) return 0;
    return ((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100;
  };

  if (score) {
    return (
      <Container>
        <Row className="justify-content-center mt-5">
          <Col md={6}>
            <Card>
              <Card.Body className="text-center">
                <h2>Quiz Results</h2>
                <div className="display-4 mb-4">{score.score}%</div>
                <p className="mb-4">
                  You answered {score.correctAnswers} out of {score.totalQuestions} questions correctly.
                </p>
                <Button variant="primary" onClick={() => setScore(null)}>
                  Take Another Quiz
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  if (selectedQuiz) {
    const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
    return (
      <Container>
        <Row className="mt-4">
          <Col>
            <Card>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3>{selectedQuiz.title}</h3>
                  <div className="text-muted">
                    Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
                  </div>
                </div>
                <ProgressBar now={getProgress()} className="mb-4" />
                <h4 className="mb-4">{currentQuestion.text}</h4>
                <Form>
                  {currentQuestion.options.map((option, index) => (
                    <Form.Check
                      key={index}
                      type="radio"
                      id={`option-${index}`}
                      name="answer"
                      label={option}
                      checked={answers[currentQuestion.id] === option}
                      onChange={() => handleAnswer(currentQuestion.id, option)}
                      className="mb-3"
                    />
                  ))}
                </Form>
                <div className="d-flex justify-content-between mt-4">
                  <Button
                    variant="outline-primary"
                    onClick={previousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>
                  {currentQuestionIndex === selectedQuiz.questions.length - 1 ? (
                    <Button
                      variant="primary"
                      onClick={submitQuiz}
                      disabled={!answers[currentQuestion.id] || loading}
                    >
                      {loading ? 'Submitting...' : 'Submit Quiz'}
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={nextQuestion}
                      disabled={!answers[currentQuestion.id]}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mt-4">
        <Col>
          <h1 className="mb-4">Available Quizzes</h1>
          {error && <div className="alert alert-danger">{error}</div>}
          <Row>
            {quizzes.map((quiz) => (
              <Col key={quiz.id} md={4} className="mb-4">
                <Card>
                  <Card.Body>
                    <Card.Title>{quiz.title}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      {quiz.questions.length} questions
                    </Card.Subtitle>
                    <Card.Text>{quiz.description}</Card.Text>
                    <Button variant="primary" onClick={() => startQuiz(quiz)}>
                      Start Quiz
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Quiz; 