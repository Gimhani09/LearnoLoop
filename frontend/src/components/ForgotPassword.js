import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Avatar,
  Link as MuiLink,
} from '@mui/material';
import { Link } from 'react-router-dom';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import EmailIcon from '@mui/icons-material/Email';
import { api } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await api.forgotPassword(email);
      setSuccess(true);
      setEmailSent(true);
    } catch (error) {
      console.error('Error requesting password reset:', error);
      // We don't show specific errors to prevent email enumeration
      setEmailSent(true); // Still show email sent message even if there's an error
    } finally {
      setLoading(false);
    }
  };

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
              bgcolor: 'primary.main',
              width: 56,
              height: 56,
            }}
          >
            <LockOpenIcon />
          </Avatar>

          <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
            Forgot Password
          </Typography>

          {!emailSent ? (
            <>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                Enter your email address and we'll send you a link to reset your password
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
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <EmailIcon sx={{ color: 'text.secondary', mr: 1 }} fontSize="small" />
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{ mt: 3, mb: 2, py: 1.2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <MuiLink component={Link} to="/login" variant="body2">
                    Back to Login
                  </MuiLink>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                If the email address {email} is registered with us, you will receive a password reset link shortly.
                Please check your email inbox and spam folder.
              </Alert>
              
              <Typography variant="body1" paragraph>
                The reset link will expire in 1 hour.
              </Typography>
              
              <Button
                component={Link}
                to="/login"
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
              >
                Return to Login
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;