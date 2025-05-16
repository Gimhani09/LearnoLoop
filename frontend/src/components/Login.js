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
  Tooltip,
  Snackbar
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';

const Login = ({ setUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminModeActive, setAdminModeActive] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [adminClicks, setAdminClicks] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      console.log("Attempting login with:", { username });
      const response = await api.login({ username, password });
      console.log("Login response:", response);
      
      if (response && response.data) {
        setUser(response.data);
        // Store user info for UI purposes
        localStorage.setItem('userInfo', JSON.stringify(response.data));
        
        // Redirect based on role
        if (response.data.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        setError(`Login failed: ${error.response.data?.error || error.response.statusText || "Invalid credentials"}`);
      } else if (error.request) {
        setError("No response received from server. Please try again.");
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Hidden admin login detection
  const handleLogoClick = () => {
    // Secret click counter for admin access
    setAdminClicks(prevCount => {
      const newCount = prevCount + 1;
      if (newCount === 3) {
        setAdminModeActive(true);
        setSnackbarOpen(true);
        return 0; // Reset counter
      }
      return newCount;
    });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleAdminLogin = () => {
    setUsername("admin");
    setPassword("admin");
  };
  //form
  

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      minHeight: '60vh'
    }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Tooltip title={adminModeActive ? "Admin mode activated" : ""}>
            <IconButton 
              size="large" 
              onClick={handleLogoClick}
              color={adminModeActive ? "error" : "default"}
            >
              <LockIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Login
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            required
            autoFocus
          />
          
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          
          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || !username.trim() || !password.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
          
          <Typography align="center">
            <Link href="/signup" underline="hover">
              Don't have an account? Sign up
            </Link>
          </Typography>
        </Box>
        
        {adminModeActive && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Administrator Access
              </Typography>
            </Divider>
            
            <Box sx={{ textAlign: 'center' }}>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={handleAdminLogin}
                startIcon={<LockIcon />}
                size="small"
              >
                Admin Login
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message="Admin access mode activated"
      />
    </Box>
  );
};

export default Login;