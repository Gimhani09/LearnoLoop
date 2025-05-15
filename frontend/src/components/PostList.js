import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    CardMedia,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Menu,
    MenuItem,
    FormHelperText,
    Box,
    Alert,
    Chip,
    CardActions,
    Divider,
    Container,
    Paper,
    CircularProgress,
    Stack,
    useMediaQuery,
    useTheme,
    Tooltip,
    Link,
    ListItemIcon,
    Fab,
    Avatar,
    CardHeader
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FlagIcon from '@mui/icons-material/Flag';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import CreatePost from './CreatePost';

// Educational categories/subjects for content tagging
const LEARNING_CATEGORIES = [
  "Mathematics",
  "Science",
  "Literature",
  "History",
  "Computer Science",
  "Languages",
  "Arts",
  "Business",
  "Health",
  "Other"
];

// Learning levels
const LEARNING_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "All Levels"
];

const LearningFeed = ({ user, userContentOnly }) => {
    const [learningContent, setLearningContent] = useState([]);
    const [selectedContent, setSelectedContent] = useState(null);
    const [openReportDialog, setOpenReportDialog] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuContentId, setMenuContentId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reportError, setReportError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [debugInfo, setDebugInfo] = useState('');
    const [loading, setLoading] = useState(true);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [contentToEdit, setContentToEdit] = useState(null);
    const [endorsedContent, setEndorsedContent] = useState({});
    const [endorsementCounts, setEndorsementCounts] = useState({});
    const [savedContent, setSavedContent] = useState({});
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
    const navigate = useNavigate();
    const location = useLocation();

    const reportReasons = [
        "Inaccurate Information",
        "Inappropriate Content",
        "Copyright Violation",
        "Misleading Content",
        "Harmful Content",
        "Hate Speech",
        "Other"
    ];
    
    useEffect(() => {
        if (userContentOnly && user) {
            fetchUserContent();
        } else if (!userContentOnly) {
            fetchLearningContent();
        }
    }, [userContentOnly, user]);

    useEffect(() => {
        if (user && learningContent.length > 0) {
            // Only fetch these once we have learning content and a user
            fetchUserEndorsements();
            fetchUserSavedContent();
        }
    }, [user, learningContent.length]); // Use learningContent.length instead of learningContent array

    const fetchUserContent = async () => {
        if (!user) return;
        
        setLoading(true);
        try {
            const username = user.username;
            console.log('Fetching content for username:', username);
            // Using username instead of userId as the API requires username parameter
            const response = await api.getUserContent(username);
            console.log('User learning content fetched:', response.data);
            const processedContent = response.data.map(enhanceContentWithDefaults);
            setLearningContent(processedContent);
            fetchEndorsementCounts(processedContent);
        } catch (error) {
            console.error('Error fetching user learning content:', error);
            setLearningContent([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const fetchLearningContent = async () => {
        setLoading(true);
        try {
            const response = await api.getLearningContent();
            console.log('Learning content fetched:', response.data);
            const processedContent = response.data.map(enhanceContentWithDefaults);
            // Sort content by creation date (newest first)
            const sortedContent = processedContent.sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            setLearningContent(sortedContent);
            fetchEndorsementCounts(sortedContent);
        } catch (error) {
            console.error('Error fetching learning content:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to enhance content with default values and educational metadata
    const enhanceContentWithDefaults = (content) => {
        // Ensure ID is consistent
        if (!content._id && content.id) {
            content._id = content.id;
        }

        // Default image based on content title or category
        if (!content.photoUrl) {
            const category = content.category || getRandomCategory();
            content.photoUrl = `https://source.unsplash.com/random/800x600/?${encodeURIComponent(category + ' education')}`;
        }
        
        // Add timestamp for sorting if not present
        if (!content.createdAt) {
            content.createdAt = new Date().toISOString();
        }

        // Add educational metadata if not present
        if (!content.category) {
            content.category = getRandomCategory();
        }

        if (!content.level) {
            content.level = getRandomLevel();
        }

        if (!content.estimatedTime) {
            content.estimatedTime = Math.floor(Math.random() * 30) + 5; // 5-35 minutes
        }

        return content;
    };

    const getRandomCategory = () => {
        return LEARNING_CATEGORIES[Math.floor(Math.random() * LEARNING_CATEGORIES.length)];
    };

    const getRandomLevel = () => {
        return LEARNING_LEVELS[Math.floor(Math.random() * LEARNING_LEVELS.length)];
    };

    const fetchEndorsementCounts = async (contentList) => {
        const counts = {};
        for (const content of contentList) {
            const contentId = content._id || content.id;
            try {
                const response = await api.getEndorsements(contentId);
                counts[contentId] = response.data.length;
            } catch (error) {
                console.error(`Error fetching endorsements for content ${contentId}:`, error);
                counts[contentId] = 0;
            }
        }
        setEndorsementCounts(counts);
    };

    const fetchUserEndorsements = async () => {
        if (!user) return;
        
        const userId = user._id || user.id;
        const userEndorsements = {};
        
        for (const content of learningContent) {
            const contentId = content._id || content.id;
            try {
                const response = await api.getEndorsements(contentId);
                userEndorsements[contentId] = response.data.some(like => like.userId === userId);
            } catch (error) {
                console.error(`Error checking if user endorsed content ${contentId}:`, error);
                userEndorsements[contentId] = false;
            }
        }
        
        setEndorsedContent(userEndorsements);
    };
    
    const fetchUserSavedContent = async () => {
        if (!user) return;
        
        try {
            // Note: This is a placeholder - you'll need to implement this API endpoint
            const response = await api.getSavedContent();
            const userSaves = {};
            response.data.forEach(save => {
                userSaves[save.postId] = true;
            });
            setSavedContent(userSaves);
        } catch (error) {
            console.error('Error fetching saved content:', error);
            // For now, just initialize with empty object
            setSavedContent({});
        }
    };

    const handleEndorseToggle = async (contentId) => {
        if (!user) {
            navigate('/login');
            return;
        }

        const userId = user._id || user.id;
        const currentlyEndorsed = endorsedContent[contentId] || false;
        
        try {
            if (currentlyEndorsed) {
                await api.removeEndorsement(contentId, userId);
                setEndorsementCounts(prev => ({
                    ...prev,
                    [contentId]: Math.max(0, (prev[contentId] || 0) - 1)
                }));
            } else {
                await api.endorseContent(contentId, userId);
                setEndorsementCounts(prev => ({
                    ...prev,
                    [contentId]: (prev[contentId] || 0) + 1
                }));
            }
            
            setEndorsedContent(prev => ({
                ...prev,
                [contentId]: !currentlyEndorsed
            }));
        } catch (error) {
            console.error('Error toggling endorsement:', error);
        }
    };
    
    const handleSaveToggle = async (contentId) => {
        if (!user) {
            navigate('/login');
            return;
        }

        const currentlySaved = savedContent[contentId] || false;
        
        try {
            // These API endpoints would need to be implemented
            if (currentlySaved) {
                // await api.unsavePost(contentId);
                console.log('Learning content unsaved:', contentId);
            } else {
                // await api.savePost(contentId);
                console.log('Learning content saved:', contentId);
            }
            
            setSavedContent(prev => ({
                ...prev,
                [contentId]: !currentlySaved
            }));
        } catch (error) {
            console.error('Error toggling save:', error);
        }
    };

    const handleShare = (contentId) => {
        const shareUrl = `${window.location.origin}/learn/${contentId}`;
        
        try {
            navigator.clipboard.writeText(shareUrl);
            alert('Link copied to clipboard! Share this knowledge with others.');
        } catch (error) {
            console.error('Could not copy to clipboard:', error);
            alert('Could not copy to clipboard. The URL is: ' + shareUrl);
        }
    };

    const handleMenuOpen = (event, content) => {
        setAnchorEl(event.currentTarget);
        const contentId = content._id || content.id;
        console.log('Selected content with ID:', contentId, 'Full content:', content);
        setMenuContentId(contentId);
        setSelectedContent(content);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuContentId(null);
    };

    const handleReportClick = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        
        const content = learningContent.find(p => (p._id === menuContentId || p.id === menuContentId));
        if (!content) {
            console.error('No content found with ID:', menuContentId);
            setDebugInfo(`No content found with ID: ${menuContentId}. Available content: ${learningContent.map(p => p._id || p.id).join(', ')}`);
            return;
        }
        console.log('Found content to report:', content);
        setSelectedContent(content);
        setOpenReportDialog(true);
        setReportReason('');
        setReportDescription('');
        handleMenuClose();
    };

    const handleEditClick = () => {
        setContentToEdit(selectedContent);
        setOpenCreateDialog(true);
        handleMenuClose();
    };

    const handleDeleteClick = () => {
        setOpenDeleteDialog(true);
        handleMenuClose();
    };

    const handleDeleteConfirm = async () => {
        try {
            setIsSubmitting(true);
            const contentId = selectedContent._id || selectedContent.id;
            await api.deleteContent(contentId);
            if (userContentOnly) {
                fetchUserContent();
            } else {
                fetchLearningContent();
            }
            setOpenDeleteDialog(false);
            alert('Learning content deleted successfully');
        } catch (error) {
            console.error('Error deleting learning content:', error);
            alert('Failed to delete learning content');
        } finally {
            setIsSubmitting(false);
        }
    };

    const validateInputs = () => {
        const errors = {};
        if (!selectedContent) {
            errors.contentId = "Content ID is missing. Please try selecting another item.";
            console.error('validateInputs: selectedContent is null');
        } else if (!selectedContent._id && !selectedContent.id) {
            errors.contentId = "Content ID is missing. Please try selecting another item.";
            console.error('validateInputs: selectedContent has no ID property', selectedContent);
        }
        if (reportDescription.length < 10) {
            errors.description = "Description must be at least 10 characters";
        }
        if (!reportReason.trim()) {
            errors.reason = "Reason is required";
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleReportSubmit = async () => {
        if (!user) {
            alert('Please log in to report content');
            setOpenReportDialog(false);
            navigate('/login');
            return;
        }

        if (!validateInputs()) {
            return;
        }

        try {
            setIsSubmitting(true);
            setReportError('');
            setDebugInfo('');
            console.log('Selected Content:', selectedContent);
            console.log('Current User:', user);
            const contentId = selectedContent._id || selectedContent.id;
            if (!contentId) {
                throw new Error('Content ID is missing, cannot submit report');
            }
            const reportData = {
                postId: contentId,
                reportedByUserId: user._id || user.id,
                reason: reportReason,
                description: reportDescription
            };
            console.log('Submitting report with:', reportData);
            const response = await api.createReport(reportData);
            console.log('Report submission response:', response);
            setOpenReportDialog(false);
            setReportReason('');
            setReportDescription('');
            setValidationErrors({});
            alert('Report submitted successfully! Our educational team will review it.');
        } catch (error) {
            console.error('Error submitting report:', error);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
                if (error.response.data && typeof error.response.data === 'string' && error.response.data.includes('Validation failed')) {
                    if (error.response.data.includes('postId')) {
                        setValidationErrors(prev => ({...prev, contentId: "Content ID is required"}));
                    }
                    if (error.response.data.includes('description')) {
                        setValidationErrors(prev => ({...prev, description: "Description must be at least 10 characters"}));
                    }
                } else {
                    setReportError(`Server error: ${error.response.data?.error || error.response.statusText}`);
                }
            } else if (error.request) {
                console.error('No response received:', error.request);
                setReportError('No response received from the server. Please try again later.');
            } else {
                setReportError(`Error: ${error.message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDialogClose = () => {
        setOpenReportDialog(false);
        setReportError('');
        setValidationErrors({});
        setReportReason('');
        setReportDescription('');
        setDebugInfo('');
    };

    const handleReasonSelect = (reason) => {
        setReportReason(reason);
    };

    const handleCreateContentSuccess = (newContent) => {
        console.log('Learning content created successfully:', newContent);
        setOpenCreateDialog(false);
        setContentToEdit(null);
        if (userContentOnly) {
            fetchUserContent();
        } else {
            fetchLearningContent();
        }
    };

    const isContentOwner = (content) => {
        if (!user || !content) return false;
        
        // Check both ID and username for better compatibility
        const userId = user.id || user._id;
        const contentOwnerId = content.userId || content.user_id;
        const usernameMatch = content.username === user.username;
        const idMatch = userId === contentOwnerId;
        
        console.log('Ownership check:', {
            contentId: content._id || content.id,
            contentUsername: content.username,
            userUsername: user.username,
            userId: userId,
            contentOwnerId: contentOwnerId,
            usernameMatch,
            idMatch
        });
        
        return idMatch || usernameMatch;
    };

    const formatRelativeTime = (dateString) => {
        if (!dateString) return '';
        
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return `${diffInSeconds} seconds ago`;
        }
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
        }
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
        }
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
        }
        
        // For older dates, return the formatted date
        return date.toLocaleDateString();
    };
    
    const navigateToUserProfile = (username) => {
        navigate(`/profile/${username}`);
    };

    const getCategoryColor = (category) => {
        const categoryColors = {
            "Mathematics": "#2196F3",
            "Science": "#4CAF50",
            "Literature": "#9C27B0",
            "History": "#FF9800",
            "Computer Science": "#00BCD4",
            "Languages": "#3F51B5",
            "Arts": "#F44336",
            "Business": "#795548",
            "Health": "#E91E63",
            "Other": "#607D8B"
        };
        return categoryColors[category] || "#607D8B";
    };

    const getLevelBadge = (level) => {
        const levelClass = {
            "Beginner": "beginner",
            "Intermediate": "intermediate",
            "Advanced": "advanced",
            "All Levels": ""
        };
        return levelClass[level] || "";
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>
                    Loading learning content...
                </Typography>
            </Container>
        );
    }

    return (
        <Container 
            maxWidth={isDesktop ? "md" : "sm"} 
            sx={{ py: 2 }}
            disableGutters={isMobile}
        >
            {/* Feed header */}
            <Box sx={{ px: 2, mb: 4 }}>
                <Typography variant="h5" component="h1" fontWeight="600" className="fade-in">
                    {userContentOnly ? "My Learning Content" : "LearnoLoop Feed"}
                </Typography>
                {!userContentOnly && (
                    <Typography variant="subtitle1" color="text.secondary" className="fade-in">
                        Discover new knowledge and share your insights with the learning community
                    </Typography>
                )}
            </Box>
            
            {/* Mobile floating action button for creating content */}
            {user && isMobile && (
                <Fab
                    color="primary"
                    aria-label="add"
                    sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
                    onClick={() => {
                        setContentToEdit(null);
                        setOpenCreateDialog(true);
                    }}
                >
                    <AddIcon />
                </Fab>
            )}
            
            {learningContent.length === 0 ? (
                <Paper elevation={1} sx={{ p: 4, textAlign: 'center', my: 4 }} className="learn-card fade-in">
                    <SchoolIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2, opacity: 0.7 }} />
                    <Typography variant="h6" gutterBottom>
                        {userContentOnly 
                            ? "You haven't created any learning content yet."
                            : "No learning content available at the moment."}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        {user 
                            ? userContentOnly 
                                ? "Share your knowledge with the community by creating your first learning content!"
                                : "Be the first to share educational content in our community!" 
                            : "Check back later for new content, or sign in to share your knowledge."}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        {user ? (
                            <Button 
                                variant="contained" 
                                className="btn-learn"
                                startIcon={<EmojiObjectsIcon />}
                                onClick={() => {
                                    setContentToEdit(null);
                                    setOpenCreateDialog(true);
                                }}
                            >
                                Create Learning Content
                            </Button>
                        ) : (
                            <Button 
                                variant="contained" 
                                className="btn-learn"
                                component={RouterLink} 
                                to="/login"
                            >
                                Sign in to contribute
                            </Button>
                        )}
                    </Box>
                </Paper>
            ) : (
                <Stack spacing={3}>
                    {learningContent.map((content) => {
                        const contentId = content._id || content.id;
                        const isEndorsed = endorsedContent[contentId] || false;
                        const isSaved = savedContent[contentId] || false;
                        const endorsementCount = endorsementCounts[contentId] || 0;
                        return (
                            <Card key={contentId} elevation={1} sx={{ 
                                maxWidth: '100%', 
                                borderRadius: isMobile ? 0 : 2,
                                overflow: 'hidden'
                            }} className="learn-card fade-in">
                                {/* Level badge */}
                                {content.level && (
                                    <Chip
                                        label={content.level}
                                        size="small"
                                        className={`tag ${getLevelBadge(content.level)}`}
                                        sx={{ 
                                            position: 'absolute', 
                                            top: 12, 
                                            right: 12,
                                            zIndex: 1
                                        }}
                                    />
                                )}

                                <CardHeader
                                    avatar={
                                        <Avatar 
                                            src={content.userProfilePicture || `https://ui-avatars.com/api/?name=${content.username}&background=random`}
                                            alt={content.username}
                                            sx={{ cursor: 'pointer' }}
                                            onClick={() => navigateToUserProfile(content.username)}
                                        >
                                            {content.username ? content.username[0].toUpperCase() : 'U'}
                                        </Avatar>
                                    }
                                    action={
                                        <IconButton 
                                            onClick={(e) => handleMenuOpen(e, content)}
                                            aria-label="settings"
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    }
                                    title={
                                        <Typography 
                                            variant="subtitle2" 
                                            component="span" 
                                            sx={{ 
                                                fontWeight: 'bold',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => navigateToUserProfile(content.username)}
                                        >
                                            {content.username || 'Anonymous Educator'}
                                        </Typography>
                                    }
                                    subheader={
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                            {content.category && (
                                                <Chip
                                                    label={content.category}
                                                    size="small"
                                                    sx={{ 
                                                        height: 22,
                                                        fontSize: '0.75rem',
                                                        backgroundColor: getCategoryColor(content.category),
                                                        color: 'white',
                                                        mr: 1
                                                    }}
                                                />
                                            )}
                                            {content.estimatedTime && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {content.estimatedTime} min read
                                                </Typography>
                                            )}
                                        </Box>
                                    }
                                />
                                
                                {/* Content Image */}
                                {content.photoUrl && !content.videoUrl && (
                                    <CardMedia
                                        component="img"
                                        image={content.photoUrl}
                                        alt={content.title}
                                        sx={{ 
                                            cursor: 'pointer',
                                            height: { xs: '200px', sm: '300px' },
                                            objectFit: 'cover',
                                            backgroundColor: '#f0f0f0'
                                        }}
                                        onClick={() => navigate(`/learn/${contentId}`)}
                                    />
                                )}
                                
                                {/* Content Video */}
                                {content.videoUrl && (
                                    <Box sx={{ 
                                        position: 'relative',
                                        height: { xs: '200px', sm: '300px' },
                                        backgroundColor: '#000',
                                        cursor: 'pointer'
                                    }}>
                                        <CardMedia
                                            component="video"
                                            image={content.videoUrl}
                                            alt={content.title}
                                            controls
                                            preload="metadata"
                                            poster={content.photoUrl || undefined}
                                            sx={{ 
                                                height: '100%',
                                                width: '100%',
                                                objectFit: 'contain'
                                            }}
                                            onClick={(e) => {
                                                // Prevent navigation when clicking directly on the video to allow controls to work
                                                e.stopPropagation();
                                            }}
                                        />
                                        <Chip
                                            icon={<VideoLibraryIcon fontSize="small" />}
                                            label="Video"
                                            size="small"
                                            color="primary"
                                            sx={{ 
                                                position: 'absolute',
                                                top: 8,
                                                left: 8
                                            }}
                                        />
                                        <Box 
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: 'rgba(0,0,0,0.3)',
                                                opacity: 0,
                                                transition: 'opacity 0.3s',
                                                '&:hover': {
                                                    opacity: 1
                                                }
                                            }}
                                            onClick={() => navigate(`/learn/${contentId}`)}
                                        >
                                            <Box sx={{ 
                                                bgcolor: 'rgba(255,255,255,0.8)', 
                                                borderRadius: '50%',
                                                display: 'flex',
                                                p: 1
                                            }}>
                                                <PlayArrowIcon fontSize="large" color="primary" />
                                            </Box>
                                        </Box>
                                    </Box>
                                )}
                                
                                {/* Content title and description */}
                                <CardContent sx={{ pt: 2 }}>
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            '&:hover': { color: 'primary.main' }
                                        }}
                                        onClick={() => navigate(`/learn/${contentId}`)}
                                    >
                                        {content.title || "Untitled Learning Content"}
                                    </Typography>
                                    
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary" 
                                        sx={{ 
                                            mt: 1,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                        }}
                                    >
                                        {content.description || "No description provided for this learning content."}
                                    </Typography>
                                </CardContent>
                                
                                {/* Content Actions */}
                                <CardActions disableSpacing>
                                    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                                        <Box>
                                            <Tooltip title={isEndorsed ? "Remove endorsement" : "Endorse this content"}>
                                                <IconButton 
                                                    onClick={() => handleEndorseToggle(contentId)}
                                                    color={isEndorsed ? "primary" : "default"}
                                                >
                                                    {isEndorsed ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                                                </IconButton>
                                            </Tooltip>
                                            
                                            <Tooltip title="Discuss">
                                                <IconButton onClick={() => navigate(`/learn/${contentId}`)}>
                                                    <ChatBubbleOutlineIcon />
                                                </IconButton>
                                            </Tooltip>
                                            
                                            <Tooltip title="Share knowledge">
                                                <IconButton onClick={() => handleShare(contentId)}>
                                                    <ShareIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                        
                                        <Tooltip title={isSaved ? "Remove from learning list" : "Save to learning list"}>
                                            <IconButton 
                                                onClick={() => handleSaveToggle(contentId)}
                                                color={isSaved ? "primary" : "default"}
                                            >
                                                {isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </CardActions>
                                
                                <Box sx={{ px: 2, pb: 2 }}>
                                    {endorsementCount > 0 && (
                                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                                            {endorsementCount} {endorsementCount === 1 ? 'endorsement' : 'endorsements'}
                                        </Typography>
                                    )}
                                    
                                    {/* View discussion link */}
                                    <Button 
                                        sx={{ 
                                            p: 0, 
                                            mt: 1, 
                                            textTransform: 'none', 
                                            color: 'primary.main',
                                            justifyContent: 'flex-start'
                                        }}
                                        onClick={() => navigate(`/learn/${contentId}`)}
                                    >
                                        View full content & discussion
                                    </Button>
                                    
                                    {/* Timestamp */}
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                        {formatRelativeTime(content.createdAt)}
                                    </Typography>
                                </Box>
                            </Card>
                        );
                    })}
                </Stack>
            )}
            
            {/* Action button for creating content - desktop view */}
            {user && !isMobile && !userContentOnly && (
                <Tooltip title="Share your knowledge">
                    <Fab
                        color="primary"
                        aria-label="add"
                        sx={{ position: 'fixed', bottom: 24, right: 24 }}
                        onClick={() => {
                            setContentToEdit(null);
                            setOpenCreateDialog(true);
                        }}
                    >
                        <AddIcon />
                    </Fab>
                </Tooltip>
            )}

            {/* Content options menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                {user && isContentOwner(selectedContent) && (
                    <>
                        <MenuItem onClick={handleEditClick}>
                            <ListItemIcon>
                                <EditIcon fontSize="small" />
                            </ListItemIcon>
                            Edit Content
                        </MenuItem>
                        <MenuItem onClick={handleDeleteClick}>
                            <ListItemIcon>
                                <DeleteIcon fontSize="small" />
                            </ListItemIcon>
                            Delete Content
                        </MenuItem>
                        <Divider />
                    </>
                )}
                
                {user ? (
                    <MenuItem onClick={handleReportClick}>
                        <ListItemIcon>
                            <FlagIcon fontSize="small" />
                        </ListItemIcon>
                        Report Content
                    </MenuItem>
                ) : (
                    <MenuItem onClick={() => {
                        navigate('/login');
                        handleMenuClose();
                    }}>
                        <ListItemIcon>
                            <FlagIcon fontSize="small" />
                        </ListItemIcon>
                        Login to Report
                    </MenuItem>
                )}
            </Menu>

            {/* Report dialog */}
            <Dialog 
                open={openReportDialog} 
                onClose={handleDialogClose} 
                maxWidth="sm" 
                fullWidth
                fullScreen={isMobile}
            >
                <DialogTitle>
                    Report Learning Content
                    <Typography variant="subtitle2" color="text.secondary">
                        Help us maintain quality educational standards
                    </Typography>
                </DialogTitle>
                
                <DialogContent dividers>
                    {reportError && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {reportError}
                        </Alert>
                    )}
                    
                    {validationErrors.contentId && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {validationErrors.contentId}
                        </Alert>
                    )}
                    
                    {debugInfo && (
                        <Alert severity="warning" sx={{ mb: 3 }}>
                            {debugInfo}
                        </Alert>
                    )}
                    
                    {selectedContent && (
                        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                {selectedContent.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {selectedContent.description && selectedContent.description.length > 100
                                    ? `${selectedContent.description.substring(0, 100)}...`
                                    : selectedContent.description || "No description"}
                            </Typography>
                        </Paper>
                    )}
                    
                    <Typography variant="subtitle2" gutterBottom>
                        Reason for reporting
                    </Typography>
                    
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {reportReasons.map((reason) => (
                            <Chip
                                key={reason}
                                label={reason}
                                onClick={() => handleReasonSelect(reason)}
                                color={reportReason === reason ? "primary" : "default"}
                                variant={reportReason === reason ? "filled" : "outlined"}
                            />
                        ))}
                    </Stack>
                    
                    {reportReason === "Other" && (
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Specify reason"
                            fullWidth
                            value={reportReason === "Other" ? "" : reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            error={!!validationErrors.reason}
                            helperText={validationErrors.reason || "Please specify your reason"}
                            sx={{ mb: 2 }}
                        />
                    )}
                    
                    <Typography variant="subtitle2" gutterBottom>
                        Detailed description
                    </Typography>
                    
                    <TextField
                        margin="dense"
                        placeholder="Please explain the issue in detail..."
                        fullWidth
                        multiline
                        rows={4}
                        value={reportDescription}
                        onChange={(e) => setReportDescription(e.target.value)}
                        error={!!validationErrors.description}
                        helperText={validationErrors.description || "Provide at least 10 characters explaining why you're reporting this content"}
                        variant="outlined"
                    />
                    
                    <FormHelperText sx={{ mt: 2 }}>
                        Our education team will review this report. Thank you for helping maintain the quality of our learning content.
                    </FormHelperText>
                </DialogContent>
                
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleDialogClose}>Cancel</Button>
                    <Button 
                        onClick={handleReportSubmit} 
                        color="primary"
                        variant="contained"
                        disabled={isSubmitting || !reportReason.trim() || reportDescription.length < 10}
                        startIcon={isSubmitting ? <CircularProgress size={20} /> : <FlagIcon />}
                        className="btn-learn"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Report'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create/Edit content dialog */}
            <CreatePost
                user={user}
                postToEdit={contentToEdit}
                open={openCreateDialog}
                onClose={() => {
                    setOpenCreateDialog(false);
                    setContentToEdit(null);
                }}
                onPostCreated={handleCreateContentSuccess}
            />

            {/* Delete confirmation dialog */}
            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
            >
                <DialogTitle>Delete Learning Content</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this learning content? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                    <Button 
                        onClick={handleDeleteConfirm} 
                        color="error"
                        variant="contained"
                        disabled={isSubmitting}
                        className="btn-learn"
                    >
                        {isSubmitting ? <CircularProgress size={24} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default LearningFeed;
