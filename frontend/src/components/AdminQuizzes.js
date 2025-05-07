import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Chip,
  Switch, CircularProgress, Alert, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

const AdminQuizzes = ({ user }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [toggleLoading, setToggleLoading] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  const navigate = useNavigate();
  
  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);
  
  // Load quizzes
  useEffect(() => {
    fetchQuizzes();
  }, []);
  
  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      // Use the admin-specific endpoint to get all quizzes including unpublished ones
      const response = await api.get('/quizzes/admin');
      if (response?.data) {
        console.log("Fetched quizzes:", response.data);
        setQuizzes(response.data);
      }
    } catch (err) {
      console.error("Error fetching quizzes:", err);
      setError("Failed to load quizzes. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle quiz published status
  const handleTogglePublished = async (quizId, currentStatus) => {
    setToggleLoading({ ...toggleLoading, [quizId]: true });
    try {
      const newStatus = !currentStatus;
      let response;
      
      if (newStatus) {
        // Publish quiz
        response = await api.publishQuiz(quizId);
        console.log("Publish response:", response);
      } else {
        // Unpublish quiz
        response = await api.unpublishQuiz(quizId);
        console.log("Unpublish response:", response);
      }
      
      if (response?.data) {
        // Update the quiz in the state with the returned data if available
        if (response.data.quiz) {
          setQuizzes(prevQuizzes => prevQuizzes.map(quiz => 
            quiz.id === quizId ? response.data.quiz : quiz
          ));
        } else {
          // Otherwise just update the isPublished status
          setQuizzes(prevQuizzes => prevQuizzes.map(quiz => 
            quiz.id === quizId ? { ...quiz, isPublished: newStatus } : quiz
          ));
        }
        
        setSuccessMessage(`Quiz ${newStatus ? 'published' : 'unpublished'} successfully`);
        
        // Clear success message after delay
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (err) {
      console.error("Error toggling quiz status:", err);
      // Show a more descriptive error message
      let errorMsg = `Failed to ${currentStatus ? 'unpublish' : 'publish'} quiz`;
      
      // Extract error message from response if available
      if (err.response && err.response.data && err.response.data.error) {
        errorMsg += `: ${err.response.data.error}`;
      } else if (err.message) {
        errorMsg += `: ${err.message}`;
      } else {
        errorMsg += `. Please try again.`;
      }
      
      setError(errorMsg);
      
      // Clear error after delay
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setToggleLoading({ ...toggleLoading, [quizId]: false });
    }
  };
  
  // Handle confirm delete dialog
  const handleOpenDeleteConfirm = (quizId) => {
    setConfirmDelete(quizId);
  };
  
  const handleCloseDeleteConfirm = () => {
    setConfirmDelete(null);
  };
  
  // Delete quiz
  const handleDeleteQuiz = async () => {
    if (!confirmDelete) return;
    
    try {
      const response = await api.deleteQuiz(confirmDelete);
      console.log("Delete response:", response);
      
      if (response?.data?.success) {
        // Remove quiz from the state
        setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.id !== confirmDelete));
        
        setSuccessMessage("Quiz deleted successfully");
        
        // Clear success message after delay
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        throw new Error("Failed to delete quiz. Server did not confirm success.");
      }
    } catch (err) {
      console.error("Error deleting quiz:", err);
      // Show a more descriptive error message
      let errorMsg = "Failed to delete quiz";
      
      // Extract error message from response if available
      if (err.response && err.response.data && err.response.data.error) {
        errorMsg += `: ${err.response.data.error}`;
      } else if (err.message) {
        errorMsg += `: ${err.message}`;
      } else {
        errorMsg += `. Please try again.`;
      }
      
      setError(errorMsg);
      
      // Clear error after delay
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setConfirmDelete(null);
    }
  };
  
  // Create new quiz
  const handleCreateQuiz = () => {
    navigate('/admin/quizzes/create');
  };
  
  // Edit quiz
  const handleEditQuiz = (quizId) => {
    navigate(`/admin/quizzes/edit/${quizId}`);
  };
  
  // View quiz stats
  const handleViewStats = (quizId) => {
    navigate(`/admin/quizzes/stats/${quizId}`);
  };
  
  // Render loading state
  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading quizzes...
        </Typography>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Manage Quizzes
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateQuiz}
        >
          Create New Quiz
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}
      
      {quizzes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Quizzes Found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            You haven't created any quizzes yet.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateQuiz}
          >
            Create Your First Quiz
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Questions</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Time Limit</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Pass Score</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Published</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quizzes.map((quiz) => (
                <TableRow key={quiz.id} hover>
                  <TableCell component="th" scope="row">
                    <Typography variant="body1" fontWeight="medium">
                      {quiz.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {quiz.description.substring(0, 60)}...
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={quiz.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  
                  <TableCell align="center">
                    <Tooltip title="Number of questions">
                      <Chip
                        icon={<QuestionMarkIcon />}
                        label={quiz.questions.length}
                        size="small"
                      />
                    </Tooltip>
                  </TableCell>
                  
                  <TableCell align="center">
                    {quiz.timeLimit > 0 ? (
                      <Chip
                        icon={<AccessTimeIcon />}
                        label={`${quiz.timeLimit} min`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No limit
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight="medium">
                      {quiz.passingScore}%
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="center">
                    <Switch
                      checked={quiz.isPublished}
                      onChange={() => handleTogglePublished(quiz.id, quiz.isPublished)}
                      color="success"
                      disabled={toggleLoading[quiz.id]}
                      icon={<VisibilityOffIcon fontSize="small" />}
                      checkedIcon={<VisibilityIcon fontSize="small" />}
                    />
                    
                    {toggleLoading[quiz.id] && <CircularProgress size={16} sx={{ ml: 1 }} />}
                  </TableCell>
                  
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Tooltip title="Edit Quiz">
                        <IconButton
                          color="primary"
                          onClick={() => handleEditQuiz(quiz.id)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Delete Quiz">
                        <IconButton
                          color="error"
                          onClick={() => handleOpenDeleteConfirm(quiz.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="View Statistics">
                        <IconButton
                          color="info"
                          onClick={() => handleViewStats(quiz.id)}
                        >
                          <AssessmentIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={confirmDelete !== null}
        onClose={handleCloseDeleteConfirm}
      >
        <DialogTitle>Delete Quiz</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this quiz? All associated data including user attempts will be permanently deleted. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button onClick={handleDeleteQuiz} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminQuizzes;