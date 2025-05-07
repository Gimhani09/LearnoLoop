import React, { useState, useEffect, forwardRef } from 'react';
import { 
  Snackbar, 
  Alert, 
  Typography, 
  Box, 
  Slide, 
  Grow, 
  IconButton,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import CelebrationIcon from '@mui/icons-material/Celebration';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

// Funny quotes for different notification types
const funnyQuotes = {
  error: [
    "Oops! That didn't work. Have you tried turning it off and on again?",
    "Houston, we have a problem! But don't worry, it's not rocket science.",
    "Error 404: Success not found. But keep smiling anyway!",
    "Well, that was unexpected! Like finding a penguin in your refrigerator.",
    "Something went wrong. Maybe Mercury is in retrograde?",
    "That's not supposed to happen. Our hamsters must be tired from running on their wheels."
  ],
  success: [
    "High five! You nailed it! 🖐️",
    "Woohoo! If this was a video game, you'd get an achievement!",
    "Success! Time to do a little victory dance! 💃",
    "Awesome sauce! You're on fire today!",
    "That worked so well, even the developers are surprised!",
    "Mission accomplished! The force is strong with this one."
  ],
  info: [
    "Just FYI: This notification is trying its best to be informative and funny at the same time.",
    "Here's a fun fact: You're looking at an info message right now!",
    "Attention! This is important... or maybe not. I forget sometimes.",
    "Did you know? Reading this notification burns exactly 0.0001 calories.",
    "Info alert: Your day just got a tiny bit more interesting."
  ],
  warning: [
    "Gentle reminder: This might be important, but we didn't want to use the scary red color.",
    "Caution: Proceed with enthusiasm, but maybe a little less than before.",
    "Warning: This notification contains warnings. Meta, right?",
    "Heads up! Something might be amiss. Or not. We're just covering our bases.",
    "Just a friendly warning. Like when your friend tells you there's spinach in your teeth."
  ]
};

// Random emojis to include in notifications
const emojis = ['😂', '🤣', '😎', '🎉', '💥', '🚀', '🌟', '👍', '💪', '🤦‍♂️', '🤷‍♀️', '🐱‍👤', '🦄'];

// Get random item from array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Animation components
const FunSlide = forwardRef((props, ref) => {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FunGrow = forwardRef((props, ref) => {
  return <Grow ref={ref} {...props} />;
});

// Main notification component
const FunNotification = ({ 
  open, 
  message, 
  severity = 'info', 
  autoHideDuration = 6000, 
  onClose,
  useFunnyMessage = true,
  animate = true
}) => {
  const [funMessage, setFunMessage] = useState('');
  const [emoji, setEmoji] = useState('');
  const [animation, setAnimation] = useState(null);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    if (open) {
      // Get funny message if enabled
      if (useFunnyMessage) {
        setFunMessage(getRandomItem(funnyQuotes[severity] || funnyQuotes.info));
      } else {
        setFunMessage('');
      }
      // Add emoji
      setEmoji(getRandomItem(emojis));
      // Set animation
      setAnimation(Math.random() > 0.5 ? FunSlide : FunGrow);
      
      // Add bounce effect
      if (animate) {
        const bounceInterval = setInterval(() => {
          setBounce(prev => !prev);
        }, 500);
        
        return () => clearInterval(bounceInterval);
      }
    }
  }, [open, severity, useFunnyMessage, animate]);

  // Icon selection based on severity
  const getIcon = () => {
    switch (severity) {
      case 'error':
        return <SentimentVeryDissatisfiedIcon fontSize="inherit" />;
      case 'success':
        return <SentimentVerySatisfiedIcon fontSize="inherit" />;
      case 'warning':
        return <PriorityHighIcon fontSize="inherit" />;
      case 'info':
        return <ThumbUpAltIcon fontSize="inherit" />;
      default:
        return <CelebrationIcon fontSize="inherit" />;
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      TransitionComponent={animation}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 2, 
          overflow: 'hidden',
          transform: bounce ? 'scale(1.03)' : 'scale(1)',
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        <Alert
          severity={severity}
          icon={getIcon()}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={onClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ width: '100%' }}
        >
          <Box>
            <Typography variant="body1">
              {message}
            </Typography>
            {funMessage && (
              <Typography 
                variant="body2" 
                sx={{ 
                  fontStyle: 'italic',
                  mt: 0.5,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {funMessage} {emoji}
              </Typography>
            )}
          </Box>
        </Alert>
      </Paper>
    </Snackbar>
  );
};

export default FunNotification;