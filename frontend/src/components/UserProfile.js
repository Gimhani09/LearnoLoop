import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Avatar,
  Typography,
  Button,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Badge,
  Tooltip,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Chip,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SettingsIcon from '@mui/icons-material/Settings';
import GridViewIcon from '@mui/icons-material/GridView';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import AddIcon from '@mui/icons-material/Add';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import QuizIcon from '@mui/icons-material/Quiz';
import TimelineIcon from '@mui/icons-material/Timeline';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import { styled } from '@mui/system';
import { api } from '../services/api';
import UserBadges from './UserBadges';

const ProfileHeader = styled(Paper)(({ theme }) => ({
  borderRadius: 12,
  overflow: 'hidden',
  marginBottom: 24,
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
}));

const CoverPhoto = styled(Box)(({ theme }) => ({
  height: 200,
  width: '100%',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  ...(theme?.breakpoints?.down && {
    [theme.breakpoints.down('sm')]: {
      height: 120,
    },
  }),
}));

const ProfileAvatarWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginTop: -64,
  marginLeft: 32,
  marginBottom: 16,
  ...(theme?.breakpoints?.down && {
    [theme.breakpoints.down('sm')]: {
      marginTop: -50,
      marginLeft: 0,
      display: 'flex',
      justifyContent: 'center',
    },
  }),
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 128,
  height: 128,
  border: '4px solid white',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  ...(theme?.breakpoints?.down && {
    [theme.breakpoints.down('sm')]: {
      width: 100,
      height: 100,
    },
  }),
}));

const ProfileContent = styled(Box)(({ theme }) => ({
  padding: '0 32px 24px 32px',
  ...(theme?.breakpoints?.down && {
    [theme.breakpoints.down('sm')]: {
      padding: '0 16px 16px 16px',
    },
  }),
}));

const StatBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  padding: '12px 16px',
  borderRadius: 8,
  backgroundColor: theme?.palette?.background?.paper || '#ffffff', // Added fallback
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
}));

const PostImage = styled(Box)(({ theme }) => ({
  position: 'relative',
  aspectRatio: '1/1',
  borderRadius: 8,
  overflow: 'hidden',
  cursor: 'pointer',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
  },
  '&:hover::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
}));

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const ImageUploadButton = styled(Button)(({ theme }) => ({
  marginTop: theme?.spacing?.(1) || 8,
  marginBottom: theme?.spacing?.(2) || 16,
  '&:hover': {
    backgroundColor: theme?.palette?.primary?.dark || '#1976d2',
  },
}));

const UserProfile = ({ currentUser }) => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [coverPhoto, setCoverPhoto] = useState('');
  const [editData, setEditData] = useState({
    bio: '',
    fullName: '',
    website: '',
    profilePicture: '',
    coverPhoto: ''
  });
  const [stats, setStats] = useState({
    postsCount: 0,
    followersCount: 0,
    followingCount: 0
  });
  const [isFollowing, setIsFollowing] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({
    loading: false,
    success: false,
    error: null
  });
  const [previewUrls, setPreviewUrls] = useState({
    profilePicture: '',
    coverPhoto: ''
  });
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [quizAttemptsLoading, setQuizAttemptsLoading] = useState(false);
  const [badgeStats, setBadgeStats] = useState(null);
  const [badgeStatsLoading, setBadgeStatsLoading] = useState(false);

  const isOwnProfile = currentUser && (username === currentUser.username);
  const isCurrentUserAdmin = currentUser && currentUser.role === 'ADMIN';
  const isProfileUserAdmin = user && user.role === 'ADMIN';

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
    fetchSavedPosts();
    setTabValue(0);
  }, [username]);

  useEffect(() => {
    if (user && currentUser && !isOwnProfile) {
      checkFollowStatus();
    }
  }, [user, currentUser, isOwnProfile]);

  useEffect(() => {
    if (isOwnProfile) {
      fetchQuizAttempts();
      fetchBadgeStats();
    }
  }, [isOwnProfile]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await api.getUserByUsername(username);
      setUser(response.data);
      const generatedCoverPhoto = `linear-gradient(135deg, ${hashStringToColor(username + '1')}, ${hashStringToColor(username + '2')})`;
      setCoverPhoto(response.data.coverPhoto || generatedCoverPhoto);
      setEditData({
        bio: response.data.bio || '',
        fullName: response.data.fullName || '',
        website: response.data.website || '',
        profilePicture: response.data.profilePicture || '',
        coverPhoto: response.data.coverPhoto || ''
      });
      setStats({
        postsCount: response.data.postsCount || 0,
        followersCount: response.data.followersCount || 0,
        followingCount: response.data.followingCount || 0
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hashStringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  };

  const fetchUserPosts = async () => {
    try {
      const response = await api.getUserContent(username);
      if (response.data) {
        setPosts(response.data);
        setStats(prev => ({
          ...prev,
          postsCount: response.data.length
        }));
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setPosts([]);
    }
  };

  const fetchSavedPosts = async () => {
    if (!isOwnProfile) return;
    try {
      const response = await api.getSavedContent();
      setSavedPosts(response.data || []);
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      setSavedPosts([]);
    }
  };

  const checkFollowStatus = async () => {
    if (!currentUser || isOwnProfile) return;
    try {
      const response = await api.checkFollowStatus(username);
      setIsFollowing(response.data.isFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const fetchFollowers = async () => {
    if (!user || !user.id) return;
    setFollowersLoading(true);
    try {
      const response = await api.get(`/users/${user.id}/followers`);
      setFollowers(response.data || []);
    } catch (error) {
      console.error('Error fetching followers:', error);
    } finally {
      setFollowersLoading(false);
    }
  };

  const fetchFollowing = async () => {
    if (!user || !user.id) return;
    setFollowingLoading(true);
    try {
      const response = await api.get(`/users/${user.id}/following`);
      setFollowing(response.data || []);
    } catch (error) {
      console.error('Error fetching following:', error);
    } finally {
      setFollowingLoading(false);
    }
  };

  const fetchQuizAttempts = async () => {
    setQuizAttemptsLoading(true);
    try {
      const response = await api.getUserAttempts();
      if (response?.data) {
        setQuizAttempts(response.data);
      }
    } catch (err) {
      console.error('Error fetching quiz attempts:', err);
    } finally {
      setQuizAttemptsLoading(false);
    }
  };

  const fetchBadgeStats = async () => {
    setBadgeStatsLoading(true);
    try {
      const response = await api.getBadgeStats();
      if (response?.data) {
        setBadgeStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching badge stats:', err);
    } finally {
      setBadgeStatsLoading(false);
    }
  };

  const calculateAverageScore = () => {
    if (!quizAttempts || quizAttempts.length === 0) return 0;
    const totalScore = quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
    return Math.round(totalScore / quizAttempts.length);
  };

  const calculatePassRate = () => {
    if (!quizAttempts || quizAttempts.length === 0) return 0;
    const passedCount = quizAttempts.filter(attempt => attempt.passed).length;
    return Math.round((passedCount / quizAttempts.length) * 100);
  };

  const handleOpenFollowersDialog = () => {
    fetchFollowers();
    setFollowersDialogOpen(true);
  };

  const handleOpenFollowingDialog = () => {
    fetchFollowing();
    setFollowingDialogOpen(true);
  };

  const handleCloseFollowersDialog = () => {
    setFollowersDialogOpen(false);
  };

  const handleCloseFollowingDialog = () => {
    setFollowingDialogOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditOpen = () => {
    setOpenEditDialog(true);
  };

  const handleEditClose = () => {
    setOpenEditDialog(false);
  };

  const handleEditDataChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'profile') {
        setProfileImageFile(file);
        setPreviewUrls(prev => ({ ...prev, profilePicture: reader.result }));
      } else {
        setCoverImageFile(file);
        setPreviewUrls(prev => ({ ...prev, coverPhoto: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file) => {
    if (!file) return null;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.uploadImage(file);
      
      if (response && response.data && response.data.url) {
        return response.data.url;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setUploadStatus({ loading: true, success: false, error: null });
      
      let updatedData = { ...editData };
      
      if (profileImageFile) {
        try {
          const profileUrl = await uploadImage(profileImageFile);
          if (profileUrl) {
            updatedData.profilePicture = profileUrl;
          }
        } catch (err) {
          setUploadStatus({ 
            loading: false, 
            success: false, 
            error: 'Failed to upload profile image. Please try again.' 
          });
          return;
        }
      }
      
      if (coverImageFile) {
        try {
          const coverUrl = await uploadImage(coverImageFile);
          if (coverUrl) {
            updatedData.coverPhoto = coverUrl;
          }
        } catch (err) {
          setUploadStatus({ 
            loading: false, 
            success: false, 
            error: 'Failed to upload cover image. Please try again.' 
          });
          return;
        }
      }
      
      const updateResult = await api.updateUserProfile(user.id, updatedData);
      
      setUploadStatus({ loading: false, success: true, error: null });
      fetchUserProfile();
      setOpenEditDialog(false);
      
      setProfileImageFile(null);
      setCoverImageFile(null);
      setPreviewUrls({ profilePicture: '', coverPhoto: '' });
      
    } catch (error) {
      setUploadStatus({ 
        loading: false, 
        success: false, 
        error: error.response?.data?.error || 'Failed to update profile. Please try again.' 
      });
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return;
    
    if (isCurrentUserAdmin || isProfileUserAdmin) {
      return;
    }
    
    try {
      if (isFollowing) {
        await api.unfollowUser(user.id);
        setStats(prev => ({
          ...prev,
          followersCount: Math.max(0, prev.followersCount - 1)
        }));
        setIsFollowing(false);
      } else {
        await api.followUser(user.id);
        setStats(prev => ({
          ...prev,
          followersCount: prev.followersCount + 1
        }));
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };

  const handleFollowFromList = async (userId) => {
    if (!currentUser || isCurrentUserAdmin) return;
    
    try {
      const isAlreadyFollowing = following.some(f => f.id === userId);
      
      if (isAlreadyFollowing) {
        await api.unfollowUser(userId);
        setFollowing(prev => prev.filter(f => f.id !== userId));
      } else {
        await api.followUser(userId);
        const response = await api.getUserById(userId);
        setFollowing(prev => [...prev, response.data]);
      }
    } catch (error) {
      console.error('Error updating follow status from list:', error);
    }
  };

  const renderPostGrid = (postsArray) => (
    <Grid container spacing={2}>
      {postsArray.map((post) => (
        <Grid item xs={6} sm={4} key={post.id || post._id}>
          <PostImage
            component={Link}
            to={`/learn/${post.id || post._id}`}
          >
            <img
              src={post.photoUrl || `https://source.unsplash.com/random/300x300?sig=${post.id || post._id}`}
              alt={post.title}
              loading="lazy"
              style={{ 
                height: '100%', 
                width: '100%',
                objectFit: 'cover' 
              }}
            />
          </PostImage>
        </Grid>
      ))}
    </Grid>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <ProfileHeader elevation={1}>
        <CoverPhoto 
          sx={{ 
            backgroundImage: coverPhoto.startsWith('linear-gradient') 
              ? coverPhoto
              : `url(${coverPhoto})` 
          }}
        >
          {isOwnProfile && (
            <IconButton
              onClick={handleEditOpen}
              sx={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                bgcolor: 'rgba(255,255,255,0.9)',
                '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
              }}
            >
              <EditIcon />
            </IconButton>
          )}
        </CoverPhoto>
        <ProfileAvatarWrapper>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              isOwnProfile && (
                <IconButton
                  onClick={handleEditOpen}
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    '&:hover': { bgcolor: 'primary.dark' },
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                  size="small"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )
            }
          >
            <ProfileAvatar
              src={user?.profilePicture || `https://ui-avatars.com/api/?name=${username}&background=random&size=200`}
              alt={username}
            />
          </Badge>
        </ProfileAvatarWrapper>
        <ProfileContent>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            textAlign: { xs: 'center', sm: 'left' }
          }}>
            <Box sx={{ flexGrow: 1, mb: { xs: 1, sm: 0 } }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {username}
                {isProfileUserAdmin && (
                  <Tooltip title="Administrator Account" arrow>
                    <Box
                      component="span"
                      sx={{ 
                        fontSize: '0.7em', 
                        bgcolor: 'error.main', 
                        color: 'white',
                        borderRadius: 1,
                        px: 1,
                        py: 0.3,
                        ml: 1,
                        verticalAlign: 'middle'
                      }}
                    >
                      ADMIN
                    </Box>
                  </Tooltip>
                )}
              </Typography>
              <Typography variant="body1" color="text.secondary" fontWeight="medium">
                {user?.fullName || ''}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {isOwnProfile ? (
                <>
                  <Button 
                    variant="contained" 
                    onClick={handleEditOpen}
                    startIcon={<EditIcon />}
                    sx={{ 
                      bgcolor: '#3730a3',
                      '&:hover': { bgcolor: '#312e81' }
                    }}
                  >
                    Edit Profile
                  </Button>
                  <IconButton 
                    sx={{ 
                      bgcolor: 'rgba(0,0,0,0.05)', 
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' } 
                    }}
                    aria-label="settings"
                  >
                    <SettingsIcon />
                  </IconButton>
                </>
              ) : (
                !isProfileUserAdmin && !isCurrentUserAdmin && (
                  <Button 
                    variant="contained" 
                    color={isFollowing ? "inherit" : "primary"}
                    onClick={handleFollow}
                    startIcon={isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                    sx={{ 
                      minWidth: 100,
                      ...(isFollowing && {
                        bgcolor: 'white',
                        color: 'text.primary',
                        border: '1px solid',
                        borderColor: 'divider'
                      })
                    }}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )
              )}
            </Box>
          </Box>
          <Typography 
            variant="body2" 
            sx={{ 
              whiteSpace: 'pre-wrap', 
              mb: 2,
              textAlign: { xs: 'center', sm: 'left' } 
            }}
          >
            {user?.bio || ""}
          </Typography>
          {user?.website && (
            <Typography 
              variant="body2" 
              component="a" 
              href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
              target="_blank"
              rel="noopener noreferrer"
              color="primary"
              sx={{ 
                textDecoration: 'none', 
                display: 'block', 
                mb: 3,
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              {user.website}
            </Typography>
          )}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid sx={{ gridColumn: { xs: 'span 4' } }}>
              <StatBox>
                <Typography variant="h6" fontWeight="bold">
                  {stats.postsCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Posts
                </Typography>
              </StatBox>
            </Grid>
            <Grid sx={{ gridColumn: { xs: 'span 4' } }}>
              <StatBox 
                onClick={!isProfileUserAdmin ? handleOpenFollowersDialog : undefined}
                sx={{ 
                  cursor: !isProfileUserAdmin ? 'pointer' : 'default',
                  '&:hover': !isProfileUserAdmin ? {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  } : {}
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {stats.followersCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Followers
                </Typography>
              </StatBox>
            </Grid>
            <Grid sx={{ gridColumn: { xs: 'span 4' } }}>
              <StatBox 
                onClick={!isProfileUserAdmin ? handleOpenFollowingDialog : undefined}
                sx={{ 
                  cursor: !isProfileUserAdmin ? 'pointer' : 'default',
                  '&:hover': !isProfileUserAdmin ? {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  } : {}
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {stats.followingCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Following
                </Typography>
              </StatBox>
            </Grid>
          </Grid>
        </ProfileContent>
      </ProfileHeader>
      
      <Paper elevation={1} sx={{ borderRadius: 3, mb: 3, overflow: 'hidden' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth" 
          textColor="primary"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': {
              py: 2
            }
          }}
        >
          <Tab 
            icon={<GridViewIcon />} 
            label="POSTS" 
            iconPosition="start"
          />
          {isOwnProfile && (
            <Tab 
              icon={<QuizIcon />} 
              label="QUIZ PROGRESS" 
              iconPosition="start"
            />
          )}
          <Tab 
            icon={<BookmarkBorderIcon />} 
            label="SAVED" 
            disabled={!isOwnProfile}
            iconPosition="start"
          />
          <Tab 
            icon={<AccountBoxIcon />} 
            label="TAGGED"
            iconPosition="start"
          />
        </Tabs>
      </Paper>
      <Box sx={{ mt: 3 }}>
        {tabValue === 0 && (
          <Box>
            {posts.length === 0 ? (
              <Paper 
                elevation={1} 
                sx={{ 
                  textAlign: 'center', 
                  py: 6, 
                  px: 3, 
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.8)'
                }}
              >
                <AccountBoxIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>No posts yet</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {isOwnProfile ? 'Share your first photo to get started!' : `${username} hasn't posted anything yet.`}
                </Typography>
                {isOwnProfile && (
                  <Button 
                    variant="contained" 
                    component={Link} 
                    to="/create-content"
                    startIcon={<AddIcon />}
                    sx={{
                      bgcolor: '#3730a3',
                      '&:hover': { bgcolor: '#312e81' }
                    }}
                  >
                    Create Your First Post
                  </Button>
                )}
              </Paper>
            ) : (
              renderPostGrid(posts)
            )}
          </Box>
        )}
        {tabValue === 1 && isOwnProfile && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <QuizIcon sx={{ fontSize: 26, mr: 1, color: 'primary.main' }} />
              <Typography variant="h5" component="h2">
                Quiz Progress
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                component={Link}
                to="/quizzes"
                sx={{ ml: 'auto' }}
              >
                Take More Quizzes
              </Button>
            </Box>
            
            {badgeStats && !badgeStatsLoading && (
              <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }} elevation={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MilitaryTechIcon sx={{ fontSize: 26, mr: 1, color: '#FFD700' }} />
                  <Typography variant="h6" component="h3">
                    Achievement Score: {badgeStats.achievementScore}
                  </Typography>
                </Box>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                        <Box component="span" sx={{ width: 15, height: 15, borderRadius: '50%', bgcolor: '#CD7F32', display: 'inline-block' }}/>
                      </Box>
                      <Typography variant="h6">{badgeStats.badgesByLevel?.bronze || 0}</Typography>
                      <Typography variant="body2" color="text.secondary">Bronze Badges</Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                        <Box component="span" sx={{ width: 15, height: 15, borderRadius: '50%', bgcolor: '#C0C0C0', display: 'inline-block' }}/>
                      </Box>
                      <Typography variant="h6">{badgeStats.badgesByLevel?.silver || 0}</Typography>
                      <Typography variant="body2" color="text.secondary">Silver Badges</Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                        <Box component="span" sx={{ width: 15, height: 15, borderRadius: '50%', bgcolor: '#FFD700', display: 'inline-block' }}/>
                      </Box>
                      <Typography variant="h6">{badgeStats.badgesByLevel?.gold || 0}</Typography>
                      <Typography variant="body2" color="text.secondary">Gold Badges</Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(100, (badgeStats.achievementScore / 500) * 100)} 
                  sx={{ 
                    height: 12, 
                    borderRadius: 6,
                    bgcolor: 'rgba(0,0,0,0.05)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 6,
                      background: 'linear-gradient(90deg, #CD7F32 0%, #C0C0C0 50%, #FFD700 100%)'
                    }
                  }} 
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">Beginner</Typography>
                  <Typography variant="caption" color="text.secondary">Expert</Typography>
                </Box>
              </Paper>
            )}
            
            {quizAttemptsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : quizAttempts.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <SchoolIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" gutterBottom>
                  No Quiz Attempts Yet
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  You haven't taken any quizzes yet. Start improving your skills!
                </Typography>
                <Button 
                  variant="contained" 
                  component={Link} 
                  to="/quizzes"
                >
                  Browse Quizzes
                </Button>
              </Paper>
            ) : (
              <>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={3} sx={{ height: '100%' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                          <CircularProgress
                            variant="determinate"
                            value={calculateAverageScore()}
                            size={80}
                            thickness={5}
                            sx={{
                              color: theme => {
                                const score = calculateAverageScore();
                                if (score >= 80) return 'success.main';
                                if (score >= 60) return 'warning.main';
                                return 'error.main';
                              }
                            }}
                          />
                          <Box
                            sx={{
                              top: 0,
                              left: 0,
                              bottom: 0,
                              right: 0,
                              position: 'absolute',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography variant="h6" component="div">
                              {calculateAverageScore()}%
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Average Score
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={3} sx={{ height: '100%' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                          <CircularProgress
                            variant="determinate"
                            value={calculatePassRate()}
                            size={80}
                            thickness={5}
                            color="success"
                          />
                          <Box
                            sx={{
                              top: 0,
                              left: 0,
                              bottom: 0,
                              right: 0,
                              position: 'absolute',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography variant="h6" component="div">
                              {calculatePassRate()}%
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Pass Rate
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={3} sx={{ height: '100%' }}>
                      <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="h3" color="primary" fontWeight="bold" gutterBottom>
                          {quizAttempts.length}
                        </Typography>
                        <Typography variant="subtitle1">
                          Quizzes Completed
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={3} sx={{ height: '100%' }}>
                      <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Badge 
                          badgeContent={quizAttempts.filter(a => a.passed).length} 
                          color="success" 
                          sx={{ 
                            '& .MuiBadge-badge': { 
                              fontSize: 18, 
                              height: 28, 
                              width: 28,
                              borderRadius: '50%' 
                            }
                          }}
                        >
                          <EmojiEventsIcon sx={{ fontSize: 48, color: 'warning.main' }} />
                        </Badge>
                        <Typography variant="subtitle1" sx={{ mt: 2 }}>
                          Quizzes Passed
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TimelineIcon sx={{ mr: 1 }} /> Recent Quiz Activity
                </Typography>
                <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 1, mb: 4 }}>
                  {quizAttempts.slice(0, 5).map((attempt) => (
                    <Paper key={attempt.attemptId} sx={{ mb: 2, overflow: 'hidden' }} elevation={2}>
                      <ListItem 
                        sx={{ 
                          borderLeft: 6, 
                          borderColor: attempt.passed ? 'success.main' : 'error.main' 
                        }}
                        secondaryAction={
                          <Button
                            variant="outlined"
                            size="small"
                            component={Link}
                            to={`/quiz/${attempt.quizId}/review/${attempt.attemptId}`}
                          >
                            Review
                          </Button>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: attempt.passed ? 'success.light' : 'error.light' }}>
                            {attempt.passed ? <CheckCircleIcon /> : <CancelIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" component="div">
                              {attempt.quizTitle}
                              <Chip 
                                label={attempt.category} 
                                size="small" 
                                sx={{ ml: 1 }} 
                                variant="outlined" 
                              />
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mt: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                                <Typography variant="body2" component="span">
                                  Score: <strong>{attempt.score}%</strong>
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTimeFilledIcon fontSize="small" sx={{ mr: 0.5 }} />
                                <Typography variant="body2" component="span">
                                  {new Date(attempt.completedAt).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric',
                                    hour: '2-digit', 
                                    minute: '2-digit'
                                  })}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                    </Paper>
                  ))}
                </List>
                {quizAttempts.length > 5 && (
                  <Box sx={{ textAlign: 'center', mt: 2, mb: 4 }}>
                    <Button 
                      variant="outlined" 
                      component={Link} 
                      to="/quizzes"
                    >
                      View All {quizAttempts.length} Quiz Attempts
                    </Button>
                  </Box>
                )}
                
                <UserBadges isOwnProfile={true} />
              </>
            )}
          </Box>
        )}
        {tabValue === (isOwnProfile ? 2 : 1) && (
          <Box>
            {savedPosts.length === 0 ? (
              <Paper 
                elevation={1} 
                sx={{ 
                  textAlign: 'center', 
                  py: 6,
                  px: 3, 
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.8)'
                }}
              >
                <BookmarkBorderIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>No saved posts</Typography>
                <Typography variant="body2" color="text.secondary">
                  Save posts to find them later
                </Typography>
              </Paper>
            ) : (
              renderPostGrid(savedPosts)
            )}
          </Box>
        )}
        {tabValue === (isOwnProfile ? 3 : 2) && (
          <Paper 
            elevation={1} 
            sx={{ 
              textAlign: 'center', 
              py: 6,
              px: 3, 
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.8)'
            }}
          >
            <AccountBoxIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>No photos with {username}</Typography>
            <Typography variant="body2" color="text.secondary">
              When people tag {username} in photos, they'll appear here.
            </Typography>
          </Paper>
        )}
      </Box>
      
      <Dialog 
        open={followersDialogOpen} 
        onClose={handleCloseFollowersDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ px: 3, py: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Followers</Typography>
            <IconButton onClick={handleCloseFollowersDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {followersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : followers.length > 0 ? (
            <List>
              {followers.map((follower) => (
                <React.Fragment key={follower.id}>
                  <ListItem
                    alignItems="center"
                    secondaryAction={
                      currentUser && 
                      currentUser.id !== follower.id && 
                      !isCurrentUserAdmin &&
                      follower.role !== 'ADMIN' && (
                        <Button 
                          variant={following.some(f => f.id === follower.id) ? "outlined" : "contained"}
                          size="small"
                          onClick={() => handleFollowFromList(follower.id)}
                        >
                          {following.some(f => f.id === follower.id) ? 'Following' : 'Follow'}
                        </Button>
                      )
                    }
                  >
                    <ListItemAvatar>
                      <Avatar 
                        src={follower.profilePicture || `https://ui-avatars.com/api/?name=${follower.username}&background=random`}
                        alt={follower.username}
                        component={Link}
                        to={`/profile/${follower.username}`}
                        sx={{ cursor: 'pointer' }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography 
                          component={Link} 
                          to={`/profile/${follower.username}`}
                          sx={{ 
                            textDecoration: 'none', 
                            color: 'text.primary',
                            fontWeight: 'medium',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          {follower.username}
                          {follower.role === 'ADMIN' && (
                            <Box
                              component="span"
                              sx={{ 
                                fontSize: '0.7em', 
                                bgcolor: 'error.main', 
                                color: 'white',
                                borderRadius: 1,
                                px: 1,
                                py: 0.3,
                                ml: 1,
                                verticalAlign: 'middle'
                              }}
                            >
                              ADMIN
                            </Box>
                          )}
                        </Typography>
                      }
                      secondary={follower.fullName || ''}
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ px: 3, py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {username} has no followers yet.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog 
        open={followingDialogOpen} 
        onClose={handleCloseFollowingDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ px: 3, py: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Following</Typography>
            <IconButton onClick={handleCloseFollowingDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {followingLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : following.length > 0 ? (
            <List>
              {following.map((followed) => (
                <React.Fragment key={followed.id}>
                  <ListItem
                    alignItems="center"
                    secondaryAction={
                      currentUser && 
                      currentUser.id !== followed.id && 
                      !isCurrentUserAdmin &&
                      followed.role !== 'ADMIN' && (
                        <Button 
                          variant="outlined"
                          size="small"
                          onClick={() => handleFollowFromList(followed.id)}
                        >
                          Following
                        </Button>
                      )
                    }
                  >
                    <ListItemAvatar>
                      <Avatar 
                        src={followed.profilePicture || `https://ui-avatars.com/api/?name=${followed.username}&background=random`}
                        alt={followed.username}
                        component={Link}
                        to={`/profile/${followed.username}`}
                        sx={{ cursor: 'pointer' }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography 
                          component={Link} 
                          to={`/profile/${followed.username}`}
                          sx={{ 
                            textDecoration: 'none', 
                            color: 'text.primary',
                            fontWeight: 'medium',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          {followed.username}
                          {followed.role === 'ADMIN' && (
                            <Box
                              component="span"
                              sx={{ 
                                fontSize: '0.7em', 
                                bgcolor: 'error.main', 
                                color: 'white',
                                borderRadius: 1,
                                px: 1,
                                py: 0.3,
                                ml: 1,
                                verticalAlign: 'middle'
                              }}
                            >
                              ADMIN
                            </Box>
                          )}
                        </Typography>
                      }
                      secondary={followed.fullName || ''}
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ px: 3, py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {username} is not following anyone yet.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog 
        open={openEditDialog} 
        onClose={handleEditClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: '#f5f7fa', py: 2 }}>
          <Typography variant="h6" component="div">Edit Your Profile</Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Box component="form" noValidate>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <ProfileAvatar
                src={previewUrls.profilePicture || editData.profilePicture || `https://ui-avatars.com/api/?name=${username}&background=random&size=200`}
                alt={username}
                sx={{ width: 120, height: 120, mb: 2 }}
              />
              
              <ImageUploadButton
                component="label"
                variant="contained"
                startIcon={<AddAPhotoIcon />}
                size="small"
              >
                Upload Profile Picture
                <VisuallyHiddenInput 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'profile')}
                />
              </ImageUploadButton>
              
              {profileImageFile && (
                <Typography variant="caption" color="textSecondary">
                  Selected: {profileImageFile.name}
                </Typography>
              )}
            </Box>
            
            <Box sx={{ mb: 3, border: '1px solid #eee', borderRadius: 1, overflow: 'hidden' }}>
              <Box
                sx={{
                  height: 100,
                  width: '100%',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundImage: previewUrls.coverPhoto 
                    ? `url(${previewUrls.coverPhoto})` 
                    : (editData.coverPhoto 
                        ? `url(${editData.coverPhoto})`
                        : `linear-gradient(135deg, ${hashStringToColor(username + '1')}, ${hashStringToColor(username + '2')})`)
                }}
              />
              <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
                <Button
                  component="label"
                  startIcon={<PhotoCameraIcon />}
                  size="small"
                >
                  Upload Cover Photo
                  <VisuallyHiddenInput 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'cover')}
                  />
                </Button>
              </Box>
              
              {coverImageFile && (
                <Typography variant="caption" color="textSecondary" align="center" sx={{ display: 'block', mb: 1 }}>
                  Selected: {coverImageFile.name}
                </Typography>
              )}
            </Box>
            
            {uploadStatus.error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {uploadStatus.error}
              </Alert>
            )}
            
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Profile Information
            </Typography>

            <TextField
              margin="normal"
              fullWidth
              label="Full Name"
              name="fullName"
              value={editData.fullName || ''}
              onChange={handleEditDataChange}
              variant="outlined"
              size="small"
            />
            
            <TextField
              margin="normal"
              fullWidth
              label="Bio"
              name="bio"
              multiline
              rows={4}
              value={editData.bio || ''}
              onChange={handleEditDataChange}
              placeholder="Tell us about yourself..."
              variant="outlined"
            />
            
            <TextField
              margin="normal"
              fullWidth
              label="Website"
              name="website"
              value={editData.website || ''}
              onChange={handleEditDataChange}
              placeholder="Your website URL"
              variant="outlined"
              size="small"
            />
            
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
              <Typography variant="subtitle2" gutterBottom>
                Advanced Options
              </Typography>
              
              <TextField
                margin="normal"
                fullWidth
                label="Profile Picture URL"
                name="profilePicture"
                value={editData.profilePicture || ''}
                onChange={handleEditDataChange}
                variant="outlined"
                size="small"
                helperText="Alternative to file upload: Enter an image URL"
              />
              
              <TextField
                margin="normal"
                fullWidth
                label="Cover Photo URL"
                name="coverPhoto"
                value={editData.coverPhoto || ''}
                onChange={handleEditDataChange}
                variant="outlined"
                size="small"
                helperText="Alternative to file upload: Enter an image URL or leave blank for a generated cover"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f5f7fa' }}>
          <Button 
            onClick={handleEditClose}
            variant="outlined"
            disabled={uploadStatus.loading}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleProfileUpdate}
            disabled={uploadStatus.loading}
            startIcon={uploadStatus.loading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              bgcolor: '#3730a3',
              '&:hover': { bgcolor: '#312e81' }
            }}
          >
            {uploadStatus.loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserProfile;