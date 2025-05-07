import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, Box, Typography, Button, 
  Zoom, Slide, Avatar, Chip, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';

// Badge level colors
const BADGE_COLORS = {
  BRONZE: '#CD7F32',
  SILVER: '#C0C0C0',
  GOLD: '#FFD700'
};

const BadgeNotification = ({ open, onClose, badges = [] }) => {
  const { width, height } = useWindowSize();
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [badgeAnimated, setBadgeAnimated] = useState(false);
  
  // Reset animation state when new badges come in
  useEffect(() => {
    if (open && badges.length > 0) {
      setShowConfetti(true);
      setTimeout(() => setBadgeAnimated(true), 500);
      
      // Stop confetti after 5 seconds
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
    
    return () => {
      setShowConfetti(false);
      setBadgeAnimated(false);
    };
  }, [open, badges]);
  
  // Handle next badge
  const handleNextBadge = () => {
    if (currentBadgeIndex < badges.length - 1) {
      setBadgeAnimated(false);
      setTimeout(() => {
        setCurrentBadgeIndex(prevIndex => prevIndex + 1);
        setBadgeAnimated(true);
      }, 300);
    } else {
      onClose();
    }
  };
  
  // If there are no badges, don't show the dialog
  if (badges.length === 0) {
    return null;
  }
  
  const currentBadge = badges[currentBadgeIndex];
  const badgeLevel = currentBadge?.level || 'BRONZE';
  const badgeColor = BADGE_COLORS[badgeLevel] || BADGE_COLORS.BRONZE;
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' }}
      PaperProps={{
        sx: { 
          borderRadius: 4,
          bgcolor: 'background.paper',
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15))',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden'
        }
      }}
    >
      {showConfetti && (
        <Confetti 
          width={width} 
          height={height}
          numberOfPieces={200}
          recycle={false}
        />
      )}
      
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1
        }}
      >
        <IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Box
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0) 0%, rgba(${badgeColor === BADGE_COLORS.GOLD ? '255,215,0' : badgeColor === BADGE_COLORS.SILVER ? '192,192,192' : '205,127,50'},0.1) 100%)`
        }}
      >
        <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Achievement Unlocked!
        </Typography>
        
        <Zoom in={badgeAnimated} style={{ transitionDelay: '250ms' }}>
          <Box
            sx={{
              mt: 2,
              mb: 4,
              width: 120,
              height: 120,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme => `${badgeColor}33`,
              boxShadow: `0 0 40px ${badgeColor}66`,
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { boxShadow: `0 0 0 0 ${badgeColor}66` },
                '70%': { boxShadow: `0 0 0 15px ${badgeColor}00` },
                '100%': { boxShadow: `0 0 0 0 ${badgeColor}00` }
              }
            }}
          >
            {currentBadge.iconUrl ? (
              <Avatar
                src={currentBadge.iconUrl}
                alt={currentBadge.name}
                sx={{ 
                  width: 80, 
                  height: 80,
                  border: `3px solid ${badgeColor}`,
                  boxShadow: 3
                }}
              />
            ) : (
              <EmojiEventsIcon
                sx={{ 
                  fontSize: 80, 
                  color: badgeColor, 
                  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))'
                }}
              />
            )}
          </Box>
        </Zoom>
        
        <Zoom in={badgeAnimated} style={{ transitionDelay: '500ms' }}>
          <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
            {currentBadge.name}
          </Typography>
        </Zoom>
        
        <Zoom in={badgeAnimated} style={{ transitionDelay: '750ms' }}>
          <Chip
            label={badgeLevel}
            sx={{
              backgroundColor: badgeColor,
              color: '#000',
              fontWeight: 'bold',
              mb: 2
            }}
          />
        </Zoom>
        
        <Zoom in={badgeAnimated} style={{ transitionDelay: '1000ms' }}>
          <Typography variant="body1" paragraph align="center" sx={{ maxWidth: 400 }}>
            {currentBadge.description}
          </Typography>
        </Zoom>
      </Box>
      
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', bgcolor: 'background.paper' }}>
        {badges.length > 1 && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleNextBadge}
            sx={{ px: 4 }}
          >
            {currentBadgeIndex < badges.length - 1 ? 'Next Badge' : 'Close'}
          </Button>
        )}
        
        {badges.length === 1 && (
          <Button
            variant="contained"
            color="primary"
            onClick={onClose}
            sx={{ px: 4 }}
          >
            Close
          </Button>
        )}
      </Box>
      
      {badges.length > 1 && (
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'center', gap: 0.5 }}>
          {badges.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: index === currentBadgeIndex ? 'primary.main' : 'grey.400'
              }}
            />
          ))}
        </Box>
      )}
    </Dialog>
  );
};

export default BadgeNotification;