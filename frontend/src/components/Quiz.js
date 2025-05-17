import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, Typography, Box, Paper, Button, CircularProgress, Stepper,
  Step, StepLabel, StepContent, Radio, RadioGroup, FormControlLabel, FormControl,
  FormLabel, Checkbox, FormGroup, Alert, Dialog, DialogTitle, DialogContent, 
  DialogContentText, DialogActions, LinearProgress, Divider, Chip, useTheme, useMediaQuery,
  Avatar, alpha
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import QuizIcon from '@mui/icons-material/Quiz';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import BadgeNotification from './BadgeNotification';
import { useNotification } from '../context/NotificationContext';

const Quiz = ({ user }) => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { notifySuccess, notifyError, notifyInfo, notifyWarning } = useNotification();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [badgeDialogOpen, setBadgeDialogOpen] = useState(false);
  const [newBadges, setNewBadges] = useState([]);
  const [questionHovered, setQuestionHovered] = useState(null);
  
  const timerRef = useRef(null);
  
  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/quiz/${quizId}`, message: 'You must be logged in to take quizzes.' } });
    }
  }, [user, quizId, navigate]);
  
  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.getQuizById(quizId);
        
        if (response?.data) {
          setQuiz(response.data);
          
          // Initialize answers object
          const initialAnswers = {};
          response.data.questions.forEach((question, index) => {
            if (question.type === 'MULTIPLE_CHOICE') {
              initialAnswers[index] = null;
            } else if (question.type === 'MULTIPLE_ANSWER') {
              initialAnswers[index] = [];
            }
          });
          setAnswers(initialAnswers);
          
          // Set timer if quiz has a time limit
          if (response.data.timeLimit > 0) {
            setTimeLeft(response.data.timeLimit * 60); // Convert to seconds
          }
        }
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("Failed to load quiz. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuiz();
    
    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizId]);
  
  // Handle timer
  useEffect(() => {
    // Clear any existing timer before setting up a new one
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (quizStarted && timeLeft !== null && !quizSubmitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            // Time's up - submit the quiz
            clearInterval(timerRef.current);
            timerRef.current = null;
            notifyWarning("Time's up! Your quiz has been automatically submitted.");
            // Use setTimeout to avoid state update during render cycle
            setTimeout(() => {
              handleSubmitQuiz();
            }, 0);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [quizStarted, quizSubmitted]);
  
  // Format time for display (MM:SS)
  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Format time for human-readable display
  const formatTimeTaken = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    if (mins === 0) {
      return `${secs} second${secs !== 1 ? 's' : ''}`;
    } else if (secs === 0) {
      return `${mins} minute${mins !== 1 ? 's' : ''}`;
    } else {
      return `${mins} minute${mins !== 1 ? 's' : ''} ${secs} second${secs !== 1 ? 's' : ''}`;
    }
  };

  // Start the quiz
  const handleStartQuiz = async () => {
    try {
      // Create a new quiz attempt
      const response = await api.startQuizAttempt(quizId);
      if (response?.data) {
        setAttemptId(response.data.attemptId);
        setQuizStarted(true);
        notifyInfo(`Quiz "${quiz.title}" started! ${quiz.timeLimit > 0 ? `You have ${quiz.timeLimit} minutes to complete it.` : 'Take your time to answer all questions.'}`);
      }
    } catch (err) {
      console.error("Error starting quiz:", err);
      setError("Failed to start quiz. Please try again.");
      notifyError("Failed to start quiz. Please try again.");
    }
  };
  
  // Handle radio button change (single choice)
  const handleSingleAnswerChange = (event, questionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: event.target.value
    }));
  };
  
  // Handle checkbox change (multiple choice)
  const handleMultipleAnswerChange = (event, questionIndex, optionIndex) => {
    const { checked } = event.target;
    setAnswers(prev => {
      const currentAnswers = [...(prev[questionIndex] || [])];
      
      if (checked) {
        if (!currentAnswers.includes(optionIndex.toString())) {
          currentAnswers.push(optionIndex.toString());
        }
      } else {
        const index = currentAnswers.indexOf(optionIndex.toString());
        if (index !== -1) {
          currentAnswers.splice(index, 1);
        }
      }
      
      return {
        ...prev,
        [questionIndex]: currentAnswers
      };
    });
  };
  
  // Move to next question
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  // Move to previous question
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Jump to specific question
  const goToQuestion = (index) => {
    setActiveStep(index);
  };
  
  // Open submit confirmation dialog
  const handleConfirmSubmit = () => {
    const unansweredCount = Object.keys(answers).filter(qIndex => {
      const answer = answers[qIndex];
      return answer === null || (Array.isArray(answer) && answer.length === 0);
    }).length;
    
    if (unansweredCount > 0) {
      // Show different message when there are unanswered questions
      setConfirmSubmit(true);
    } else {
      // All questions answered, just submit
      handleSubmitQuiz();
    }
  };
  
  // Submit quiz and calculate results
  const handleSubmitQuiz = async () => {
    setConfirmSubmit(false);
    
    try {
      // Convert answers to the format expected by the API
      const formattedAnswers = Object.entries(answers).map(([questionIndex, answer]) => {
        const qIndex = parseInt(questionIndex);
        
        // Ensure we always have an array of valid selections
        let selectedOptions = [];
        if (answer !== null) {
          if (Array.isArray(answer)) {
            // Multiple answer question
            selectedOptions = [...answer]; 
          } else {
            // Single answer question
            selectedOptions = [answer];
          }
          // Filter out any null or undefined values
          selectedOptions = selectedOptions.filter(option => option !== null && option !== undefined);
        }
        
        return {
          questionIndex: qIndex,
          selectedOptions: selectedOptions,
          questionId: quiz.questions[qIndex].id 
        };
      });
      
      // Stop timer before API call to prevent race conditions
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Submit answers to API
      const response = await api.submitQuizAttempt(attemptId, formattedAnswers);
      
      if (response?.data) {
        console.log("Quiz result data:", response.data);
        setQuizSubmitted(true);
        setQuizResult(response.data);
        
        // Show appropriate notification based on result
        if (response.data.passed) {
          notifySuccess(`Congratulations! You passed with a score of ${response.data.score}%`);
        } else {
          notifyInfo(`Quiz completed with a score of ${response.data.score}%. Keep practicing!`);
        }
        
        // Check for new badges
        if (response.data.newBadges && response.data.newBadges.length > 0) {
          setNewBadges(response.data.newBadges);
          setTimeout(() => {
            setBadgeDialogOpen(true);
          }, 1000); // Show after a short delay to let user see results first
        }
      }
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError("Failed to submit quiz. Please try again.");
      notifyError("There was a problem submitting your quiz. Please try again.");
    }
  };
  
  // Handle quit quiz confirmation
  const handleConfirmQuit = () => {
    setConfirmQuit(true);
  };
  
  // Quit quiz and navigate back
  const handleQuitQuiz = () => {
    notifyWarning("You have quit the quiz. Your progress has been discarded.");
    navigate('/quizzes');
  };
  
  // Calculate progress percentage
  const calculateProgress = () => {
    const totalQuestions = quiz?.questions?.length || 0;
    const answeredQuestions = Object.values(answers).filter(answer => {
      return answer !== null && (!Array.isArray(answer) || answer.length > 0);
    }).length;
    
    return Math.round((answeredQuestions / totalQuestions) * 100);
  };

  // Handle badge dialog close
  const handleBadgeDialogClose = () => {
    setBadgeDialogOpen(false);
  };

  // Render quiz results screen
  if (quizSubmitted && quizResult) {
    // Calculate fallback values if backend doesn't provide them
    const correctAnswers = quizResult.correctAnswers !== undefined ? quizResult.correctAnswers : Math.round((quizResult.score / 100) * quiz.questions.length);
    const totalQuestions = quiz.questions.length;
    const incorrectAnswers = quizResult.incorrectAnswers !== undefined ? quizResult.incorrectAnswers : totalQuestions - correctAnswers;
    
    // Format time taken in a readable format
    const displayTimeTaken = quizResult.timeTaken || 
                            (quizResult.timeSpent ? formatTimeTaken(quizResult.timeSpent) : "N/A");
    
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper 
          elevation={4} 
          sx={{ 
            p: { xs: 3, sm: 4 }, 
            borderRadius: 2,
            border: quizResult.passed ? '2px solid #4caf50' : '2px solid #f5f5f5'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold', 
                color: quizResult.passed ? 'success.main' : 'primary.main',
                mb: 2
              }}
            >
              Quiz Completed
            </Typography>
            
            {quizResult.passed ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    mb: 2,
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: 'success.light',
                    width: 110,
                    height: 110,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(76, 175, 80, 0.2)'
                  }}
                >
                  <CheckCircleOutlineIcon sx={{ fontSize: 70, color: 'success.main' }} />
                </Box>
                <Typography variant="h5" color="success.main" gutterBottom fontWeight="bold">
                  Congratulations!
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  You passed the quiz with a score of <strong>{quizResult.score}%</strong>
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    mb: 2,
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: 'error.light',
                    width: 110,
                    height: 110,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(211, 47, 47, 0.2)'
                  }}
                >
                  <ErrorOutlineIcon sx={{ fontSize: 70, color: 'error.main' }} />
                </Box>
                <Typography variant="h5" color="error.main" gutterBottom fontWeight="bold">
                  Almost there!
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  You scored <strong>{quizResult.score}%</strong>. The passing score is <strong>{quiz.passingScore}%</strong>
                </Typography>
              </Box>
            )}
          </Box>
          
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' }, 
              mb: 3,
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 1,
              border: '1px solid #e0e0e0'
            }}
          >
            <Box sx={{ mb: { xs: 2, sm: 0 } }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Quiz: <span style={{ color: '#2196f3' }}>{quiz.title}</span>
              </Typography>
              <Chip 
                label={quiz.category} 
                color="primary"
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" fontWeight="medium">
                  Time taken: {displayTimeTaken}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Completed: {new Date(quizResult.completedAt).toLocaleString()}
              </Typography>
            </Box>
          </Box>
          
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 3, 
              mb: 3, 
              bgcolor: 'background.paper'
            }}
          >
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: { xs: 2, md: 3 },
              textAlign: 'center'
            }}>
              <Box>
                <Box 
                  sx={{ 
                    py: 2,
                    px: 1,
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    color: 'white'
                  }}
                >
                  <Typography variant="h5" fontWeight="bold">
                    {quizResult.score}%
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Overall Score
                  </Typography>
                </Box>
              </Box>
              
              <Box>
                <Box 
                  sx={{ 
                    py: 2,
                    px: 1,
                    borderRadius: 2,
                    bgcolor: 'success.main',
                    color: 'white'
                  }}
                >
                  <Typography variant="h5" fontWeight="bold">
                    {correctAnswers}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Correct Answers
                  </Typography>
                </Box>
              </Box>
              
              <Box>
                <Box 
                  sx={{ 
                    py: 2,
                    px: 1,
                    borderRadius: 2,
                    bgcolor: 'error.main',
                    color: 'white'
                  }}
                >
                  <Typography variant="h5" fontWeight="bold">
                    {incorrectAnswers}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Incorrect Answers
                  </Typography>
                </Box>
              </Box>
              
              <Box>
                <Box 
                  sx={{ 
                    py: 2,
                    px: 1,
                    borderRadius: 2,
                    bgcolor: 'info.main',
                    color: 'white'
                  }}
                >
                  <Typography variant="h5" fontWeight="bold">
                    {totalQuestions}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Total Questions
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Performance visualization */}
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed #e0e0e0' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                Performance Breakdown
              </Typography>
              <Box sx={{ position: 'relative', height: 25, bgcolor: '#f5f5f5', borderRadius: 1, overflow: 'hidden' }}>
                <Box 
                  sx={{ 
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${(correctAnswers / totalQuestions) * 100}%`,
                    bgcolor: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {Math.round((correctAnswers / totalQuestions) * 100)}%
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="caption">0%</Typography>
                <Typography variant="caption">100%</Typography>
              </Box>
            </Box>
          </Paper>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 2, mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/quizzes')}
              startIcon={<QuizIcon />}
              size="large"
              fullWidth={window.innerWidth < 600}
            >
              All Quizzes
            </Button>
            
            <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate(`/quiz/${quizId}/review/${attemptId}`)}
                fullWidth={window.innerWidth < 600}
              >
                Review Answers
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/quiz/${quizId}`)}
                fullWidth={window.innerWidth < 600}
              >
                Take Again
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Badge notification dialog */}
        <BadgeNotification 
          open={badgeDialogOpen}
          onClose={handleBadgeDialogClose}
          badges={newBadges}
        />
      </Container>
    );
  }
  // Render loading state
  if (loading) {
    return (
      <Container 
        sx={{ 
          py: { xs: 6, md: 8 }, 
          textAlign: 'center',
          px: isMobile ? 2 : undefined
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 6,
            opacity: 0.8
          }}
          className="fade-in"
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3
            }}
          >
            <CircularProgress thickness={4} size={40} sx={{ color: 'var(--primary-color)' }} />
          </Box>
          
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 500,
              color: 'var(--text-secondary)'
            }}
          >
            Preparing your learning quiz...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mt: 1 }}>
            Loading questions and setting up the quiz environment
          </Typography>
        </Box>
      </Container>
    );
  }
  
  // Render error state
  if (error || !quiz) {
    return (
      <Container sx={{ py: 6, px: isMobile ? 2 : undefined }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            maxWidth: 600,
            mx: 'auto'
          }}
          className="fade-in"
        >
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              mb: 2
            }}
          >
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: 'error.main',
                mr: 2,
                width: 48,
                height: 48
              }}
            >
              <ErrorOutlineIcon fontSize="medium" />
            </Avatar>
            <Typography variant="h5" fontWeight={600} color="error.main">
              Quiz Error
            </Typography>
          </Box>
          
          <Typography 
            variant="body1" 
            paragraph
            sx={{ 
              fontSize: '1rem',
              mb: 3
            }}
          >
            {error || "We couldn't load this quiz. It may have been removed or you don't have permission to access it."}
          </Typography>
          
          <Button 
            variant="outlined" 
            onClick={() => navigate('/quizzes')}
            startIcon={<ArrowBackOutlinedIcon />}
            className="btn-secondary"
            sx={{ 
              borderRadius: 'var(--radius-md)', 
              textTransform: 'none',
              fontWeight: 500,
              px: 3
            }}
          >
            Back to Quizzes
          </Button>
        </Paper>
      </Container>
    );
  }
    // Render quiz intro screen
  if (!quizStarted) {
    return (
      <Container 
        maxWidth="md" 
        sx={{ 
          py: { xs: 4, md: 6 },
          px: isMobile ? 2 : undefined 
        }}
      >
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '1px solid var(--border-light)'
          }}
          className="fade-in"
        >
          {/* Quiz header with gradient background based on category */}
          <Box 
            sx={{
              py: 4,
              px: { xs: 3, md: 5 },
              background: quiz.category === "Programming" ? 
                'linear-gradient(45deg, #4A00E0, #8E2DE2)' : 
                quiz.category === "Mathematics" ?
                'linear-gradient(45deg, #1E88E5, #64B5F6)' :
                quiz.category === "Science" ?
                'linear-gradient(45deg, #00BFA5, #69F0AE)' :
                quiz.category === "Language" ?
                'linear-gradient(45deg, #FF5722, #FF8A65)' :
                quiz.category === "History" ?
                'linear-gradient(45deg, #FFC107, #FFE082)' :
                quiz.category === "Art" ?
                'linear-gradient(45deg, #E91E63, #F48FB1)' :
                quiz.category === "Business" ?
                'linear-gradient(45deg, #3949AB, #7986CB)' :
                quiz.category === "Data Science" ?
                'linear-gradient(45deg, #00ACC1, #4DD0E1)' :
                'linear-gradient(45deg, #6200EA, #B388FF)',
              color: 'white',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}
            >
              <QuizOutlinedIcon sx={{ fontSize: 40 }} />
            </Avatar>
            
            <Chip
              label={quiz.category}
              size="small"
              sx={{
                position: 'absolute',
                top: 20,
                right: 20,
                bgcolor: 'rgba(255,255,255,0.15)',
                color: 'white',
                backdropFilter: 'blur(10px)',
                fontWeight: 500,
                px: 1
              }}
            />
            
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                fontSize: { xs: '1.75rem', md: '2.25rem' }
              }}
            >
              {quiz.title}
            </Typography>
          </Box>
          
          <Box sx={{ p: { xs: 3, md: 5 } }}>
            <Typography 
              variant="body1" 
              paragraph
              sx={{
                fontSize: '1rem',
                lineHeight: 1.6,
                color: 'var(--text-secondary)'
              }}
            >
              {quiz.description}
            </Typography>
            
            <Divider sx={{ my: 3, borderColor: 'var(--border-light)' }} />
            
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: 3,
                mb: 4
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  bgcolor: 'var(--surface-bg)'
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    mb: 1.5
                  }}
                >
                  <QuizOutlinedIcon />
                </Avatar>
                <Typography 
                  variant="h5" 
                  fontWeight={600}
                  sx={{ mb: 0.5 }}
                >
                  {quiz.questions.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Questions Total
                </Typography>
              </Box>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  bgcolor: 'var(--surface-bg)'
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    color: 'info.main',
                    mb: 1.5
                  }}
                >
                  <TimerOutlinedIcon />
                </Avatar>
                <Typography 
                  variant="h5" 
                  fontWeight={600}
                  sx={{ mb: 0.5 }}
                >
                  {quiz.timeLimit > 0 ? quiz.timeLimit : '∞'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {quiz.timeLimit > 0 ? 'Minutes' : 'No Time Limit'}
                </Typography>
              </Box>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border-light)',
                  bgcolor: 'var(--surface-bg)'
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: 'success.main',
                    mb: 1.5
                  }}
                >
                  <FlagOutlinedIcon />
                </Avatar>
                <Typography 
                  variant="h5" 
                  fontWeight={600}
                  sx={{ mb: 0.5 }}
                >
                  {quiz.passingScore}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Passing Score
                </Typography>
              </Box>
            </Box>
            
            <Alert 
              severity="info" 
              variant="outlined"
              sx={{ 
                mb: 4,
                borderRadius: 'var(--radius-md)',
                '& .MuiAlert-icon': {
                  alignItems: 'center'
                }
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Quiz Instructions
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, lineHeight: 1.6 }}>
                • Once you start, you must complete the quiz in one session<br />
                • {quiz.timeLimit > 0 ? 
                    `You will have ${quiz.timeLimit} minutes to complete all ${quiz.questions.length} questions` : 
                    'There is no time limit for this quiz'}
                <br />
                • You need to score at least {quiz.passingScore}% to pass<br />
                • You can navigate between questions freely
              </Typography>            </Alert>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/quizzes')}
                  startIcon={<ArrowBackOutlinedIcon />}
                  className="btn-secondary"
                  sx={{ 
                    borderRadius: 'var(--radius-md)',
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Back to Quizzes
                </Button>
              
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleStartQuiz}
                  size="large"
                >
                  Start Quiz
                </Button>
              </Box>
            </Box>
        </Paper>
      </Container>
    );
  }
  
  // Render the active quiz
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">{quiz.title}</Typography>
          {timeLeft !== null && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon sx={{ mr: 1, color: timeLeft < 60 ? 'error.main' : 'inherit' }} />
              <Typography 
                variant="h6" 
                sx={{ fontFamily: 'monospace', color: timeLeft < 60 ? 'error.main' : 'inherit' }}
              >
                {formatTime(timeLeft)}
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Progress bar */}
        <Box sx={{ width: '100%', mb: 3 }}>
          <LinearProgress variant="determinate" value={calculateProgress()} sx={{ height: 8, borderRadius: 4 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {calculateProgress()}% Complete
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Question {activeStep + 1} of {quiz.questions.length}
            </Typography>
          </Box>
        </Box>
        
        {/* Question navigation */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {quiz.questions.map((_, index) => (
            <Button 
              key={index}
              onClick={() => goToQuestion(index)} 
              variant={activeStep === index ? "contained" : "outlined"}
              size="small"
              color={
                answers[index] === null || 
                (Array.isArray(answers[index]) && answers[index].length === 0) 
                  ? "inherit" 
                  : "primary"
              }
              sx={{ minWidth: 40, borderRadius: '50%' }}
            >
              {index + 1}
            </Button>
          ))}
        </Box>
        
        {/* Current question */}
        <Box sx={{ mb: 4 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Question {activeStep + 1}:
            </Typography>
            <Typography variant="body1" paragraph>
              {quiz.questions[activeStep].text}
            </Typography>
            
            {quiz.questions[activeStep].type === 'MULTIPLE_CHOICE' && (
              <FormControl component="fieldset">
                <FormLabel component="legend">Select one answer:</FormLabel>
                <RadioGroup 
                  value={answers[activeStep] || ''} 
                  onChange={(e) => handleSingleAnswerChange(e, activeStep)}
                >
                  {quiz.questions[activeStep].options.map((option, index) => (
                    <FormControlLabel 
                      key={index} 
                      value={index.toString()} 
                      control={<Radio />} 
                      label={option} 
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            )}
            
            {quiz.questions[activeStep].type === 'MULTIPLE_ANSWER' && (
              <FormControl component="fieldset">
                <FormLabel component="legend">Select all that apply:</FormLabel>
                <FormGroup>
                  {quiz.questions[activeStep].options.map((option, index) => (
                    <FormControlLabel 
                      key={index} 
                      control={
                        <Checkbox 
                          checked={answers[activeStep]?.includes(index.toString()) || false} 
                          onChange={(e) => handleMultipleAnswerChange(e, activeStep, index)} 
                        />
                      } 
                      label={option} 
                    />
                  ))}
                </FormGroup>
              </FormControl>
            )}
          </Paper>
        </Box>
        
        {/* Navigation buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleConfirmQuit}
            >
              Quit Quiz
            </Button>
          </Box>
          
          <Box>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Previous
            </Button>
            
            {activeStep < quiz.questions.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleConfirmSubmit}
              >
                Submit Quiz
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
      
      {/* Submit confirmation dialog */}
      <Dialog
        open={confirmSubmit}
        onClose={() => setConfirmSubmit(false)}
      >
        <DialogTitle>Submit Quiz?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {Object.values(answers).some(a => a === null || (Array.isArray(a) && a.length === 0)) ?
              `You have unanswered questions. Are you sure you want to submit the quiz? Your score will be calculated based on your current answers.` :
              `Are you sure you want to submit your answers? You won't be able to change them after submission.`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmSubmit(false)} color="inherit">
            Continue Answering
          </Button>
          <Button onClick={handleSubmitQuiz} color="primary" autoFocus>
            Submit Quiz
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Quit confirmation dialog */}
      <Dialog
        open={confirmQuit}
        onClose={() => setConfirmQuit(false)}
      >
        <DialogTitle>Quit Quiz?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to quit? Your progress will be lost and no score will be recorded.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmQuit(false)} color="inherit">
            Continue Quiz
          </Button>
          <Button onClick={handleQuitQuiz} color="error">
            Quit
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Quiz;