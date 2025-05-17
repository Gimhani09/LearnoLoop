import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Avatar,
  IconButton,
  InputAdornment,
  Link as MuiLink,
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LockResetIcon from '@mui/icons-material/LockReset';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { api } from '../services/api';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValidating, setTokenValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
    color: "error"
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from URL query parameters
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tokenParam = query.get('token');
    
    if (!tokenParam) {
      setTokenValidating(false);
      setTokenValid(false);
      setError('Missing password reset token');
      return;
    }

    setToken(tokenParam);
    validateToken(tokenParam);
  }, [location]);

  // Password strength checker
  useEffect(() => {
    if (newPassword) {
      checkPasswordStrength(newPassword);
    }
  }, [newPassword]);

  const validateToken = async (token) => {
    setTokenValidating(true);
    try {
      const response = await api.validateResetToken(token);
      if (response.data.valid) {
        setTokenValid(true);
      } else {
        setError('This password reset link is invalid or has expired.');
        setTokenValid(false);
      }
    } catch (error) {
      console.error('Error validating token:', error);
      setError('This password reset link is invalid or has expired.');
      setTokenValid(false);
    } finally {
      setTokenValidating(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await api.resetPassword(token, newPassword);
      
      if (response.data.success) {
        setSuccess(true);
        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (tokenValidating) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Validating your reset link...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '70vh',
        py: 4,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 500 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar
            sx={{
              m: 1,
              bgcolor: success ? 'success.main' : tokenValid ? 'primary.main' : 'error.main',
              width: 56,
              height: 56,
            }}
          >
            {success ? <CheckCircleOutlineIcon /> : tokenValid ? <LockResetIcon /> : <ErrorOutlineIcon />}
          </Avatar>

          <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
            {success ? 'Password Reset Successfully' : tokenValid ? 'Reset Your Password' : 'Invalid Reset Link'}
          </Typography>

          {!tokenValid && !success && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
              <Typography variant="body1" paragraph>
                The password reset link is invalid or has expired. Please request a new password reset link.
              </Typography>
              <Button
                component={Link}
                to="/forgot-password"
                variant="contained"
                color="primary"
                sx={{ mt: 2, mb: 1 }}
              >
                Request New Link
              </Button>
              <Box sx={{ mt: 2 }}>
                <MuiLink component={Link} to="/login" variant="body2">
                  Back to Login
                </MuiLink>
              </Box>
            </Box>
          )}

          {tokenValid && !success && (
            <>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                Please enter your new password below
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="newPassword"
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                  helperText={newPassword && `Password strength: ${passwordStrength.message}`}
                />
                
                {/* Password strength indicator */}
                {newPassword && (
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
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={confirmPassword && confirmPassword !== newPassword}
                  helperText={confirmPassword && confirmPassword !== newPassword ? "Passwords do not match" : ""}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  sx={{ mt: 3, mb: 2, py: 1.2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Reset Password'}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <MuiLink component={Link} to="/login" variant="body2">
                    Back to Login
                  </MuiLink>
                </Box>
              </Box>
            </>
          )}

          {success && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Your password has been successfully reset!
              </Alert>
              <Typography variant="body1" paragraph>
                You can now login with your new password.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Redirecting to login page in a few seconds...
              </Typography>
              <Button
                component={Link}
                to="/login"
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
              >
                Login Now
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ResetPassword;