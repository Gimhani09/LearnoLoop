import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Avatar,
    CircularProgress,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    Card,
    CardContent,
    Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

const CommentSection = ({ postId, user }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editCommentId, setEditCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedCommentId, setSelectedCommentId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (postId) {
            fetchComments();
        }
    }, [postId]); // Only depend on postId, not every render

    const fetchComments = async () => {
        try {
            setLoading(true);
            const response = await api.getCommentsByContentId(postId);
            setComments(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching comments:', error);
            setError('Failed to load comments. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleMenuOpen = (event, commentId) => {
        setAnchorEl(event.currentTarget);
        setSelectedCommentId(commentId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedCommentId(null);
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();

        if (!user) {
            navigate('/login');
            return;
        }

        if (!newComment.trim()) {
            return;
        }

        try {
            setLoading(true);
            await api.createComment({
                postId,
                userId: user.id || user._id,
                text: newComment.trim(),
                username: user.username
            });
            setNewComment('');
            fetchComments();
        } catch (error) {
            console.error('Error posting comment:', error);
            setError('Failed to post comment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (comment) => {
        setEditCommentId(comment.id || comment._id);
        setEditCommentText(comment.text);
        handleMenuClose();
    };

    const handleSaveEdit = async () => {
        if (!editCommentText.trim()) {
            return;
        }

        try {
            setLoading(true);
            await api.updateComment(editCommentId, { text: editCommentText.trim() });
            setEditCommentId(null);
            setEditCommentText('');
            fetchComments();
        } catch (error) {
            console.error('Error updating comment:', error);
            setError('Failed to update comment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setEditCommentId(null);
        setEditCommentText('');
    };

    const handleDeleteComment = async () => {
        try {
            setLoading(true);
            await api.deleteComment(selectedCommentId);
            fetchComments();
            handleMenuClose();
        } catch (error) {
            console.error('Error deleting comment:', error);
            setError('Failed to delete comment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
                Comments {comments.length > 0 && `(${comments.length})`}
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            
            {/* Add new comment */}
            <Box component="form" onSubmit={handleSubmitComment} sx={{ display: 'flex', mb: 3, alignItems: 'start', gap: 1 }}>
                <Avatar 
                    sx={{ width: 36, height: 36 }}
                    alt={user ? user.username : "Guest"}
                >
                    {user ? user.username[0].toUpperCase() : "G"}
                </Avatar>
                <TextField
                    fullWidth
                    placeholder={user ? "Add a comment..." : "Please login to comment"}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    multiline
                    maxRows={4}
                    disabled={!user}
                    size="small"
                    variant="outlined"
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={!user || !newComment.trim() || loading}
                    sx={{ minWidth: 'unset', px: 2 }}
                >
                    {loading ? <CircularProgress size={24} /> : <SendIcon />}
                </Button>
            </Box>

            {/* Comments list */}
            <Box sx={{ mt: 2 }}>
                {loading && comments.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : comments.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" align="center">
                        No comments yet. Be the first to comment!
                    </Typography>
                ) : (
                    <Box>
                        {comments.map((comment) => {
                            const commentId = comment.id || comment._id;
                            const isEditing = editCommentId === commentId;
                            const isOwner = user && (user.id === comment.userId || user._id === comment.userId);
                            
                            return (
                                <Card key={commentId} variant="outlined" sx={{ mb: 2 }}>
                                    <CardContent sx={{ pt: 2, pb: 2, "&:last-child": { pb: 2 } }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                                                    {comment.username ? comment.username[0].toUpperCase() : 'U'}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2">
                                                        {comment.username || 'Unknown User'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {comment.createdAt ? formatDate(comment.createdAt) : 'No date'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            
                                            {isOwner && (
                                                <IconButton 
                                                    size="small"
                                                    onClick={(e) => handleMenuOpen(e, commentId)}
                                                >
                                                    <MoreVertIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Box>
                                        
                                        <Box sx={{ mt: 1, ml: 5 }}>
                                            {isEditing ? (
                                                <Box sx={{ mt: 1 }}>
                                                    <TextField
                                                        fullWidth
                                                        value={editCommentText}
                                                        onChange={(e) => setEditCommentText(e.target.value)}
                                                        multiline
                                                        size="small"
                                                        variant="outlined"
                                                        autoFocus
                                                    />
                                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
                                                        <Button 
                                                            size="small" 
                                                            onClick={handleCancelEdit}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button 
                                                            size="small" 
                                                            variant="contained"
                                                            onClick={handleSaveEdit}
                                                            disabled={!editCommentText.trim() || loading}
                                                        >
                                                            Save
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            ) : (
                                                <Typography variant="body2">
                                                    {comment.text}
                                                </Typography>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Box>
                )}
            </Box>

            {/* Comment action menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => {
                    const comment = comments.find(c => (c.id === selectedCommentId || c._id === selectedCommentId));
                    if (comment) {
                        handleEditClick(comment);
                    }
                }}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    Edit
                </MenuItem>
                <MenuItem onClick={handleDeleteComment}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" />
                    </ListItemIcon>
                    Delete
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default CommentSection;