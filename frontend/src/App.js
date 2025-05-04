import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  IconButton
} from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import ReportIcon from '@mui/icons-material/Report';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MenuIcon from '@mui/icons-material/Menu';

import PostList from "./components/PostList";
import AdminDashboard from "./components/AdminDashboard";
import UserReports from "./components/UserReports";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { api } from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Check if user is logged in on component mount
  useEffect(() => {
    // First check the session by calling current-user endpoint
    const checkAuthStatus = async () => {
      setLoading(true);
      try {
        const response = await api.get('/auth/current-user');
        if (response.data) {
          setUser(response.data);
          localStorage.setItem('userInfo', JSON.stringify(response.data));
        }
      } catch (error) {
        // If not authenticated by session, try to use stored user info
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (parseError) {
            console.error("Error parsing user data:", parseError);
            localStorage.removeItem('userInfo');
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('userInfo');
      setUser(null);
      handleMenuClose();
      // Use a more subtle notification in a real-world app
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if the server logout fails, clear local state
      localStorage.removeItem('userInfo');
      setUser(null);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Secured route component
  const PrivateRoute = ({ children, requiredRole }) => {
    if (loading) {
      return <div>Loading...</div>;
    }
    
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    if (requiredRole && user.role !== requiredRole) {
      return <Navigate to="/" />;
    }
    
    return children;
  };

  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              Community Post Management
            </Typography>
            
            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <Button 
                color="inherit" 
                component={Link} 
                to="/"
                startIcon={<HomeIcon />}
              >
                Posts
              </Button>
              
              {user && (
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/my-reports"
                  startIcon={<ReportIcon />}
                >
                  My Reports
                </Button>
              )}
              
              {/* Admin button is hidden completely unless user is admin */}
              {user && user.role === 'ADMIN' && (
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/admin"
                  startIcon={<AdminPanelSettingsIcon />}
                >
                  Admin
                </Button>
              )}
            </Box>
            
            {!user ? (
              <Box>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/login"
                  startIcon={<LoginIcon />}
                  sx={{ mx: 1 }}
                >
                  Login
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  component={Link} 
                  to="/signup"
                  startIcon={<PersonAddIcon />}
                >
                  Signup
                </Button>
              </Box>
            ) : (
              <Box>
                <IconButton 
                  color="inherit" 
                  onClick={handleProfileMenuOpen}
                  edge="end"
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: user.role === 'ADMIN' ? 'error.main' : 'primary.main' }}>
                    {user.username[0].toUpperCase()}
                  </Avatar>
                </IconButton>
                
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle1">{user.username}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.role === 'ADMIN' ? 'Administrator' : 'User'}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem component={Link} to="/" onClick={handleMenuClose}>Home</MenuItem>
                  <MenuItem component={Link} to="/my-reports" onClick={handleMenuClose}>My Reports</MenuItem>
                  
                  {user.role === 'ADMIN' && (
                    <MenuItem component={Link} to="/admin" onClick={handleMenuClose}>
                      Admin Dashboard
                    </MenuItem>
                  )}
                  
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            )}
          </Toolbar>
        </AppBar>

        {/* Mobile Navigation Drawer */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer}
        >
          <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={toggleDrawer}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" component="div">
                Navigation
              </Typography>
            </Box>
            <Divider />
            <List>
              <ListItem button component={Link} to="/">
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Posts" />
              </ListItem>
              
              {user && (
                <ListItem button component={Link} to="/my-reports">
                  <ListItemIcon>
                    <ReportIcon />
                  </ListItemIcon>
                  <ListItemText primary="My Reports" />
                </ListItem>
              )}
              
              {user && user.role === 'ADMIN' && (
                <ListItem button component={Link} to="/admin">
                  <ListItemIcon>
                    <AdminPanelSettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Admin Dashboard" />
                </ListItem>
              )}
            </List>
            
            <Divider />
            
            <List>
              {!user ? (
                <>
                  <ListItem button component={Link} to="/login">
                    <ListItemIcon>
                      <LoginIcon />
                    </ListItemIcon>
                    <ListItemText primary="Login" />
                  </ListItem>
                  <ListItem button component={Link} to="/signup">
                    <ListItemIcon>
                      <PersonAddIcon />
                    </ListItemIcon>
                    <ListItemText primary="Signup" />
                  </ListItem>
                </>
              ) : (
                <ListItem button onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItem>
              )}
            </List>
          </Box>
        </Drawer>

        <Container sx={{ py: 4, flexGrow: 1 }}>
          <Routes>
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<PostList user={user} />} />
            
            {/* Protected routes */}
            <Route path="/my-reports" element={
              <PrivateRoute>
                <UserReports user={user} />
              </PrivateRoute>
            } />
            
            <Route path="/admin" element={
              <PrivateRoute requiredRole="ADMIN">
                <AdminDashboard user={user} />
              </PrivateRoute>
            } />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="h4" gutterBottom>Page Not Found</Typography>
                <Button variant="contained" component={Link} to="/">
                  Return to Home
                </Button>
              </Box>
            } />
          </Routes>
        </Container>
        
        <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper', mt: 'auto' }}>
          <Container maxWidth="lg">
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} Community Post Management System. All rights reserved.
            </Typography>
          </Container>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
