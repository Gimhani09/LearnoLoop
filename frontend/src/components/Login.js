import React, { useState, useEffect } from "react";
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
  Link as MuiLink,
  IconButton,
  InputAdornment,
  Tooltip,
  Snackbar,
  Grid,
  FormControlLabel,
  Checkbox,
  Avatar,
  Card,
  CardMedia
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import SchoolIcon from '@mui/icons-material/School';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import GitHubIcon from '@mui/icons-material/GitHub';
import LoginIcon from '@mui/icons-material/Login';
import { useNotification } from '../context/NotificationContext';

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { notifySuccess, notifyError, notifyInfo } = useNotification();
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  
  // Check if we were redirected here with a message
  const redirectMessage = location.state?.message || null;

  // Handle successful login with useEffect to avoid concurrent rendering issues
  useEffect(() => {
    if (loginSuccess && userData) {
      // Update parent component's user state
      setUser(userData);
      
      // Store user info
      if (rememberMe) {
        localStorage.setItem('userInfo', JSON.stringify(userData));
      } else {
        sessionStorage.setItem('userInfo', JSON.stringify(userData));
      }
      
      // Set a timestamp to indicate a recent login to avoid redundant API calls
      sessionStorage.setItem('lastLoginTime', new Date().getTime().toString());
      
      // Show success notification
      notifySuccess(`Welcome back, ${userData.username || 'User'}!`);
      
      // Reset the states
      setLoginSuccess(false);
      setUserData(null);
      
      // Redirect to original intended page or default
      const from = location.state?.from || '/';
      navigate(from);
    }
  }, [loginSuccess, userData, setUser, rememberMe, notifySuccess, navigate, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user types
    if (error) {
      setError("");
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.username.trim()) {
      setError("Please enter your username");
      return;
    }
    
    if (!formData.password) {
      setError("Please enter your password");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const response = await api.login(formData);
      
      if (response && response.data) {
        // Instead of doing multiple state updates and navigation in rapid succession,
        // we set these states which will trigger the useEffect above
        setUserData(response.data);
        setLoginSuccess(true);
      }
    } catch (error) {
      console.error("Login error:", error);
      
      let errorMessage = "Login failed. Please check your credentials.";
      
      if (error.response) {
        // The request was made and the server responded with a non-2xx status code
        const serverError = error.response.data?.error || error.response.statusText;
        errorMessage = `Login failed: ${serverError}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "Server connection failed. Is the server running?";
      } else {
        // Something happened in setting up the request
        errorMessage = `Something went wrong: ${error.message}`;
      }
      
      setError(errorMessage);
      notifyError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (platform) => {
    // This would normally connect to the backend for OAuth
    notifyInfo(`${platform} login is not implemented yet.`);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      py: 4
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          width: '100%', 
          maxWidth: 500,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'var(--primary-color)', 
              width: 56, 
              height: 56, 
              mb: 1 
            }}
          >
            <LockIcon />
          </Avatar>
        </Box>
        
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Welcome Back
        </Typography>
        
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Log in to continue your learning journey
        </Typography>

        {redirectMessage && (
          <Alert severity="info" sx={{ mb: 3 }}>
            {redirectMessage}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
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
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  name="rememberMe"
                  color="primary"
                />
              }
              label="Remember me"
            />
            
            <Button 
              component={Link} 
              to="/forgot-password"
              color="primary"
              variant="text"
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Forgot password?
            </Button>
          </Box>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ 
              mt: 3, 
              mb: 2, 
              py: 1.5,
              background: 'linear-gradient(45deg, var(--primary-color) 30%, var(--secondary-color) 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, var(--primary-color-dark) 30%, var(--secondary-color-dark) 90%)',
                boxShadow: '0 6px 10px 2px rgba(33, 203, 243, .3)',
              }
            }}
            disabled={loading}
            startIcon={loading ? null : <LoginIcon />}
          >
            {loading ? <CircularProgress size={24} /> : 'Log In'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Button 
                component={Link} 
                to="/signup"
                color="primary"
                variant="text"
                size="small"
                sx={{ textTransform: 'none', fontWeight: 'bold' }}
              >
                Sign up now
              </Button>
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              OR LOGIN WITH
            </Typography>
          </Divider>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
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
      </Paper>
    </Box>
  );
};

export default Login;