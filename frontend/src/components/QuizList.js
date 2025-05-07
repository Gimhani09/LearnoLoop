import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardContent, CardActions,
  Button, Chip, CircularProgress, TextField, InputAdornment, Alert,
  Paper, Divider, MenuItem, Select, FormControl, InputLabel, LinearProgress
} from '@mui/material';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import QuizIcon from '@mui/icons-material/Quiz';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SchoolIcon from '@mui/icons-material/School';

const QuizList = ({ user }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [userAttempts, setUserAttempts] = useState({});
  
  // Available quiz categories
  const categories = [
    "All Categories",
    "General Knowledge",
    "Programming",
    "Mathematics",
    "Science",
    "Language",
    "History",
    "Art",
    "Business",
    "Data Science"
  ];
  
  // Fetch quizzes and user attempts
  useEffect(() => {
    const fetchQuizzesAndAttempts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch published quizzes
        const quizResponse = await api.getPublishedQuizzes();
        
        if (quizResponse?.data) {
          setQuizzes(quizResponse.data);
          setFilteredQuizzes(quizResponse.data);
        }
        
        // Fetch user's attempts if logged in
        if (user) {
          const attemptsResponse = await api.getUserAttempts();
          
          if (attemptsResponse?.data) {
            // Transform attempts array into lookup object by quizId
            const attemptsMap = {};
            attemptsResponse.data.forEach(attempt => {
              if (!attemptsMap[attempt.quizId] || 
                  new Date(attempt.completedAt) > new Date(attemptsMap[attempt.quizId].completedAt)) {
                attemptsMap[attempt.quizId] = attempt;
              }
            });
            setUserAttempts(attemptsMap);
          }
        }
      } catch (err) {
        console.error("Error fetching quizzes:", err);
        setError("Failed to load quizzes. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizzesAndAttempts();
  }, [user]);
  
  // Filter quizzes when search term or category changes
  useEffect(() => {
    filterQuizzes();
  }, [searchTerm, category, quizzes]);
  
  const filterQuizzes = () => {
    let filtered = [...quizzes];
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(quiz => 
        quiz.title.toLowerCase().includes(searchLower) || 
        quiz.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by category
    if (category && category !== 'all' && category !== 'All Categories') {
      filtered = filtered.filter(quiz => quiz.category === category);
    }
    
    setFilteredQuizzes(filtered);
  };
  
  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  // Handle category filter change
  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };
  
  // Check if user has passed the quiz
  const hasPassedQuiz = (quizId) => {
    return userAttempts[quizId]?.passed;
  };
  
  // Get user's best score for a quiz
  const getUserBestScore = (quizId) => {
    return userAttempts[quizId]?.score || 0;
  };
  
  // Determine if user has attempted the quiz
  const hasAttemptedQuiz = (quizId) => {
    return !!userAttempts[quizId];
  };
  
  // Render quiz cards
  const renderQuizCards = () => {
    if (filteredQuizzes.length === 0) {
      return (
        <Paper sx={{ p: 4, textAlign: 'center', width: '100%' }}>
          <Box sx={{ mb: 2 }}>
            <FilterListIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />
          </Box>
          <Typography variant="h6" gutterBottom>
            No quizzes found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filter criteria
          </Typography>
        </Paper>
      );
    }
    
    return (
      <Grid container spacing={3}>
        {filteredQuizzes.map(quiz => (
          <Grid item xs={12} sm={6} md={4} key={quiz.id}>
            <Card 
              elevation={3}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Chip 
                    label={quiz.category} 
                    color="primary"
                    size="small"
                    variant="outlined"
                  />
                  
                  {hasPassedQuiz(quiz.id) && (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Passed"
                      color="success"
                      size="small"
                    />
                  )}
                  
                  {!hasPassedQuiz(quiz.id) && hasAttemptedQuiz(quiz.id) && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                        Best:
                      </Typography>
                      <Typography variant="caption" fontWeight="bold">
                        {getUserBestScore(quiz.id)}%
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                <Typography variant="h6" gutterBottom>
                  {quiz.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {quiz.description.length > 120 
                    ? `${quiz.description.substring(0, 120)}...` 
                    : quiz.description}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <QuizIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {quiz.questions.length} {quiz.questions.length === 1 ? 'Question' : 'Questions'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {quiz.timeLimit > 0 ? `${quiz.timeLimit} min` : 'No time limit'}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {quiz.passingScore > 0 ? (
                    <>
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                        Passing Score:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {quiz.passingScore}%
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No passing score set
                    </Typography>
                  )}
                </Box>
              </CardContent>
              
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  component={Link}
                  to={`/quiz/${quiz.id}`}
                  variant="contained"
                  fullWidth
                  color={hasPassedQuiz(quiz.id) ? "success" : "primary"}
                  startIcon={hasPassedQuiz(quiz.id) ? <CheckCircleIcon /> : <SchoolIcon />}
                >
                  {hasPassedQuiz(quiz.id) ? 'Retake Quiz' : (hasAttemptedQuiz(quiz.id) ? 'Try Again' : 'Take Quiz')}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        flexDirection: { xs: 'column', sm: 'row' },
        mb: 4 
      }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: { xs: 2, sm: 0 } }}>
          Available Quizzes
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel id="category-filter-label">Category</InputLabel>
            <Select
              labelId="category-filter-label"
              value={category}
              onChange={handleCategoryChange}
              label="Category"
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.slice(1).map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={handleSearchChange}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          />
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading quizzes...
          </Typography>
        </Box>
      ) : (
        renderQuizCards()
      )}
      
      {quizzes.length > 0 && filteredQuizzes.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button 
            onClick={() => {
              setSearchTerm('');
              setCategory('all');
            }}
          >
            Clear Filters
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default QuizList;