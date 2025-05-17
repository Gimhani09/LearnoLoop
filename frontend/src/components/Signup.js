import React, { useState } from "react";
import { api } from "../services/api";
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Alert, 
  CircularProgress,
  Divider,
  Link,
  IconButton,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Avatar,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  InputLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SchoolIcon from '@mui/icons-material/School';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import GitHubIcon from '@mui/icons-material/GitHub';

const Signup = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
    color: "error"
  });

  // User data
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    bio: "",
    interests: [],
    profilePicture: null
  });
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // Available interests/categories
  const interestOptions = [
    "Mathematics", "Science", "Literature", "History", 
    "Computer Science", "Languages", "Arts", "Business", "Health"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear validation errors when user types
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ""
      });
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Password strength check
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    // Simple password strength algorithm
    let score = 0;
    let message = "";
    let color = "error";
    
    if (password.length >= 8) score += 1;
    if (password.match(/[A-Z]/)) score += 1;
    if (password.match(/[0-9]/)) score += 1;
    if (password.match(/[^A-Za-z0-9]/)) score += 1;
    
    if (score === 0) {
      message = "Very weak";
      color = "error";
    } else if (score === 1) {
      message = "Weak";
      color = "error";
    } else if (score === 2) {
      message = "Fair";
      color = "warning";
    } else if (score === 3) {
      message = "Good";
      color = "info";
    } else {
      message = "Strong";
      color = "success";
    }
    
    setPasswordStrength({ score, message, color });
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const validateStep = () => {
    const newErrors = {};
    
    if (activeStep === 0) {
      // Validate first step - account credentials
      if (!formData.username.trim()) {
        newErrors.username = "Username is required";
      }
      
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid";
      }
      
      if (!formData.password.trim()) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }
    
    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        profilePicture: file
      });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) {
      return;
    }
    
    setError("");
    setLoading(true);
    
    try {
      // Create form data for file upload if there's a profile picture
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        bio: formData.bio,
        interests: formData.interests,
        role: "USER"
      };
      
      // If there's a profile picture, we'd handle it separately
      // with a multipart/form-data request
      
      const response = await api.signup(userData);
      
      // Set a timestamp to indicate a recent signup to avoid redundant API calls
      sessionStorage.setItem('lastSignupTime', new Date().getTime().toString());
      
      // Show success message
      setActiveStep(2); // Move to success step
    } catch (error) {
      console.error("Signup error:", error);
      
      if (error.response) {
        // Handle specific error messages from server
        if (error.response.data?.error?.includes("already exists")) {
          setValidationErrors({
            ...validationErrors,
            username: "Username already exists"
          });
        } else {
          setError(`Registration failed: ${error.response.data?.error || error.response.statusText}`);
        }
      } else if (error.request) {
        setError("No response received from server. Please try again.");
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleSocialLogin = (platform) => {
    // This would normally connect to the backend for OAuth
    alert(`${platform} login is not implemented yet.`);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      py: 4
    }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 600 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main', 
              width: 56, 
              height: 56, 
              mb: 1 
            }}
          >
            {activeStep === 2 ? <CheckCircleIcon /> : <PersonAddIcon />}
          </Avatar>
        </Box>
        
        <Typography variant="h4" component="h2" gutterBottom align="center">
          {activeStep === 0 && "Create an Account"}
          {activeStep === 1 && "Your Profile"}
          {activeStep === 2 && "Success!"}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          {activeStep === 0 && "Join our learning community to share and grow your knowledge"}
          {activeStep === 1 && "Tell us more about yourself"}
          {activeStep === 2 && "Your account has been created successfully"}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          <Step>
            <StepLabel>Account</StepLabel>
          </Step>
          <Step>
            <StepLabel>Profile</StepLabel>
          </Step>
          <Step>
            <StepLabel>Complete</StepLabel>
          </Step>
        </Stepper>
        
        {activeStep === 0 && (
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              required
              autoFocus
              error={!!validationErrors.username}
              helperText={validationErrors.username}
            />
            
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              error={!!validationErrors.email}
              helperText={validationErrors.email}
            />
            
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              name="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              error={!!validationErrors.password}
              helperText={validationErrors.password || 
                (formData.password && `Password strength: ${passwordStrength.message}`)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            {/* Password strength indicator */}
            {formData.password && (
              <Box sx={{ mt: 1, mb: 2 }}>
                <Box sx={{ 
                  display: 'flex',
                  width: '100%',
                  justifyContent: 'space-between',
                  mb: 0.5
                }}>
                  {[1, 2, 3, 4].map((strength) => (
                    <Box 
                      key={strength} 
                      sx={{ 
                        height: 4, 
                        flex: 1, 
                        mx: 0.25,
                        bgcolor: passwordStrength.score >= strength 
                          ? `${passwordStrength.color}.main` 
                          : 'grey.300'
                      }} 
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              variant="outlined"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
              error={!!validationErrors.confirmPassword}
              helperText={validationErrors.confirmPassword}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button 
                onClick={() => navigate('/login')}
              >
                Have an account? Login
              </Button>
              
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleNext}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Next'}
              </Button>
            </Box>
            
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR SIGN UP WITH
              </Typography>
            </Divider>
            
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Button 
                  fullWidth
                  variant="outlined"
                  startIcon={<GoogleIcon />}
                  onClick={() => handleSocialLogin("Google")}
                >
                  Google
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button 
                  fullWidth
                  variant="outlined"
                  startIcon={<FacebookIcon />}
                  onClick={() => handleSocialLogin("Facebook")}
                >
                  Facebook
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button 
                  fullWidth
                  variant="outlined"
                  startIcon={<GitHubIcon />}
                  onClick={() => handleSocialLogin("GitHub")}
                >
                  GitHub
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {activeStep === 1 && (
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              variant="outlined"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="Bio"
              variant="outlined"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
              placeholder="Tell us a bit about yourself..."
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="interests-label">Learning Interests</InputLabel>
              <Select
                labelId="interests-label"
                id="interests"
                multiple
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                renderValue={(selected) => selected.join(', ')}
              >
                {interestOptions.map((interest) => (
                  <MenuItem key={interest} value={interest}>
                    {interest}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Select subjects you're interested in learning</FormHelperText>
            </FormControl>
            
            <Box sx={{ mb: 3, mt: 2 }}>
              <input
                type="file"
                id="profile-picture"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <label htmlFor="profile-picture">
                <Button 
                  variant="outlined" 
                  component="span" 
                  fullWidth
                >
                  {formData.profilePicture ? 'Change Profile Picture' : 'Upload Profile Picture'}
                </Button>
              </label>
              {formData.profilePicture && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Selected: {formData.profilePicture.name}
                </Typography>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button 
                onClick={handleBack}
              >
                Back
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleSignup}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Account'}
              </Button>
            </Box>
          </Box>
        )}
        
        {activeStep === 2 && (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Welcome to LearnoLoop!
            </Typography>
            <Typography variant="body1" paragraph>
              Your account has been created successfully. You can now log in and start your learning journey!
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/login')}
              startIcon={<SchoolIcon />}
              sx={{ mt: 2 }}
            >
              Log In Now
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Signup;