import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardContent, CardActions,
  Button, Chip, CircularProgress, TextField, InputAdornment, Alert,
  Paper, Divider, MenuItem, Select, FormControl, InputLabel, LinearProgress,
  useTheme, useMediaQuery, Avatar, Skeleton, Tooltip, Fade
} from '@mui/material';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import '../styles/Quiz.css';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import FunctionsOutlinedIcon from '@mui/icons-material/FunctionsOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import HistoryEduOutlinedIcon from '@mui/icons-material/HistoryEduOutlined';
import ColorLensOutlinedIcon from '@mui/icons-material/ColorLensOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import DataUsageOutlinedIcon from '@mui/icons-material/DataUsageOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';

const QuizList = ({ user }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [userAttempts, setUserAttempts] = useState({});
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
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
  
  // Get appropriate color for score display
  const getScoreColor = (score) => {
    if (score >= 80) return 'success.main';
    if (score >= 60) return 'warning.main';
    return 'text.secondary';
  };
  // Get icon for quiz category
  const getCategoryIcon = (category) => {
    switch(category.toLowerCase()) {
      case 'programming':
        return <CodeOutlinedIcon sx={{ fontSize: 30, color: '#fff' }} />;
      case 'mathematics':
        return <FunctionsOutlinedIcon sx={{ fontSize: 30, color: '#fff' }} />;
      case 'science':
        return <ScienceOutlinedIcon sx={{ fontSize: 30, color: '#fff' }} />;
      case 'language':
        return <TranslateOutlinedIcon sx={{ fontSize: 30, color: '#fff' }} />;
      case 'history':
        return <HistoryEduOutlinedIcon sx={{ fontSize: 30, color: '#fff' }} />;
      case 'art':
        return <ColorLensOutlinedIcon sx={{ fontSize: 30, color: '#fff' }} />;
      case 'business':
        return <BusinessCenterOutlinedIcon sx={{ fontSize: 30, color: '#fff' }} />;
      case 'data science':
        return <DataUsageOutlinedIcon sx={{ fontSize: 30, color: '#fff' }} />;
      case 'general knowledge':
        return <MenuBookOutlinedIcon sx={{ fontSize: 30, color: '#fff' }} />;
      default:
        return <QuizOutlinedIcon sx={{ fontSize: 30, color: '#fff' }} />;
    }
  };
  
  // Render quiz cards
  const renderQuizCards = () => {
    if (filteredQuizzes.length === 0) {
      return (
        <Paper 
          sx={{ 
            p: 5, 
            textAlign: 'center', 
            width: '100%',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            background: 'linear-gradient(to bottom right, var(--surface-bg), var(--surface-light))'
          }}
          elevation={0}
          className="fade-in"
        >
          <Box sx={{ mb: 3 }}>
            <Box 
              sx={{ 
                width: 70, 
                height: 70, 
                borderRadius: '50%', 
                backgroundColor: 'var(--primary-light)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 3,
                mx: 'auto'
              }}
            >
              <FilterListIcon sx={{ fontSize: 40, color: 'var(--primary-color)' }} />
            </Box>
          </Box>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            No quizzes found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 450, mx: 'auto', mb: 3 }}>
            Try adjusting your search or filter criteria to find the learning quizzes you're looking for.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchTerm('');
              setCategory('all');
            }}
            className="btn-secondary"
          >
            Clear Filters
          </Button>
        </Paper>
      );
    }
    
    return (
      <Grid container spacing={3}>
        {filteredQuizzes.map((quiz, index) => (
          <Grid 
            item 
            xs={12} 
            sm={6} 
            md={4} 
            key={quiz.id} 
            className="fade-in"
            sx={{ 
              animationDelay: `${index * 0.1}s` 
            }}
          >            <Card 
              elevation={0}
              className="quiz-card"
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {/* Quiz header/banner with subtle gradient */}              <Box 
                className={`quiz-image category-${quiz.category.toLowerCase().replace(/\s+/g, '-')}`}
                sx={{
                  height: 120,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.5s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Category icon */}
                <Avatar 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    width: 60,
                    height: 60,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                >
                  {getCategoryIcon(quiz.category)}
                </Avatar>
                
                {hasPassedQuiz(quiz.id) && (
                  <Chip
                    icon={<CheckCircleOutlinedIcon sx={{ color: '#fff !important' }} />}
                    label="Completed"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      bgcolor: 'rgba(46, 125, 50, 0.85)',
                      color: 'white',
                      fontWeight: 500,
                      backdropFilter: 'blur(4px)'
                    }}
                  />
                )}
                
                {!hasPassedQuiz(quiz.id) && hasAttemptedQuiz(quiz.id) && (
                  <Chip
                    icon={<EmojiEventsOutlinedIcon sx={{ color: '#fff !important' }} />}
                    label={`Best: ${getUserBestScore(quiz.id)}%`}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      bgcolor: getUserBestScore(quiz.id) >= 60 ? 
                        'rgba(237, 108, 2, 0.85)' : 
                        'rgba(66, 66, 66, 0.85)',
                      color: 'white',
                      fontWeight: 500,
                      backdropFilter: 'blur(4px)'
                    }}
                  />
                )}
              </Box>
              
              <CardContent sx={{ flexGrow: 1, pt: 3, px: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>                  <Chip 
                    label={quiz.category} 
                    size="small"
                    className="quiz-tag"
                  />
                </Box>
                
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.3
                  }}
                >
                  {quiz.title}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  paragraph
                  sx={{
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    mb: 3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {quiz.description.length > 100 
                    ? `${quiz.description.substring(0, 100)}...` 
                    : quiz.description}
                </Typography>
                  <Box 
                  sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    gap: 2, 
                    mb: 2,
                    mt: 'auto'
                  }}
                >
                  <Tooltip title={`${quiz.questions.length} questions in this quiz`} arrow placement="top">
                    <Box className="quiz-stat-badge">
                      <QuizOutlinedIcon fontSize="small" sx={{ mr: 0.75, color: 'var(--primary-color)', opacity: 0.8 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                        {quiz.questions.length} {quiz.questions.length === 1 ? 'Question' : 'Questions'}
                      </Typography>
                    </Box>
                  </Tooltip>
                  
                  <Tooltip 
                    title={quiz.timeLimit > 0 ? `Time limit: ${quiz.timeLimit} minutes` : "No time limit for this quiz"} 
                    arrow 
                    placement="top"
                  >
                    <Box className="quiz-stat-badge">
                      <AccessTimeOutlinedIcon fontSize="small" sx={{ mr: 0.75, color: 'var(--primary-color)', opacity: 0.8 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                        {quiz.timeLimit > 0 ? `${quiz.timeLimit} min` : 'No limit'}
                      </Typography>
                    </Box>
                  </Tooltip>
                </Box>
                
                {quiz.passingScore > 0 && (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      mb: 1
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                      Passing Score: <Box component="span" sx={{ fontWeight: 600, color: 'var(--text-primary)' }}>{quiz.passingScore}%</Box>
                    </Typography>
                  </Box>
                )}
                  {/* Progress indicator for quizzes the user has attempted */}
                {!hasPassedQuiz(quiz.id) && hasAttemptedQuiz(quiz.id) && (
                  <Box sx={{ mt: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
                        Your progress
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontWeight: 600, 
                          color: getScoreColor(getUserBestScore(quiz.id))
                        }}
                      >
                        {getUserBestScore(quiz.id)}%
                      </Typography>
                    </Box>
                    <Tooltip 
                      title={`Your best score: ${getUserBestScore(quiz.id)}% ${getUserBestScore(quiz.id) >= quiz.passingScore ? '(Passing score: ' + quiz.passingScore + '%)' : '(Need ' + quiz.passingScore + '% to pass)'}`} 
                      arrow 
                      placement="top"
                    >
                      <LinearProgress
                        aria-label={`Quiz progress: ${getUserBestScore(quiz.id)}%`}
                        variant="determinate"
                        value={getUserBestScore(quiz.id)}
                        className="quiz-progress-bar"
                        sx={{
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getUserBestScore(quiz.id) >= 80 ? 
                              'success.main' : 
                              getUserBestScore(quiz.id) >= 60 ? 
                                'warning.main' : 
                                'var(--primary-light)'
                          }
                        }}
                      />
                    </Tooltip>
                  </Box>
                )}
              </CardContent>
              
              <CardActions sx={{ p: 3, pt: 0 }}>                <Button 
                  component={Link}
                  to={`/quiz/${quiz.id}`}
                  variant="contained"
                  fullWidth
                  className={`quiz-button ${hasPassedQuiz(quiz.id) ? "btn-success" : "btn-learn"}`}
                  startIcon={hasPassedQuiz(quiz.id) ? 
                    <CheckCircleOutlinedIcon /> : 
                    hasAttemptedQuiz(quiz.id) ? 
                      <EmojiEventsOutlinedIcon /> : 
                      <SchoolOutlinedIcon />
                  }
                  aria-label={hasPassedQuiz(quiz.id) ? 
                    `Retake the ${quiz.title} quiz` : 
                    hasAttemptedQuiz(quiz.id) ? 
                      `Continue ${quiz.title} quiz with previous score of ${getUserBestScore(quiz.id)}%` : 
                      `Start the ${quiz.title} quiz`
                  }
                >
                  {hasPassedQuiz(quiz.id) ? 
                    'Retake Quiz' : 
                    hasAttemptedQuiz(quiz.id) ? 
                      `Continue (${getUserBestScore(quiz.id)}% Best Score)` : 
                      'Start Quiz'
                  }
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };
  
  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: { xs: 3, md: 5 },
        px: isMobile ? 0 : undefined
      }}
      disableGutters={isMobile}
    >      <Box 
        sx={{ 
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          mb: { xs: 3, md: 5 },
          px: isMobile ? 2 : 0
        }}
        className="quiz-header fade-in"
      >
        <Box sx={{ mb: { xs: 3, md: 0 } }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            className="quiz-header-title"
          >
            Available Quizzes
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            sx={{ 
              fontWeight: 400,
              maxWidth: 500
            }}
          >
            Select from our collection of educational quizzes to test your knowledge
            {filteredQuizzes.length > 0 && !loading && (
              <Box component="span" sx={{ fontWeight: 500 }}>
                {' — '}{filteredQuizzes.length} {filteredQuizzes.length === 1 ? 'quiz' : 'quizzes'} available
              </Box>
            )}
          </Typography>
        </Box>
          <Box 
          className="quiz-filter-container"
        >
          <FormControl 
            sx={{ 
              minWidth: { xs: '100%', sm: 150 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 'var(--radius-sm)'
              }
            }} 
            size="small"
            variant="outlined"
          >
            <InputLabel id="category-filter-label">Category</InputLabel>
            <Select
              labelId="category-filter-label"
              value={category}
              onChange={handleCategoryChange}
              label="Category"
              sx={{ bgcolor: 'var(--surface-bg)' }}
              aria-label="Filter quizzes by category"
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
            aria-label="Search for quizzes"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'var(--text-secondary)' }} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              width: { xs: '100%', sm: 220 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 'var(--radius-sm)',
                bgcolor: 'var(--surface-bg)'
              }
            }}
          />
        </Box>
      </Box>
      
      <Divider sx={{ 
        mb: { xs: 3, md: 5 }, 
        display: { xs: 'none', md: 'block' },
        borderColor: 'var(--border-light)'
      }} />
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            mx: isMobile ? 2 : 0,
            borderRadius: 'var(--radius-md)'
          }}
        >
          {error}
        </Alert>
      )}
        <Box sx={{ px: isMobile ? 2 : 0 }}>
        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Card 
                  elevation={0}
                  className="quiz-card fade-in"
                  sx={{ 
                    animationDelay: `${item * 0.1}s`, 
                    height: '100%' 
                  }}
                >
                  <Skeleton 
                    variant="rectangular" 
                    height={120} 
                    animation="wave" 
                    sx={{ 
                      bgcolor: 'rgba(74, 111, 220, 0.1)',
                      transform: 'none'
                    }}
                  />
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Skeleton 
                        variant="rounded" 
                        width={100} 
                        height={24} 
                        animation="wave" 
                        sx={{ 
                          bgcolor: 'rgba(74, 111, 220, 0.1)',
                          transform: 'none'
                        }}
                      />
                    </Box>
                    <Skeleton 
                      variant="text" 
                      height={32} 
                      width="80%" 
                      animation="wave" 
                      sx={{ mb: 1, transform: 'none' }}
                    />
                    <Skeleton 
                      variant="text" 
                      height={20} 
                      animation="wave" 
                      sx={{ transform: 'none' }}
                    />
                    <Skeleton 
                      variant="text" 
                      height={20} 
                      width="90%" 
                      animation="wave" 
                      sx={{ transform: 'none' }}
                    />
                    <Skeleton 
                      variant="text" 
                      height={20} 
                      width="70%" 
                      animation="wave" 
                      sx={{ mb: 2, transform: 'none' }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Skeleton 
                        variant="rounded" 
                        width={100} 
                        height={32} 
                        animation="wave" 
                        sx={{ 
                          transform: 'none' 
                        }}
                      />
                      <Skeleton 
                        variant="rounded" 
                        width={100} 
                        height={32} 
                        animation="wave" 
                        sx={{ 
                          transform: 'none' 
                        }}
                      />
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Skeleton 
                      variant="rounded" 
                      height={48} 
                      width="100%" 
                      animation="wave" 
                      sx={{ 
                        transform: 'none' 
                      }}
                    />
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          renderQuizCards()
        )}
      </Box>
        {quizzes.length > 0 && filteredQuizzes.length === 0 && (searchTerm !== '' || category !== 'all') && (
        <Fade in={filteredQuizzes.length === 0}>
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="body1" color="text.secondary" paragraph>
              No quizzes match your current filters.
            </Typography>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setCategory('all');
              }}
              variant="outlined"
              className="btn-secondary"
              startIcon={<FilterListIcon />}
              sx={{ borderRadius: 'var(--radius-md)', textTransform: 'none', fontWeight: 500 }}
            >
              Clear Filters
            </Button>
          </Box>
        </Fade>
      )}
    </Container>
  );
};

export default QuizList;
