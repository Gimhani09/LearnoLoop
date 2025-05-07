import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  LinearProgress,
  Paper,
  Stack,
  Skeleton,
  Button,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Modal,
  Backdrop
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import MoodIcon from '@mui/icons-material/Mood';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import SendIcon from '@mui/icons-material/Send';
import { styled } from '@mui/material/styles';
import { api } from '../services/api';

// Custom styled component for story thumbnails - using squares with rounded corners
const StoryThumbnail = styled(Box)(({ theme, seen }) => ({
  width: 64,
  height: 64,
  borderRadius: 12,
  padding: 3,
  position: 'relative',
  backgroundImage: seen ? 
    'linear-gradient(white, white), linear-gradient(to right, #dbdbdb, #dbdbdb)' : 
    'linear-gradient(white, white), linear-gradient(120deg, #06b6d4 0%, #7e22ce 50%, #3730a3 100%)',
  backgroundOrigin: 'border-box',
  backgroundClip: 'content-box, border-box',
  border: '2px solid transparent',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  }
}));

// Custom avatar that fills the square thumbnail
const SquareAvatar = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  borderRadius: 8,
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.grey[200],
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 100%)',
    zIndex: 1
  }
}));

// Hidden file input for uploading story images
const Input = styled('input')({
  display: 'none',
});

const StoryCreator = ({ open, onClose, onStoryCreated, user }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select an image for your story');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create form data
      const formData = new FormData();
      formData.append('image', file);
      formData.append('caption', caption);
      formData.append('userId', user.id || user._id);

      // In a real implementation, this would call your API endpoint
      // const response = await api.createStory(formData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a new story object (this would come from your API in real implementation)
      const newStory = {
        id: Math.random().toString(36).substring(2, 9),
        user: {
          id: user.id || user._id,
          username: user.username,
          profilePicture: user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}&background=random`
        },
        caption: caption,
        imageUrl: previewUrl,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        seen: false
      };

      // Reset form
      setFile(null);
      setPreviewUrl(null);
      setCaption('');
      
      // Close modal and notify parent component
      onStoryCreated(newStory);
      onClose();
      
    } catch (error) {
      console.error('Error creating story:', error);
      setError('Failed to create story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setCaption('');
    setError('');
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!loading) onClose();
      }}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: 400 },
        bgcolor: 'background.paper',
        borderRadius: 3,
        boxShadow: 24,
        p: 4
      }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Create Story
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mt: 2, mb: 3 }}>
          {previewUrl ? (
            <Box sx={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <img
                src={previewUrl}
                alt="Story preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  objectFit: 'contain',
                  borderRadius: 8
                }}
              />
              <IconButton
                size="small"
                onClick={handleReset}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <Box
              sx={{
                width: '100%',
                height: 200,
                borderRadius: 3,
                bgcolor: '#f0f9ff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                border: '2px dashed #3730a3',
                cursor: 'pointer'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <PhotoCameraIcon sx={{ fontSize: 40, color: '#3730a3', mb: 2 }} />
              <Typography variant="body2" color="text.secondary" align="center">
                Click to select an image for your story
              </Typography>
              <Input
                ref={fileInputRef}
                accept="image/*"
                type="file"
                onChange={handleFileSelect}
              />
            </Box>
          )}
        </Box>
        
        <TextField
          fullWidth
          label="Add a caption"
          variant="outlined"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          margin="normal"
          disabled={!previewUrl || loading}
        />
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!previewUrl || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {loading ? 'Posting...' : 'Post Story'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

const StoryCircle = ({ user, seen, onClick, isCurrentUser, onAddStory }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 1, maxWidth: 74 }}>
      {isCurrentUser ? (
        <Box sx={{ position: 'relative' }}>
          <StoryThumbnail seen={seen} onClick={onAddStory}>
            <SquareAvatar>
              {user.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={user.username}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                  {user.username ? user.username[0].toUpperCase() : '?'}
                </Typography>
              )}
            </SquareAvatar>
          </StoryThumbnail>
          <Box 
            sx={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              bgcolor: '#3730a3',
              borderRadius: '40%', 
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              cursor: 'pointer'
            }}
            onClick={onAddStory}
          >
            <AddIcon sx={{ fontSize: 16, color: 'white' }} />
          </Box>
        </Box>
      ) : (
        <StoryThumbnail 
          seen={seen} 
          onClick={onClick}
        >
          <SquareAvatar>
            {user.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt={user.username}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Typography variant="subtitle1" fontWeight="bold" color="primary">
                {user.username ? user.username[0].toUpperCase() : '?'}
              </Typography>
            )}
          </SquareAvatar>
        </StoryThumbnail>
      )}
      <Typography 
        variant="caption" 
        noWrap 
        sx={{ 
          mt: 1, 
          width: '100%', 
          textAlign: 'center',
          fontSize: '0.7rem',
          fontWeight: seen ? 'normal' : 'medium',
          color: seen ? 'text.secondary' : 'text.primary'
        }}
      >
        {isCurrentUser ? 'Your story' : user.username}
      </Typography>
    </Box>
  );
};

const StoryViewDialog = ({ open, onClose, story, onNext, onPrev, hasNext, hasPrev, onReply }) => {
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [paused, setPaused] = useState(false);
  const [showReplyField, setShowReplyField] = useState(false);
  const progressTimerRef = useRef(null);

  useEffect(() => {
    // Clear the timer when component unmounts or when story changes
    let timerId = null;
    
    if (open && !paused) {
      setProgress(0);
      timerId = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress === 100) {
            clearInterval(timerId);
            if (hasNext) {
              onNext();
            } else {
              onClose();
            }
            return 0;
          }
          const diff = 0.5;
          return Math.min(oldProgress + diff, 100);
        });
      }, 50);
      
      // Store the timer ref for potential pause/resume
      progressTimerRef.current = timerId;
    }

    // Cleanup function that runs when component unmounts or dependencies change
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };
  }, [open, story, onNext, onClose, hasNext, paused]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!open) return;
      
      switch(e.key) {
        case 'ArrowRight':
        case ' ': // Space key
          if (hasNext) onNext();
          break;
        case 'ArrowLeft':
          if (hasPrev) onPrev();
          break;
        case 'Escape':
          onClose();
          break;
        case 'Enter':
          if (showReplyField && replyText.trim()) {
            handleReplySubmit();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, hasNext, hasPrev, onNext, onPrev, onClose, showReplyField, replyText]);

  const handlePauseProgress = () => {
    setPaused(true);
    clearInterval(progressTimerRef.current);
  };

  const handleResumeProgress = () => {
    setPaused(false);
  };

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onReply(story.id, replyText);
      setReplyText('');
      setShowReplyField(false);
      handleResumeProgress();
    }
  };

  const toggleReplyField = () => {
    if (showReplyField) {
      setShowReplyField(false);
      handleResumeProgress();
    } else {
      setShowReplyField(true);
      handlePauseProgress();
    }
  };

  if (!story) return null;

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          backgroundColor: '#0f172a',
          color: 'white',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
        }
      }}
      onMouseEnter={handlePauseProgress}
      onMouseLeave={handleResumeProgress}
      onTouchStart={handlePauseProgress}
      onTouchEnd={handleResumeProgress}
    >
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            height: 3, 
            backgroundColor: 'rgba(255,255,255,0.3)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#06b6d4'
            }
          }} 
        />
      </Box>

      <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', zIndex: 1 }}>
        <Box 
          sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: 2,
            overflow: 'hidden',
            mr: 1.5,
            border: '2px solid #7e22ce'
          }}
        >
          <img 
            src={story.user.profilePicture || `https://ui-avatars.com/api/?name=${story.user.username}&background=random`} 
            alt={story.user.username}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
        <Typography variant="body2" fontWeight="medium">{story.user.username}</Typography>
      </Box>

      {hasPrev && (
        <IconButton 
          sx={{ 
            position: 'absolute', 
            left: 10, 
            top: '50%', 
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(15,23,42,0.7)', 
            color: 'white', 
            zIndex: 1,
            '&:hover': {
              backgroundColor: '#3730a3'
            }
          }} 
          onClick={onPrev}
          aria-label="Previous story"
        >
          <ArrowBackIosNewIcon />
        </IconButton>
      )}
      
      {hasNext && (
        <IconButton 
          sx={{ 
            position: 'absolute', 
            right: 10, 
            top: '50%', 
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(15,23,42,0.7)', 
            color: 'white', 
            zIndex: 1,
            '&:hover': {
              backgroundColor: '#3730a3'
            }
          }} 
          onClick={onNext}
          aria-label="Next story"
        >
          <ArrowForwardIosIcon />
        </IconButton>
      )}
      
      <DialogContent 
        sx={{ 
          p: 0, 
          height: '70vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
          <img 
            src={story.imageUrl} 
            alt="Story" 
            style={{ 
              height: '100%', 
              width: '100%', 
              objectFit: 'contain',
              borderRadius: 8
            }} 
          />
          
          {story.caption && (
            <Box sx={{
              position: 'absolute',
              bottom: '10%',
              left: 0,
              right: 0,
              p: 2,
              textAlign: 'center'
            }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'white', 
                  textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                  fontWeight: '500'
                }}
              >
                {story.caption}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <Box 
        sx={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          p: 2,
          bgcolor: 'rgba(15,23,42,0.7)',
          transition: 'transform 0.3s ease',
          transform: showReplyField ? 'translateY(0)' : 'translateY(70%)',
          '&:hover': {
            transform: 'translateY(0)'
          }
        }}
      >
        {showReplyField ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Reply to this story..."
              variant="outlined"
              size="small"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              autoFocus
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                  borderRadius: 3
                }
              }}
            />
            <IconButton 
              color="primary" 
              sx={{ ml: 1 }}
              onClick={handleReplySubmit}
              disabled={!replyText.trim()}
            >
              <SendIcon />
            </IconButton>
            <IconButton 
              color="inherit" 
              sx={{ ml: 0.5 }}
              onClick={toggleReplyField}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        ) : (
          <Button 
            variant="contained" 
            fullWidth 
            onClick={toggleReplyField}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.3)'
              }
            }}
          >
            Reply to story
          </Button>
        )}
      </Box>
    </Dialog>
  );
};

const Stories = ({ currentUser }) => {
  const [stories, setStories] = useState([]);
  const [userStories, setUserStories] = useState([]);
  const [selectedStoryGroup, setSelectedStoryGroup] = useState(null);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const scrollStep = 300;

  useEffect(() => {
    fetchStories();
  }, []);

  // Group stories by user with useMemo for performance optimization
  const groupedStories = useMemo(() => {
    return stories.reduce((acc, story) => {
      const userId = story.user.id;
      if (!acc[userId]) {
        acc[userId] = {
          user: story.user,
          stories: [],
          latestStory: null,
          seen: true
        };
      }
      
      acc[userId].stories.push(story);
      
      // Update latest story and seen status
      if (!acc[userId].latestStory || new Date(story.createdAt) > new Date(acc[userId].latestStory.createdAt)) {
        acc[userId].latestStory = story;
        // If any story is unseen, the user's circle should be highlighted
        if (!story.seen) {
          acc[userId].seen = false;
        }
      }
      
      return acc;
    }, {});
  }, [stories]);
  
  // Convert to array for rendering
  const storyGroups = useMemo(() => Object.values(groupedStories), [groupedStories]);

  const fetchStories = async () => {
    try {
      // This should be updated to match your API endpoint
      // const response = await api.getStories();
      // setStories(response.data);
      
      // Use dummy data for demonstration
      const dummyStories = [
        {
          id: "s1",
          user: {
            id: "u101",
            username: "john_doe",
            profilePicture: "https://source.unsplash.com/random/100x100/?portrait&sig=1"
          },
          caption: "Beautiful sunset at the beach",
          seen: false,
          imageUrl: "https://source.unsplash.com/random/1080x1920/?sunset&beach&sig=1",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
          id: "s2",
          user: {
            id: "u101",
            username: "john_doe",
            profilePicture: "https://source.unsplash.com/random/100x100/?portrait&sig=1"
          },
          caption: "Check out this amazing view!",
          seen: false,
          imageUrl: "https://source.unsplash.com/random/1080x1920/?mountain&view&sig=2",
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
        },
        {
          id: "s3",
          user: {
            id: "u102",
            username: "jane_smith",
            profilePicture: "https://source.unsplash.com/random/100x100/?portrait&sig=2"
          },
          caption: "Coffee time ☕",
          seen: false,
          imageUrl: "https://source.unsplash.com/random/1080x1920/?coffee&sig=3",
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
        },
        {
          id: "s4",
          user: {
            id: "u103",
            username: "sam_wilson",
            profilePicture: "https://source.unsplash.com/random/100x100/?portrait&sig=3"
          },
          caption: "Exploring the city",
          seen: true,
          imageUrl: "https://source.unsplash.com/random/1080x1920/?city&sig=4",
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
        },
        {
          id: "s5",
          user: {
            id: "u104",
            username: "emma_jones",
            profilePicture: "https://source.unsplash.com/random/100x100/?portrait&sig=4"
          },
          caption: "Delicious lunch! 🍕",
          seen: false,
          imageUrl: "https://source.unsplash.com/random/1080x1920/?food&pizza&sig=5",
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
        }
      ];
      
      // If currentUser exists, check for their stories
      if (currentUser) {
        const myStories = [
          {
            id: "ms1",
            user: {
              id: currentUser.id || currentUser._id,
              username: currentUser.username,
              profilePicture: currentUser.profilePicture || `https://ui-avatars.com/api/?name=${currentUser.username}&background=random`
            },
            caption: "My latest story",
            seen: true,
            imageUrl: "https://source.unsplash.com/random/1080x1920/?nature&sig=20",
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
          }
        ];
        
        setUserStories(myStories);
      }
      
      setStories(dummyStories);
    } catch (error) {
      console.error('Error fetching stories:', error);
      // Initialize with empty array in case of error
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryGroupClick = (storyGroup) => {
    setSelectedStoryGroup(storyGroup);
    setSelectedStoryIndex(0); // Start with the first story in the group
    setDialogOpen(true);
    
    // Mark story as seen locally
    const updatedStories = stories.map(s => {
      if (s.user.id === storyGroup.user.id) {
        return { ...s, seen: true };
      }
      return s;
    });
    
    setStories(updatedStories);

    // In a real app, you would call an API to mark the story as seen
    // api.markStorySeen(story.id).catch(error => {
    //   console.error('Error marking story as seen:', error);
    // });
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedStoryGroup(null);
  };

  const handleNextStory = () => {
    if (!selectedStoryGroup) return;
    
    if (selectedStoryIndex < selectedStoryGroup.stories.length - 1) {
      setSelectedStoryIndex(selectedStoryIndex + 1);
    } else {
      // Move to the next user's story group
      const currentGroupIndex = storyGroups.findIndex(
        group => group.user.id === selectedStoryGroup.user.id
      );
      
      if (currentGroupIndex < storyGroups.length - 1) {
        setSelectedStoryGroup(storyGroups[currentGroupIndex + 1]);
        setSelectedStoryIndex(0);
      } else {
        // No more stories, close the dialog
        handleDialogClose();
      }
    }
  };

  const handlePrevStory = () => {
    if (!selectedStoryGroup) return;
    
    if (selectedStoryIndex > 0) {
      setSelectedStoryIndex(selectedStoryIndex - 1);
    } else {
      // Move to the previous user's story group, last story
      const currentGroupIndex = storyGroups.findIndex(
        group => group.user.id === selectedStoryGroup.user.id
      );
      
      if (currentGroupIndex > 0) {
        const prevGroup = storyGroups[currentGroupIndex - 1];
        setSelectedStoryGroup(prevGroup);
        setSelectedStoryIndex(prevGroup.stories.length - 1);
      }
    }
  };

  const handleScrollLeft = () => {
    const newPosition = Math.max(0, scrollPosition - scrollStep);
    setScrollPosition(newPosition);
    document.getElementById('stories-container').scrollLeft = newPosition;
  };

  const handleScrollRight = () => {
    const storiesContainer = document.getElementById('stories-container');
    const newPosition = Math.min(
      storiesContainer.scrollWidth - storiesContainer.clientWidth,
      scrollPosition + scrollStep
    );
    setScrollPosition(newPosition);
    storiesContainer.scrollLeft = newPosition;
  };

  const handleAddStory = () => {
    if (!currentUser) return;
    setCreateStoryOpen(true);
  };

  const handleStoryCreated = (newStory) => {
    setUserStories([newStory, ...userStories]);
    setNotification({
      open: true,
      message: 'Your story has been posted successfully!',
      severity: 'success'
    });
  };

  const handleReply = (storyId, replyText) => {
    // In a real app, you would call your API to send the reply
    console.log(`Replying to story ${storyId}: ${replyText}`);
    
    setNotification({
      open: true,
      message: 'Reply sent successfully!',
      severity: 'success'
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <Paper 
        elevation={1} 
        sx={{ 
          overflowX: 'hidden', 
          display: 'flex',
          p: 2,
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(to right, #f0f9ff, #e0f2fe)'
        }}
      >
        <Stack direction="row" spacing={2}>
          {[1, 2, 3, 4, 5].map((item) => (
            <Box key={item} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 70 }}>
              <Skeleton variant="rounded" width={64} height={64} sx={{ borderRadius: 3 }} />
              <Skeleton variant="text" width={50} height={20} sx={{ mt: 1 }} />
            </Box>
          ))}
        </Stack>
      </Paper>
    );
  }

  // No stories to display (including user's own stories)
  if (!storyGroups.length && !userStories.length && !currentUser) {
    return null;
  }

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        position: 'relative',
        mb: 3,
        pt: 2,
        pb: 1,
        px: 1,
        borderRadius: 3,
        background: 'linear-gradient(to right, #f0f9ff, #e0f2fe)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          overflowX: 'auto', 
          scrollBehavior: 'smooth',
          msOverflowStyle: 'none', /* IE and Edge */
          scrollbarWidth: 'none', /* Firefox */
          '&::-webkit-scrollbar': {
            display: 'none'  /* Chrome, Safari and Opera */
          },
          pb: 1
        }}
        id="stories-container"
      >
        {/* Current user's story creation option (only show if user is logged in) */}
        {currentUser && (
          <StoryCircle 
            user={currentUser} 
            seen={false} 
            isCurrentUser={true}
            onAddStory={handleAddStory}
          />
        )}

        {/* Current user's existing stories - only show if user has stories but no "Add Story" circle was shown */}
        {currentUser && userStories.length > 0 && (
          <StoryCircle 
            user={currentUser}
            seen={userStories.every(s => s.seen)}
            onClick={() => handleStoryGroupClick({
              user: currentUser,
              stories: userStories,
            })}
          />
        )}

        {/* Other users' stories */}
        {storyGroups.filter(group => {
          // Only show stories from other users (not the current user)
          if (!currentUser) return true;
          
          const currentUserId = currentUser.id || currentUser._id;
          const groupUserId = group.user.id;
          
          return currentUserId !== groupUserId;
        }).map((storyGroup) => (
          <StoryCircle 
            key={storyGroup.user.id} 
            user={storyGroup.user} 
            seen={storyGroup.seen}
            onClick={() => handleStoryGroupClick(storyGroup)}
          />
        ))}
      </Box>

      {/* Scroll buttons if we have many stories */}
      {(storyGroups.length > 5 || (currentUser && storyGroups.length > 4)) && (
        <>
          {scrollPosition > 0 && (
            <Button 
              onClick={handleScrollLeft}
              sx={{ 
                minWidth: 'auto',
                position: 'absolute',
                left: 0,
                top: '40%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '12px',
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
                color: '#3730a3',
                '&:hover': {
                  bgcolor: '#e0f2fe',
                }
              }}
              aria-label="Scroll stories left"
            >
              <ArrowBackIosNewIcon fontSize="small" />
            </Button>
          )}
          
          <Button 
            onClick={handleScrollRight}
            sx={{ 
              minWidth: 'auto',
              position: 'absolute',
              right: 0,
              top: '40%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '12px',
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 2,
              color: '#3730a3',
              '&:hover': {
                bgcolor: '#e0f2fe',
              }
            }}
            aria-label="Scroll stories right"
          >
            <ArrowForwardIosIcon fontSize="small" />
          </Button>
        </>
      )}

      {/* Story viewer dialog */}
      {selectedStoryGroup && (
        <StoryViewDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          story={selectedStoryGroup.stories[selectedStoryIndex]}
          onNext={handleNextStory}
          onPrev={handlePrevStory}
          hasNext={
            selectedStoryIndex < selectedStoryGroup.stories.length - 1 || 
            storyGroups.findIndex(group => group.user.id === selectedStoryGroup.user.id) < storyGroups.length - 1
          }
          hasPrev={
            selectedStoryIndex > 0 || 
            storyGroups.findIndex(group => group.user.id === selectedStoryGroup.user.id) > 0
          }
          onReply={handleReply}
        />
      )}

      {/* Create story dialog */}
      {currentUser && (
        <StoryCreator
          open={createStoryOpen}
          onClose={() => setCreateStoryOpen(false)}
          onStoryCreated={handleStoryCreated}
          user={currentUser}
        />
      )}

      {/* Notifications */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={5000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default Stories;