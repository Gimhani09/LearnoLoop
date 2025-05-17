import React, { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Container,
    Paper,
    Divider,
    Button,
    CircularProgress,
    Alert,
    IconButton,
    Card,
    CardMedia,
    CardContent,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Stack,
    Grid,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FlagIcon from '@mui/icons-material/Flag';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import { api } from '../services/api';
import CommentSection from './CommentSection';
import CreatePost from './CreatePost';

const PostDetail = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [likes, setLikes] = useState([]);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [shareUrl, setShareUrl] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openReportDialog, setOpenReportDialog] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [sharing, setSharing] = useState(false);

    useEffect(() => {
        fetchPost();
        setShareUrl(window.location.href);
    }, [id]);

    useEffect(() => {
        if (post && user) {
            const postOwnerId = post.userId || post.user_id;
            const userId = user.id || user._id;
            console.log('Checking ownership - userId:', userId, 'postOwnerId:', postOwnerId, 'post username:', post.username, 'user username:', user.username);
            
            setIsOwner(postOwnerId === userId || post.username === user.username);
            fetchLikes();
            checkIfSaved();
        }
    }, [post?.id, user?.id]);

    const fetchPost = async () => {
        try {
            setLoading(true);
            const response = await api.getContentById(id);
            setPost(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching educational content:', error);
            setError('Failed to load educational content. It may have been deleted or is not available.');
        } finally {
            setLoading(false);
        }
    };

    const fetchLikes = async () => {
        try {
            const response = await api.getEndorsements(id);
            setLikes(response.data);
            setLikeCount(response.data.length);
            const userId = user.id || user._id;
            const userHasLiked = response.data.some(like => like.userId === userId);
            setIsLiked(userHasLiked);
        } catch (error) {
            console.error('Error fetching endorsements:', error);
        }
    };
    
    const checkIfSaved = async () => {
        try {
            setIsSaved(Math.random() > 0.5);
        } catch (error) {
            console.error('Error checking if post is saved:', error);
            setIsSaved(false);
        }
    };

    const handleLikeToggle = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            const userId = user.id || user._id;
            if (isLiked) {
                await api.removeEndorsement(id, userId);
                setIsLiked(false);
                setLikeCount(prev => Math.max(0, prev - 1));
            } else {
                await api.endorseContent(id, userId);
                setIsLiked(true);
                setLikeCount(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error toggling endorsement:', error);
        }
    };
    
    const handleSaveToggle = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            setIsSaved(prev => !prev);
        } catch (error) {
            console.error('Error toggling save:', error);
        }
    };

    const handleShare = () => {
        setSharing(true);
        try {
            navigator.clipboard.writeText(shareUrl);
            setTimeout(() => setSharing(false), 2000);
        } catch (error) {
            console.error('Could not copy to clipboard:', error);
            setSharing(false);
        }
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEditClick = () => {
        setOpenEditDialog(true);
        handleMenuClose();
    };

    const handleDeleteClick = () => {
        setOpenDeleteDialog(true);
        handleMenuClose();
    };
    
    const handleReportClick = () => {
        setOpenReportDialog(true);
        handleMenuClose();
    };

    const handleDeleteConfirm = async () => {
        try {
            setLoading(true);
            await api.deleteContent(id);
            setOpenDeleteDialog(false);
            navigate('/');
        } catch (error) {
            console.error('Error deleting educational content:', error);
            setError('Failed to delete educational content. Please try again.');
            setLoading(false);
        }
    };

    const handlePostUpdated = (updatedPost) => {
        setPost(updatedPost);
        setOpenEditDialog(false);
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
        
        return date.toLocaleDateString();
    };
    
    const navigateToUserProfile = (username) => {
        navigate(`/profile/${username}`);
    };

    if (loading && !post) {
        return (
            <Container maxWidth="md" sx={{ py: 5, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>
                    Loading post...
                </Typography>
            </Container>
        );
    }

    if (error && !post) {
        return (
            <Container maxWidth="md" sx={{ py: 5 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
                <Button 
                    startIcon={<ArrowBackIcon />} 
                    variant="outlined"
                    component={Link}
                    to="/"
                >
                    Back to Posts
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Button 
                startIcon={<ArrowBackIcon />} 
                sx={{ mb: 4 }}
                component={Link}
                to="/"
            >
                Back to Feed
            </Button>
            
            <Card 
                elevation={1} 
                sx={{ 
                    borderRadius: 2,
                    overflow: 'hidden',
                    mb: 4
                }}
            >
                <Grid container>
                    <Grid 
                        item 
                        xs={12} 
                        md={7} 
                        sx={{ 
                            display: 'flex',
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            bgcolor: post.videoUrl ? '#000' : '#f0f0f0',
                            maxHeight: { xs: '50vh', md: '70vh' },
                            position: 'relative'
                        }}
                    >
                        {post.videoUrl ? (
                            <>
                                <CardMedia
                                    component="video"
                                    src={post.videoUrl}
                                    controls
                                    autoPlay={false}
                                    preload="metadata"
                                    poster={post.photoUrl}
                                    sx={{ 
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        maxHeight: { xs: '50vh', md: '70vh' }
                                    }}
                                />
                                <Chip
                                    icon={<VideoLibraryIcon fontSize="small" />}
                                    label="Video Content"
                                    size="small"
                                    color="primary"
                                    sx={{ 
                                        position: 'absolute',
                                        top: 8,
                                        left: 8,
                                        bgcolor: 'rgba(25, 118, 210, 0.8)',
                                    }}
                                />
                            </>
                        ) : post.photoUrl && (
                            <CardMedia
                                component="img"
                                image={post.photoUrl}
                                alt={post.title || 'Post image'}
                                sx={{ 
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    maxHeight: { xs: '50vh', md: '70vh' }
                                }}
                            />
                        )}
                    </Grid>
                    
                    <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar 
                                    src={post.userProfilePicture || `https://ui-avatars.com/api/?name=${post.username}&background=random`} 
                                    alt={post.username || 'User'}
                                    sx={{ width: 40, height: 40, mr: 1.5, cursor: 'pointer' }}
                                    onClick={() => post.username && navigateToUserProfile(post.username)}
                                />
                                <Box>
                                    <Typography 
                                        variant="subtitle2" 
                                        fontWeight="bold"
                                        sx={{ 
                                            cursor: post.username ? 'pointer' : 'default',
                                            '&:hover': post.username ? { textDecoration: 'underline' } : {}
                                        }}
                                        onClick={() => post.username && navigateToUserProfile(post.username)}
                                    >
                                        {post.username || 'Anonymous'}
                                    </Typography>
                                    {post.location && (
                                        <Typography variant="caption" color="text.secondary">
                                            {post.location}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                            
                            <IconButton onClick={handleMenuOpen} size="small">
                                <MoreVertIcon />
                            </IconButton>
                        </Box>
                        
                        <Box 
                            sx={{ 
                                p: 2, 
                                flexGrow: 1, 
                                overflowY: 'auto', 
                                maxHeight: { xs: '30vh', md: '40vh' },
                                borderBottom: 1, 
                                borderColor: 'divider'
                            }}
                        >
                            <Box sx={{ display: 'flex', mb: 2 }}>
                                <Avatar 
                                    src={post.userProfilePicture || `https://ui-avatars.com/api/?name=${post.username}&background=random`} 
                                    alt={post.username || 'User'}
                                    sx={{ width: 32, height: 32, mr: 1.5 }}
                                />
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <Typography 
                                            variant="body2" 
                                            component="span" 
                                            fontWeight="bold" 
                                            sx={{ mr: 1 }}
                                        >
                                            {post.username || 'Anonymous'}
                                        </Typography>
                                        <Typography variant="body2" component="span">
                                            {post.title && <strong>{post.title}</strong>}
                                            {post.title && post.description && ' - '}
                                            {post.description}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        {formatRelativeTime(post.createdAt)}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <CommentSection postId={id} user={user} />
                        </Box>
                        
                        <Box sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                <Box>
                                    <IconButton 
                                        onClick={handleLikeToggle}
                                        color={isLiked ? "error" : "default"}
                                    >
                                        {isLiked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                                    </IconButton>
                                    
                                    <IconButton>
                                        <ChatBubbleOutlineIcon />
                                    </IconButton>
                                    
                                    <IconButton onClick={handleShare}>
                                        <ShareIcon />
                                    </IconButton>
                                </Box>
                                
                                <IconButton 
                                    onClick={handleSaveToggle}
                                    color={isSaved ? "primary" : "default"}
                                >
                                    {isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                                </IconButton>
                            </Box>
                            
                            {likeCount > 0 && (
                                <Typography variant="body2" fontWeight="bold" gutterBottom>
                                    {likeCount} {likeCount === 1 ? 'endorsement' : 'endorsements'}
                                </Typography>
                            )}
                            
                            <Typography variant="caption" color="text.secondary">
                                {formatRelativeTime(post.createdAt)}
                            </Typography>
                            
                            {post.status !== 'ACTIVE' && (
                                <Chip 
                                    label={post.status} 
                                    size="small"
                                    color={post.status === 'REMOVED' ? 'error' : 'default'}
                                    sx={{ mt: 1, ml: 1 }}
                                />
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Card>
            
            {isMobile && (
                <Paper elevation={1} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Comments
                    </Typography>
                    <CommentSection postId={id} user={user} />
                </Paper>
            )}
            
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                {isOwner && (
                    <>
                        <MenuItem onClick={handleEditClick}>
                            <ListItemIcon>
                                <EditIcon fontSize="small" />
                            </ListItemIcon>
                            Edit Post
                        </MenuItem>
                        <MenuItem onClick={handleDeleteClick}>
                            <ListItemIcon>
                                <DeleteIcon fontSize="small" />
                            </ListItemIcon>
                            Delete Post
                        </MenuItem>
                        <Divider />
                    </>
                )}
                
                <MenuItem onClick={handleReportClick}>
                    <ListItemIcon>
                        <FlagIcon fontSize="small" />
                    </ListItemIcon>
                    Report Post
                </MenuItem>
            </Menu>
            
            {post && (
                <CreatePost
                    user={user}
                    postToEdit={post}
                    open={openEditDialog}
                    onClose={() => setOpenEditDialog(false)}
                    onPostCreated={handlePostUpdated}
                />
            )}
            
            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
            >
                <DialogTitle>Delete Post</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this post? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                    <Button 
                        onClick={handleDeleteConfirm} 
                        color="error"
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
            
            <Dialog
                open={openReportDialog}
                onClose={() => setOpenReportDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Report this post</DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>
                        Please select a reason for reporting this post:
                    </Typography>
                    <Stack spacing={1} sx={{ mt: 2 }}>
                        {[
                            "It's spam",
                            "Nudity or sexual activity",
                            "Hate speech or symbols",
                            "Violence or dangerous organizations",
                            "Sale of illegal or regulated goods",
                            "Bullying or harassment",
                            "Intellectual property violation",
                            "False information",
                            "I just don't like it"
                        ].map(reason => (
                            <Button 
                                key={reason} 
                                variant="outlined" 
                                fullWidth 
                                sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                                onClick={() => {
                                    alert(`Thank you for reporting this post as "${reason}". Our team will review it shortly.`);
                                    setOpenReportDialog(false);
                                }}
                            >
                                {reason}
                            </Button>
                        ))}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenReportDialog(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default PostDetail;