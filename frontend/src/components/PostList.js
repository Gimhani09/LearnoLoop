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
    ListItemIcon
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FlagIcon from '@mui/icons-material/Flag';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const PostList = ({ user }) => {
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [openReportDialog, setOpenReportDialog] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuPostId, setMenuPostId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reportError, setReportError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [debugInfo, setDebugInfo] = useState('');
    const [loading, setLoading] = useState(true);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

    const reportReasons = [
        "Inappropriate Content",
        "Harassment or Bullying",
        "Misinformation",
        "Spam",
        "Violence",
        "Hate Speech",
        "Other"
    ];
    
    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await api.getPosts();
            console.log('Posts fetched:', response.data);
            const processedPosts = response.data.map(post => {
                if (!post._id && post.id) {
                    post._id = post.id;
                }
                if (!post.photoUrl) {
                    post.photoUrl = `https://source.unsplash.com/random/300x200?sig=${post._id || post.id}`;
                }
                return post;
            });
            setPosts(processedPosts);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMenuOpen = (event, post) => {
        setAnchorEl(event.currentTarget);
        const postId = post._id || post.id;
        console.log('Selected post with ID:', postId, 'Full post:', post);
        setMenuPostId(postId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuPostId(null);
    };

    const handleReportClick = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        
        const post = posts.find(p => (p._id === menuPostId || p.id === menuPostId));
        if (!post) {
            console.error('No post found with ID:', menuPostId);
            setDebugInfo(`No post found with ID: ${menuPostId}. Available posts: ${posts.map(p => p._id || p.id).join(', ')}`);
            return;
        }
        console.log('Found post to report:', post);
        setSelectedPost(post);
        setOpenReportDialog(true);
        setReportReason('');
        setReportDescription('');
        handleMenuClose();
    };

    const validateInputs = () => {
        const errors = {};
        if (!selectedPost) {
            errors.postId = "Post ID is missing. Please try selecting another post.";
            console.error('validateInputs: selectedPost is null');
        } else if (!selectedPost._id && !selectedPost.id) {
            errors.postId = "Post ID is missing. Please try selecting another post.";
            console.error('validateInputs: selectedPost has no ID property', selectedPost);
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
            alert('Please log in to report posts');
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
            console.log('Selected Post:', selectedPost);
            console.log('Current User:', user);
            const postId = selectedPost._id || selectedPost.id;
            if (!postId) {
                throw new Error('Post ID is missing, cannot submit report');
            }
            const reportData = {
                postId: postId,
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
            alert('Report submitted successfully!');
        } catch (error) {
            console.error('Error submitting report:', error);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
                if (error.response.data && typeof error.response.data === 'string' && error.response.data.includes('Validation failed')) {
                    if (error.response.data.includes('postId')) {
                        setValidationErrors(prev => ({...prev, postId: "Post ID is required"}));
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

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>
                    Loading posts...
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4, mt: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Community Posts
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Browse through posts shared by our community. If you see content that violates our guidelines, please report it.
                </Typography>
            </Box>
            
            {posts.length === 0 ? (
                <Paper elevation={2} sx={{ p: 4, textAlign: 'center', my: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        No posts available at the moment.
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        Check back later for new content, or sign in to create your own posts.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Button variant="contained" component={Link} href="/login">
                            Sign in to contribute
                        </Button>
                    </Box>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {posts.map((post) => (
                        <Grid item xs={12} sm={6} md={4} key={post._id || post.id}>
                            <Card elevation={2} sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: 6
                                }
                            }}>
                                {post.photoUrl && (
                                    <CardMedia
                                        component="img"
                                        height="140"
                                        image={post.photoUrl}
                                        alt={post.title}
                                    />
                                )}
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <Typography variant="h6" component="div" gutterBottom>
                                            {post.title}
                                        </Typography>
                                        <IconButton 
                                            onClick={(e) => handleMenuOpen(e, post)}
                                            size="small"
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </Box>
                                    
                                    <Typography variant="body2" color="text.secondary" paragraph sx={{ 
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        minHeight: '60px'
                                    }}>
                                        {post.description || "No description available."}
                                    </Typography>
                                    
                                    {post.status !== 'ACTIVE' && (
                                        <Chip 
                                            label={post.status} 
                                            size="small" 
                                            color={post.status === 'REMOVED' ? 'error' : 'default'}
                                            sx={{ mt: 1 }}
                                        />
                                    )}
                                </CardContent>
                                
                                <Divider />
                                
                                <CardActions>
                                    <Tooltip title="Like">
                                        <IconButton size="small">
                                            <ThumbUpAltIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    
                                    <Tooltip title="Comment">
                                        <IconButton size="small">
                                            <ChatBubbleOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    
                                    <Tooltip title="Share">
                                        <IconButton size="small">
                                            <ShareIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    
                                    <Box sx={{ flexGrow: 1 }} />
                                    
                                    <Tooltip title={user ? "Report Post" : "Login to Report"}>
                                        <IconButton 
                                            size="small" 
                                            color="warning"
                                            onClick={() => {
                                                setMenuPostId(post._id || post.id);
                                                handleReportClick();
                                            }}
                                        >
                                            <FlagIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                {user ? (
                    <MenuItem onClick={handleReportClick}>
                        <ListItemIcon>
                            <FlagIcon fontSize="small" />
                        </ListItemIcon>
                        Report Post
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

            <Dialog 
                open={openReportDialog} 
                onClose={handleDialogClose} 
                maxWidth="sm" 
                fullWidth
                fullScreen={isMobile}
            >
                <DialogTitle>
                    Report Post
                    <Typography variant="subtitle2" color="text.secondary">
                        Help us maintain community guidelines
                    </Typography>
                </DialogTitle>
                
                <DialogContent dividers>
                    {reportError && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {reportError}
                        </Alert>
                    )}
                    
                    {validationErrors.postId && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {validationErrors.postId}
                        </Alert>
                    )}
                    
                    {debugInfo && (
                        <Alert severity="warning" sx={{ mb: 3 }}>
                            {debugInfo}
                        </Alert>
                    )}
                    
                    {selectedPost && (
                        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                {selectedPost.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {selectedPost.description && selectedPost.description.length > 100
                                    ? `${selectedPost.description.substring(0, 100)}...`
                                    : selectedPost.description || "No description"}
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
                        helperText={validationErrors.description || "Provide at least 10 characters explaining why you're reporting this post"}
                        variant="outlined"
                    />
                    
                    <FormHelperText sx={{ mt: 2 }}>
                        Our moderation team will review this report. Thank you for helping keep our community safe.
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
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Report'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default PostList;
