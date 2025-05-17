import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Paper, Chip, 
  Card, CardContent, CardMedia, Tooltip, Skeleton,
  LinearProgress, Divider, Alert
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import PsychologyIcon from '@mui/icons-material/Psychology';
import StarIcon from '@mui/icons-material/Star';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { api } from '../services/api';

const UserBadges = ({ userId, username, isOwnProfile }) => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBadges = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let response;
        
        if (isOwnProfile) {
          response = await api.getMyBadges();
        } else if (userId) {
          response = await api.getUserBadges(userId);
        } else if (username) {
          response = await api.getBadgesByUsername(username);
        }
        
        if (response?.data) {
          setBadges(response.data);
        }
      } catch (err) {
        console.error("Error fetching badges:", err);
        setError("Failed to load badges. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    if (userId || username || isOwnProfile) {
      fetchBadges();
    }
  }, [userId, username, isOwnProfile]);

  // Map badge type to icon
  const getBadgeIcon = (badgeType) => {
    switch(badgeType) {
      case 'QUIZ_NOVICE':
        return <SchoolIcon fontSize="large" />;
      case 'QUIZ_MASTER':
        return <WorkspacePremiumIcon fontSize="large" />;
      case 'PERFECT_SCORE':
        return <StarIcon fontSize="large" />;
      case 'FAST_LEARNER':
        return <PsychologyIcon fontSize="large" />;
      case 'SUBJECT_EXPERT':
        return <PsychologyIcon fontSize="large" />;
      case 'STREAK_MASTER':
        return <LocalFireDepartmentIcon fontSize="large" />;
      default:
        return <EmojiEventsIcon fontSize="large" />;
    }
  };
  
  // Get color for badge level
  const getBadgeLevelColor = (level) => {
    switch(level) {
      case 'BRONZE':
        return '#CD7F32';
      case 'SILVER':
        return '#C0C0C0';
      case 'GOLD':
        return '#FFD700';
      default:
        return '#C0C0C0';
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ my: 3 }}>
        <Typography variant="h5" gutterBottom>Achievements</Typography>
        <Grid container spacing={3}>
          {[1, 2, 3].map(i => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={160} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }
  
  if (error) {
    return <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>;
  }
  
  // Group badges by level for display
  const bronzeBadges = badges.filter(badge => badge.level === 'BRONZE');
  const silverBadges = badges.filter(badge => badge.level === 'SILVER');
  const goldBadges = badges.filter(badge => badge.level === 'GOLD');
  
  // If no badges, show a placeholder
  if (badges.length === 0) {
    return (
      <Box sx={{ my: 3 }}>
        <Typography variant="h5" gutterBottom>
          Achievements
        </Typography>
        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <EmojiEventsIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
          </Box>
          <Typography variant="h6" color="text.secondary">
            No Badges Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {isOwnProfile 
              ? "Complete quizzes to earn achievement badges"
              : "This user hasn't earned any badges yet"}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ my: 3 }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <MilitaryTechIcon sx={{ mr: 1, color: 'primary.main', fontSize: 30 }} />
        <Typography variant="h5" component="h2">
          Achievements ({badges.length})
        </Typography>
      </Box>

      {goldBadges.length > 0 && (
        <>
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', mt: 3 }}>
            <Box 
              component="span" 
              sx={{ 
                width: 20, 
                height: 20, 
                borderRadius: '50%', 
                bgcolor: '#FFD700', 
                mr: 1, 
                display: 'inline-block' 
              }} 
            />
            <Typography variant="subtitle1" component="span" fontWeight="bold">
              Gold Badges ({goldBadges.length})
            </Typography>
          </Box>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {goldBadges.map(badge => (
              <Grid item xs={12} sm={6} md={4} key={badge.id}>
                <BadgeCard badge={badge} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {silverBadges.length > 0 && (
        <>
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', mt: 3 }}>
            <Box 
              component="span" 
              sx={{ 
                width: 20, 
                height: 20, 
                borderRadius: '50%', 
                bgcolor: '#C0C0C0', 
                mr: 1, 
                display: 'inline-block' 
              }} 
            />
            <Typography variant="subtitle1" component="span" fontWeight="bold">
              Silver Badges ({silverBadges.length})
            </Typography>
          </Box>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {silverBadges.map(badge => (
              <Grid item xs={12} sm={6} md={4} key={badge.id}>
                <BadgeCard badge={badge} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {bronzeBadges.length > 0 && (
        <>
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', mt: 3 }}>
            <Box 
              component="span" 
              sx={{ 
                width: 20, 
                height: 20, 
                borderRadius: '50%', 
                bgcolor: '#CD7F32', 
                mr: 1, 
                display: 'inline-block' 
              }} 
            />
            <Typography variant="subtitle1" component="span" fontWeight="bold">
              Bronze Badges ({bronzeBadges.length})
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {bronzeBadges.map(badge => (
              <Grid item xs={12} sm={6} md={4} key={badge.id}>
                <BadgeCard badge={badge} />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

// Helper component for individual badge cards
const BadgeCard = ({ badge }) => {
  const levelColor = {
    'BRONZE': '#CD7F32',
    'SILVER': '#C0C0C0',
    'GOLD': '#FFD700',
  }[badge.level] || '#C0C0C0';

  const getIconByType = (type) => {
    switch(type) {
      case 'QUIZ_NOVICE': return <SchoolIcon fontSize="large" />;
      case 'QUIZ_MASTER': return <WorkspacePremiumIcon fontSize="large" />;
      case 'PERFECT_SCORE': return <StarIcon fontSize="large" />;
      case 'SUBJECT_EXPERT': return <PsychologyIcon fontSize="large" />;
      case 'STREAK_MASTER': return <LocalFireDepartmentIcon fontSize="large" />;
      default: return <EmojiEventsIcon fontSize="large" />;
    }
  };
  
  const earnedDate = new Date(badge.earnedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <Card 
      elevation={2} 
      sx={{ 
        height: '100%',
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6
        }
      }}
    >
      <CardContent sx={{ p: 3, textAlign: 'center' }}>
        <Box 
          sx={{ 
            width: 70, 
            height: 70, 
            bgcolor: `${levelColor}22`, 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            mx: 'auto',
            color: levelColor
          }}
        >
          {getIconByType(badge.badgeType)}
        </Box>
        
        <Typography variant="h6" gutterBottom>
          {badge.badgeName}
        </Typography>
        
        <Chip 
          label={badge.level.charAt(0) + badge.level.slice(1).toLowerCase()}
          size="small"
          sx={{ 
            mb: 1, 
            bgcolor: `${levelColor}22`,
            color: badge.level === 'GOLD' ? 'grey.800' : 'inherit',
            fontWeight: 'bold'
          }} 
        />
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {badge.description}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="caption" color="text.secondary">
          Earned on {earnedDate}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default UserBadges;