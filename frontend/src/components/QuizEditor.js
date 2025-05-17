import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Paper, Button, TextField, IconButton, 
  MenuItem, FormControl, FormControlLabel, Radio, RadioGroup, Switch,
  Checkbox, FormGroup, Divider, Grid, Chip, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  FormHelperText, InputLabel, Select, Tooltip, Snackbar
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoIcon from '@mui/icons-material/Info';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const QuizEditor = ({ user }) => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!quizId;
  
  // Quiz state
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    category: 'General Knowledge',
    timeLimit: 0,
    passingScore: 70,
    isPublished: false,
    questions: []
  });
  
  // UI state
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [openedQuestion, setOpenedQuestion] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Available quiz categories
  const categories = [
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
  
  // Fetch quiz data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchQuiz = async () => {
        try {
          const response = await api.getQuizById(quizId);
          if (response?.data) {
            setQuiz(response.data);
          }
        } catch (err) {
          console.error("Error fetching quiz:", err);
          setError("Failed to load quiz. Please try again later.");
        } finally {
          setLoading(false);
        }
      };
      
      fetchQuiz();
    }
  }, [quizId, isEditMode]);
  
  // Handle quiz basic info changes
  const handleQuizChange = (e) => {
    const { name, value } = e.target;
    setQuiz(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is updated
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  // Handle switch changes
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setQuiz(prev => ({ ...prev, [name]: checked }));
  };
  
  // Add a new question
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(), // temp id
      text: '',
      type: 'MULTIPLE_CHOICE',
      options: ['', ''],
      correctOptions: []
    };
    
    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    
    // Open the new question
    setOpenedQuestion((prev) => (prev === null ? 0 : prev + 1));
  };
  
  // Remove a question
  const removeQuestion = (index) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
    
    // Adjust opened question index
    if (openedQuestion !== null) {
      if (openedQuestion === index) {
        setOpenedQuestion(null);
      } else if (openedQuestion > index) {
        setOpenedQuestion(openedQuestion - 1);
      }
    }
  };
  
  // Handle question text change
  const handleQuestionTextChange = (e, index) => {
    const { value } = e.target;
    setQuiz(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index] = { ...updatedQuestions[index], text: value };
      return { ...prev, questions: updatedQuestions };
    });
    
    // Clear validation error
    if (validationErrors[`question_${index}`]) {
      setValidationErrors(prev => ({ ...prev, [`question_${index}`]: null }));
    }
  };
  
  // Handle question type change
  const handleQuestionTypeChange = (e, index) => {
    const { value } = e.target;
    setQuiz(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index] = { 
        ...updatedQuestions[index], 
        type: value,
        // Reset correct options when type changes
        correctOptions: []
      };
      return { ...prev, questions: updatedQuestions };
    });
  };
  
  // Add a new option to a question
  const addOption = (questionIndex) => {
    setQuiz(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[questionIndex] = { 
        ...updatedQuestions[questionIndex], 
        options: [...updatedQuestions[questionIndex].options, '']
      };
      return { ...prev, questions: updatedQuestions };
    });
  };
  
  // Remove an option from a question
  const removeOption = (questionIndex, optionIndex) => {
    setQuiz(prev => {
      const updatedQuestions = [...prev.questions];
      const question = { ...updatedQuestions[questionIndex] };
      
      // Remove the option
      question.options = question.options.filter((_, i) => i !== optionIndex);
      
      // Update correct options if needed
      question.correctOptions = question.correctOptions
        .filter(i => i !== optionIndex.toString())
        .map(i => {
          const num = parseInt(i);
          return num > optionIndex ? (num - 1).toString() : i;
        });
      
      updatedQuestions[questionIndex] = question;
      return { ...prev, questions: updatedQuestions };
    });
  };
  
  // Handle option text change
  const handleOptionTextChange = (e, questionIndex, optionIndex) => {
    const { value } = e.target;
    setQuiz(prev => {
      const updatedQuestions = [...prev.questions];
      const updatedOptions = [...updatedQuestions[questionIndex].options];
      updatedOptions[optionIndex] = value;
      updatedQuestions[questionIndex] = { 
        ...updatedQuestions[questionIndex], 
        options: updatedOptions
      };
      return { ...prev, questions: updatedQuestions };
    });
    
    // Clear validation error
    if (validationErrors[`question_${questionIndex}_option_${optionIndex}`]) {
      setValidationErrors(prev => ({ 
        ...prev, 
        [`question_${questionIndex}_option_${optionIndex}`]: null 
      }));
    }
  };
  
  // Handle correct option change for multiple choice
  const handleCorrectOptionChange = (e, questionIndex) => {
    const { value } = e.target;
    setQuiz(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[questionIndex] = { 
        ...updatedQuestions[questionIndex], 
        correctOptions: [value]
      };
      return { ...prev, questions: updatedQuestions };
    });
    
    // Clear validation error
    if (validationErrors[`question_${questionIndex}_correctOption`]) {
      setValidationErrors(prev => ({ 
        ...prev, 
        [`question_${questionIndex}_correctOption`]: null 
      }));
    }
  };
  
  // Handle correct options change for multiple answer
  const handleCorrectOptionsChange = (e, questionIndex, optionIndex) => {
    const { checked } = e.target;
    const optionValue = optionIndex.toString();
    
    setQuiz(prev => {
      const updatedQuestions = [...prev.questions];
      let correctOptions = [...updatedQuestions[questionIndex].correctOptions];
      
      if (checked) {
        if (!correctOptions.includes(optionValue)) {
          correctOptions.push(optionValue);
        }
      } else {
        correctOptions = correctOptions.filter(opt => opt !== optionValue);
      }
      
      updatedQuestions[questionIndex] = { 
        ...updatedQuestions[questionIndex], 
        correctOptions 
      };
      return { ...prev, questions: updatedQuestions };
    });
    
    // Clear validation error
    if (validationErrors[`question_${questionIndex}_correctOption`]) {
      setValidationErrors(prev => ({ 
        ...prev, 
        [`question_${questionIndex}_correctOption`]: null 
      }));
    }
  };
  
  // Toggle question expansion
  const toggleQuestion = (index) => {
    setOpenedQuestion(openedQuestion === index ? null : index);
  };
  
  // Handle drag and drop reordering of questions
  const handleDragEnd = (result) => {
    const { destination, source } = result;
    
    // Drop outside the list or same position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    const reorderedQuestions = Array.from(quiz.questions);
    const [removed] = reorderedQuestions.splice(source.index, 1);
    reorderedQuestions.splice(destination.index, 0, removed);
    
    setQuiz(prev => ({ ...prev, questions: reorderedQuestions }));
    
    // Update opened question index if needed
    if (openedQuestion === source.index) {
      setOpenedQuestion(destination.index);
    } else if (
      openedQuestion < source.index && 
      openedQuestion >= destination.index
    ) {
      setOpenedQuestion(openedQuestion + 1);
    } else if (
      openedQuestion > source.index && 
      openedQuestion <= destination.index
    ) {
      setOpenedQuestion(openedQuestion - 1);
    }
  };
  
  // Validate quiz before save
  const validateQuiz = () => {
    const errors = {};
    
    // Validate basic info
    if (!quiz.title.trim()) {
      errors.title = "Title is required";
    }
    
    if (!quiz.description.trim()) {
      errors.description = "Description is required";
    }
    
    if (quiz.timeLimit < 0) {
      errors.timeLimit = "Time limit cannot be negative";
    }
    
    if (quiz.passingScore < 0 || quiz.passingScore > 100) {
      errors.passingScore = "Passing score must be between 0 and 100";
    }
    
    // Validate questions
    if (quiz.questions.length === 0) {
      errors.questions = "At least one question is required";
    }
    
    quiz.questions.forEach((question, qIndex) => {
      // Question text
      if (!question.text.trim()) {
        errors[`question_${qIndex}`] = "Question text is required";
      }
      
      // Options
      if (question.options.length < 2) {
        errors[`question_${qIndex}_options`] = "At least two options are required";
      }
      
      question.options.forEach((option, oIndex) => {
        if (!option.trim()) {
          errors[`question_${qIndex}_option_${oIndex}`] = "Option text is required";
        }
      });
      
      // Correct options
      if (question.correctOptions.length === 0) {
        errors[`question_${qIndex}_correctOption`] = "Please select at least one correct option";
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Save quiz
  const saveQuiz = async () => {
    // Validate before saving
    if (!validateQuiz()) {
      // Open the first question with errors
      const questionErrors = Object.keys(validationErrors).filter(key => key.startsWith('question_'));
      if (questionErrors.length > 0) {
        const match = questionErrors[0].match(/^question_(\d+)/);
        if (match) {
          setOpenedQuestion(parseInt(match[1]));
        }
      }
      
      setError("Please fix the validation errors before saving");
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      let response;
      if (isEditMode) {
        console.log("Updating quiz:", quiz);
        response = await api.updateQuiz(quizId, quiz);
      } else {
        console.log("Creating new quiz:", quiz);
        response = await api.createQuiz(quiz);
      }
      
      console.log("Save response:", response);
      
      if (response?.data) {
        // Update the quiz with the response data to ensure we have the latest version
        if (isEditMode) {
          setQuiz(response.data);
        }
        
        setSuccess(`Quiz ${isEditMode ? 'updated' : 'created'} successfully!`);
        
        if (!isEditMode) {
          // Navigate to edit mode for the new quiz
          navigate(`/admin/quizzes/edit/${response.data.id}`, { replace: true });
        }
      }
    } catch (err) {
      console.error("Error saving quiz:", err);
      // Show a more descriptive error message
      let errorMsg = `Failed to ${isEditMode ? 'update' : 'create'} quiz`;
      
      // Extract error message from response if available
      if (err.response && err.response.data && err.response.data.error) {
        errorMsg += `: ${err.response.data.error}`;
      } else if (err.message) {
        errorMsg += `: ${err.message}`;
      } else {
        errorMsg += `. Please try again.`;
      }
      
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };
  
  // Publish or unpublish quiz
  const togglePublishQuiz = async () => {
    setConfirmPublish(false);
    setSaving(true);
    
    try {
      let response;
      if (quiz.isPublished) {
        // Unpublish
        console.log("Attempting to unpublish quiz:", quizId);
        response = await api.unpublishQuiz(quizId);
        console.log("Unpublish response:", response);
      } else {
        // Validate before publishing
        if (!validateQuiz()) {
          setSaving(false);
          setError("Please fix the validation errors before publishing");
          return;
        }
        
        // Save the quiz first to ensure all changes are persisted
        await saveQuiz();
        
        // Publish
        console.log("Attempting to publish quiz:", quizId);
        response = await api.publishQuiz(quizId);
        console.log("Publish response:", response);
      }
      
      if (response?.data) {
        // Update the quiz with the returned data if available
        if (response.data.quiz) {
          setQuiz(response.data.quiz);
        } else {
          // Otherwise just toggle the published status
          setQuiz(prev => ({ ...prev, isPublished: !prev.isPublished }));
        }
        
        setSuccess(`Quiz ${quiz.isPublished ? 'unpublished' : 'published'} successfully!`);
      }
    } catch (err) {
      console.error("Error toggling publish status:", err);
      // Show a more descriptive error message
      let errorMsg = `Failed to ${quiz.isPublished ? 'unpublish' : 'publish'} quiz`;
      
      // Extract error message from response if available
      if (err.response && err.response.data && err.response.data.error) {
        errorMsg += `: ${err.response.data.error}`;
      } else if (err.message) {
        errorMsg += `: ${err.message}`;
      } else {
        errorMsg += `. Please try again.`;
      }
      
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };
  
  // Discard changes
  const discardChanges = () => {
    setConfirmDiscard(false);
    if (isEditMode) {
      navigate('/admin/quizzes');
    } else {
      navigate(-1);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading quiz...
        </Typography>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 } 
      }}>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Quiz' : 'Create Quiz'}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={() => setConfirmDiscard(true)}
          >
            Cancel
          </Button>
          
          {isEditMode && (
            <Button
              variant="outlined"
              color={quiz.isPublished ? "warning" : "success"}
              startIcon={quiz.isPublished ? <VisibilityOffIcon /> : <VisibilityIcon />}
              onClick={() => setConfirmPublish(true)}
              disabled={saving}
            >
              {quiz.isPublished ? 'Unpublish' : 'Publish'}
            </Button>
          )}
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={saveQuiz}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Quiz'}
          </Button>
        </Box>
      </Box>
      
      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess(null)}
          message={success}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      )}
      
      {/* Quiz Basic Info */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>Quiz Information</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Quiz Title"
              name="title"
              value={quiz.title}
              onChange={handleQuizChange}
              fullWidth
              required
              error={!!validationErrors.title}
              helperText={validationErrors.title}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                name="category"
                value={quiz.category}
                onChange={handleQuizChange}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    name="isPublished"
                    checked={quiz.isPublished}
                    onChange={handleSwitchChange}
                    disabled={!isEditMode}
                  />
                }
                label={quiz.isPublished ? 'Published' : 'Draft'}
              />
              <Tooltip title={!isEditMode ? "Save the quiz first to be able to publish it" : ""}>
                <InfoIcon color="action" fontSize="small" />
              </Tooltip>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Description"
              name="description"
              value={quiz.description}
              onChange={handleQuizChange}
              fullWidth
              required
              multiline
              rows={3}
              error={!!validationErrors.description}
              helperText={validationErrors.description}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Time Limit (minutes, 0 for no limit)"
              name="timeLimit"
              value={quiz.timeLimit}
              onChange={handleQuizChange}
              type="number"
              fullWidth
              InputProps={{ inputProps: { min: 0 } }}
              error={!!validationErrors.timeLimit}
              helperText={validationErrors.timeLimit}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Passing Score (%)"
              name="passingScore"
              value={quiz.passingScore}
              onChange={handleQuizChange}
              type="number"
              fullWidth
              InputProps={{ inputProps: { min: 0, max: 100 } }}
              error={!!validationErrors.passingScore}
              helperText={validationErrors.passingScore}
            />
          </Grid>
        </Grid>
      </Paper>
      
      {/* Questions Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Questions {quiz.questions.length > 0 && `(${quiz.questions.length})`}
          </Typography>
          
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={addQuestion}
          >
            Add Question
          </Button>
        </Box>
        
        {validationErrors.questions && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {validationErrors.questions}
          </Alert>
        )}
        
        {quiz.questions.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            p: 4, 
            border: '2px dashed', 
            borderColor: 'divider',
            borderRadius: 2 
          }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No questions added yet
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addQuestion}
            >
              Add Your First Question
            </Button>
          </Box>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="questions" isDropDisabled={false}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {quiz.questions.map((question, index) => (
                    <Draggable key={question.id} draggableId={question.id} index={index}>
                      {(provided) => (
                        <Paper
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          elevation={1}
                          sx={{ 
                            mb: 2, 
                            overflow: 'hidden',
                            border: validationErrors[`question_${index}`] ? '1px solid' : 'none',
                            borderColor: 'error.main'
                          }}
                        >
                          <Box sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            p: 2,
                            bgcolor: openedQuestion === index ? 'primary.light' : 'background.paper',
                            borderBottom: openedQuestion === index ? 1 : 0,
                            borderColor: 'divider'
                          }}>
                            <Box 
                              {...provided.dragHandleProps}
                              sx={{ mr: 2, display: 'flex', alignItems: 'center' }}
                            >
                              <DragIndicatorIcon color="action" />
                            </Box>
                            
                            <Box sx={{ flexGrow: 1, overflow: 'hidden' }} onClick={() => toggleQuestion(index)}>
                              <Typography 
                                noWrap
                                color={openedQuestion === index ? 'primary.contrastText' : 'text.primary'}
                              >
                                Q{index + 1}: {question.text || 'Untitled Question'}
                              </Typography>
                              
                              {validationErrors[`question_${index}`] && (
                                <Typography variant="caption" color="error">
                                  {validationErrors[`question_${index}`]}
                                </Typography>
                              )}
                            </Box>
                            
                            <Chip 
                              label={question.type === 'MULTIPLE_CHOICE' ? 'Single Choice' : 'Multiple Choice'}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ mr: 2 }}
                            />
                            
                            <IconButton 
                              color="error" 
                              onClick={() => removeQuestion(index)} 
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                          
                          {openedQuestion === index && (
                            <Box sx={{ p: 3 }}>
                              <Grid container spacing={3}>
                                <Grid item xs={12}>
                                  <TextField
                                    label="Question Text"
                                    value={question.text}
                                    onChange={(e) => handleQuestionTextChange(e, index)}
                                    fullWidth
                                    required
                                    error={!!validationErrors[`question_${index}`]}
                                    helperText={validationErrors[`question_${index}`]}
                                  />
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                  <FormControl fullWidth>
                                    <InputLabel>Question Type</InputLabel>
                                    <Select
                                      value={question.type}
                                      onChange={(e) => handleQuestionTypeChange(e, index)}
                                      label="Question Type"
                                    >
                                      <MenuItem value="MULTIPLE_CHOICE">Single Choice</MenuItem>
                                      <MenuItem value="MULTIPLE_ANSWER">Multiple Choice</MenuItem>
                                    </Select>
                                    <FormHelperText>
                                      {question.type === 'MULTIPLE_CHOICE' ? 
                                        'Users will select only one correct option' : 
                                        'Users can select multiple options that are correct'}
                                    </FormHelperText>
                                  </FormControl>
                                </Grid>
                                
                                <Grid item xs={12}>
                                  <Typography variant="subtitle1" gutterBottom>
                                    Options
                                  </Typography>
                                  
                                  {validationErrors[`question_${index}_options`] && (
                                    <FormHelperText error>
                                      {validationErrors[`question_${index}_options`]}
                                    </FormHelperText>
                                  )}
                                  
                                  {validationErrors[`question_${index}_correctOption`] && (
                                    <FormHelperText error>
                                      {validationErrors[`question_${index}_correctOption`]}
                                    </FormHelperText>
                                  )}
                                  
                                  {question.options.map((option, optionIndex) => (
                                    <Box 
                                      key={optionIndex} 
                                      sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        mb: 2,
                                        gap: 2 
                                      }}
                                    >
                                      {question.type === 'MULTIPLE_CHOICE' ? (
                                        <Radio 
                                          checked={question.correctOptions[0] === optionIndex.toString()}
                                          onChange={(e) => handleCorrectOptionChange(e, index)}
                                          value={optionIndex.toString()}
                                        />
                                      ) : (
                                        <Checkbox 
                                          checked={question.correctOptions.includes(optionIndex.toString())}
                                          onChange={(e) => handleCorrectOptionsChange(e, index, optionIndex)}
                                        />
                                      )}
                                      
                                      <TextField
                                        label={`Option ${optionIndex + 1}`}
                                        value={option}
                                        onChange={(e) => handleOptionTextChange(e, index, optionIndex)}
                                        fullWidth
                                        required
                                        error={!!validationErrors[`question_${index}_option_${optionIndex}`]}
                                        helperText={validationErrors[`question_${index}_option_${optionIndex}`]}
                                      />
                                      
                                      <IconButton 
                                        color="error" 
                                        onClick={() => removeOption(index, optionIndex)}
                                        disabled={question.options.length <= 2}
                                        size="small"
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </Box>
                                  ))}
                                  
                                  <Button
                                    startIcon={<AddIcon />}
                                    onClick={() => addOption(index)}
                                    sx={{ mt: 1 }}
                                  >
                                    Add Option
                                  </Button>
                                </Grid>
                              </Grid>
                            </Box>
                          )}
                        </Paper>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant={quiz.questions.length > 0 ? "text" : "contained"}
            startIcon={<AddIcon />}
            onClick={addQuestion}
          >
            Add Question
          </Button>
        </Box>
      </Paper>
      
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => setConfirmDiscard(true)}
        >
          Cancel
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={saveQuiz}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Quiz'}
        </Button>
      </Box>
      
      {/* Discard Changes Confirmation Dialog */}
      <Dialog
        open={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
      >
        <DialogTitle>Discard Changes?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to discard your changes? Any unsaved changes will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDiscard(false)} color="inherit">
            Continue Editing
          </Button>
          <Button onClick={discardChanges} color="error">
            Discard Changes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Publish/Unpublish Confirmation Dialog */}
      <Dialog
        open={confirmPublish}
        onClose={() => setConfirmPublish(false)}
      >
        <DialogTitle>
          {quiz.isPublished ? 'Unpublish Quiz?' : 'Publish Quiz?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {quiz.isPublished ? 
              'Are you sure you want to unpublish this quiz? It will no longer be available to users.' :
              'Are you sure you want to publish this quiz? It will be visible to all users.'
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmPublish(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={togglePublishQuiz} color={quiz.isPublished ? "warning" : "success"}>
            {quiz.isPublished ? 'Unpublish' : 'Publish'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuizEditor;