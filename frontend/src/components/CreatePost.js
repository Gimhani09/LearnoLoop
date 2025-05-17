import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Container,
    Alert,
    CircularProgress,
    Stack,
    IconButton,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    LinearProgress,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    FormHelperText,
    Chip,
    Grid
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import SchoolIcon from '@mui/icons-material/School';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

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

const CreateLearningContent = ({ user, postToEdit, onPostCreated, onClose, open }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [photoPublicId, setPhotoPublicId] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [videoPublicId, setVideoPublicId] = useState('');
    const [category, setCategory] = useState('');
    const [level, setLevel] = useState('');
    const [estimatedTime, setEstimatedTime] = useState('');
    const [learningGoals, setLearningGoals] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [error, setError] = useState('');
    const [previewImage, setPreviewImage] = useState(null);
    const [previewVideo, setPreviewVideo] = useState(null);
    const fileInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const navigate = useNavigate();
    
    const isEditing = !!postToEdit;

    useEffect(() => {
        if (postToEdit) {
            setTitle(postToEdit.title || '');
            setDescription(postToEdit.description || '');
            setPhotoUrl(postToEdit.photoUrl || '');
            setPhotoPublicId(postToEdit.photoPublicId || '');
            setVideoUrl(postToEdit.videoUrl || '');
            setVideoPublicId(postToEdit.videoPublicId || '');
            setPreviewImage(postToEdit.photoUrl || null);
            setPreviewVideo(postToEdit.videoUrl || null);
            setCategory(postToEdit.category || '');
            setLevel(postToEdit.level || '');
            setEstimatedTime(postToEdit.estimatedTime || '');
            setLearningGoals(postToEdit.learningGoals || '');
        } else {
            resetForm();
        }
    }, [postToEdit]);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setPhotoUrl('');
        setPhotoPublicId('');
        setVideoUrl('');
        setVideoPublicId('');
        setPreviewImage(null);
        setPreviewVideo(null);
        setCategory('');
        setLevel('');
        setEstimatedTime('');
        setLearningGoals('');
        setError('');
    };

    const validateInputs = () => {
        if (!title.trim()) {
            setError('Title is required for your learning content');
            return false;
        }
        
        if (description.trim().length < 10) {
            setError('Description should be at least 10 characters to provide educational value');
            return false;
        }

        if (!category) {
            setError('Please select a subject category for better content organization');
            return false;
        }
        
        setError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user) {
            setError('You must be logged in to create educational content');
            return;
        }
        
        if (!validateInputs()) {
            return;
        }
        
        try {
            setLoading(true);
            
            const contentData = {
                title,
                description,
                photoUrl,
                photoPublicId,
                videoUrl,
                videoPublicId,
                userId: user._id || user.id,
                username: user.username,
                category,
                level: level || 'All Levels',
                estimatedTime: estimatedTime || Math.floor(Math.random() * 30) + 5, // Default 5-35 minutes if not specified
                learningGoals
            };
            
            console.log("Submitting content data:", contentData);
            
            let response;
            
            if (isEditing && postToEdit) {
                const postId = postToEdit._id || postToEdit.id;
                console.log(`Updating content with ID: ${postId}`);
                
                // Include the original ID in the update data to ensure consistency
                const updateData = {
                    ...contentData,
                    id: postId,
                    _id: postId
                };
                
                response = await api.updateContent(postId, updateData);
                console.log('Learning content updated successfully:', response.data);
            } else {
                response = await api.createContent(contentData);
                console.log('Learning content created successfully:', response.data);
            }
            
            if (onPostCreated) {
                onPostCreated(response.data);
            }
            
            resetForm();
            
            if (onClose) {
                onClose();
            }
            
        } catch (error) {
            console.error('Error creating/updating learning content:', error);
            setError('Failed to save learning content. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleImagePreview = (e) => {
        const url = e.target.value;
        setPhotoUrl(url);
        setPreviewImage(url);
    };

    const handleVideoPreview = (e) => {
        const url = e.target.value;
        setVideoUrl(url);
        setPreviewVideo(url);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleClose = () => {
        resetForm();
        if (onClose) {
            onClose();
        }
    };

    const handleFileInputChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file (JPEG, PNG, etc.)');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB');
            return;
        }

        try {
            setUploadLoading(true);
            setError('');

            // Create a local preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target.result);
            };
            reader.readAsDataURL(file);

            // Upload to Cloudinary
            console.log("Starting Cloudinary upload...");
            const response = await api.uploadImage(file);
            console.log('Cloudinary response:', response);
            
            if (!response.data) {
                console.error('Invalid response format:', response);
                throw new Error('Invalid response from the server');
            }
            
            // Set photo URL and public ID from the response
            // Make sure we're extracting the right properties based on the backend response
            const url = response.data.url || response.data.secure_url;
            const publicId = response.data.publicId || response.data.public_id;
            
            if (!url) {
                throw new Error('No URL returned from image upload');
            }
            
            setPhotoUrl(url);
            setPhotoPublicId(publicId || '');
            
            // Update preview with the actual Cloudinary URL
            setPreviewImage(url);
            
            console.log('Image uploaded successfully to Cloudinary:', {
                url,
                publicId
            });
            
        } catch (err) {
            console.error('Upload error:', err);
            setError(`Failed to upload image: ${err.message || 'Unknown error'}`);
            // Keep the local preview if it exists
        } finally {
            setUploadLoading(false);
        }
    };

    const handleVideoInputChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('video/')) {
            setError('Please select a video file (MP4, WEBM, etc.)');
            return;
        }

        // Validate file size (max 45MB - slightly below server's 50MB limit)
        const maxSizeMB = 45;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            setError(`Video size should be less than ${maxSizeMB}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`);
            return;
        }

        try {
            setUploadLoading(true);
            setError('');

            // Show informative message for large files
            if (file.size > 15 * 1024 * 1024) {
                // For files larger than 15MB
                setError(`Uploading a ${(file.size / (1024 * 1024)).toFixed(2)}MB video. This may take a few moments...`);
            }

            // Upload to Cloudinary
            console.log("Starting Cloudinary video upload...");
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'learnoloop_videos'); // Optional: use a specific upload preset if configured
            
            const response = await api.uploadImage(file);
            console.log('Cloudinary video response:', response);
            
            if (!response.data) {
                console.error('Invalid response format:', response);
                throw new Error('Invalid response from the server');
            }
            
            // Set video URL and public ID from the response
            const url = response.data.url || response.data.secure_url;
            const publicId = response.data.publicId || response.data.public_id;
            
            if (!url) {
                throw new Error('No URL returned from video upload');
            }
            
            setVideoUrl(url);
            setVideoPublicId(publicId || '');
            setError(''); // Clear any informational messages
            
            // Update preview with the actual Cloudinary URL
            setPreviewVideo(url);
            
            console.log('Video uploaded successfully to Cloudinary:', {
                url,
                publicId
            });
            
        } catch (err) {
            console.error('Video upload error:', err);
            
            // Provide more specific error messages
            if (err.message && err.message.includes('413')) {
                setError(`Video file is too large. Please select a smaller file (max ${maxSizeMB}MB).`);
            } else if (err.message && err.message.includes('timeout')) {
                setError('Upload timed out. Please try with a smaller video file or check your connection.');
            } else {
                setError(`Failed to upload video: ${err.message || 'Unknown error'}. Try a smaller file or different format.`);
            }
        } finally {
            setUploadLoading(false);
        }
    };

    const handleFileButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleVideoButtonClick = () => {
        videoInputRef.current.click();
    };

    const handleRemoveImage = async () => {
        // If we have a publicId and the image was uploaded to Cloudinary, try to delete it
        if (photoPublicId) {
            try {
                await api.deleteImage(photoPublicId);
                console.log('Image deleted from Cloudinary');
            } catch (err) {
                console.error('Failed to delete image from Cloudinary:', err);
                // Continue even if delete fails
            }
        }
        
        setPhotoUrl('');
        setPhotoPublicId('');
        setPreviewImage(null);
    };

    const handleRemoveVideo = async () => {
        // If we have a publicId and the video was uploaded to Cloudinary, try to delete it
        if (videoPublicId) {
            try {
                await api.deleteImage(videoPublicId);
                console.log('Video deleted from Cloudinary');
            } catch (err) {
                console.error('Failed to delete video from Cloudinary:', err);
                // Continue even if delete fails
            }
        }
        
        setVideoUrl('');
        setVideoPublicId('');
        setPreviewVideo(null);
    };

    const handleGenerateImage = async () => {
        if (!title && !description) {
            setError('Please provide a title or description to generate a relevant image');
            return;
        }

        try {
            setUploadLoading(true);
            setError('');

            // Generate a search term based on the content
            const searchTerm = category || title || description.substring(0, 50);
            
            // Use Unsplash or similar service for random related images
            const imageUrl = `https://source.unsplash.com/random/800x600/?${encodeURIComponent(searchTerm + ' education')}`;
            
            // Set a small timeout to ensure Unsplash generates a new image
            setTimeout(() => {
                setPhotoUrl(imageUrl);
                setPreviewImage(imageUrl);
                setUploadLoading(false);
            }, 1000);
            
            console.log('Generated image based on:', searchTerm);
            
        } catch (err) {
            console.error('Generate image error:', err);
            setError(`Failed to generate image: ${err.message || 'Unknown error'}`);
            setUploadLoading(false);
        }
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

    const content = (
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}
            
            <TextField
                label="Learning Content Title"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your learning content a descriptive title"
                required
                margin="normal"
                variant="outlined"
                autoFocus
            />
            
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="category-label">Subject Category</InputLabel>
                        <Select
                            labelId="category-label"
                            id="category-select"
                            name="category"
                            value={category}
                            label="Subject Category"
                            onChange={(e) => {
                                console.log("Category selected:", e.target.value);
                                setCategory(e.target.value);
                            }}
                            required
                        >
                            {LEARNING_CATEGORIES.map((cat) => (
                                <MenuItem key={cat} value={cat}>
                                    {cat}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>Select the most relevant subject category</FormHelperText>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="level-label">Difficulty Level</InputLabel>
                        <Select
                            labelId="level-label"
                            id="level-select"
                            value={level}
                            label="Difficulty Level"
                            onChange={(e) => {
                                console.log("Level selected:", e.target.value);
                                setLevel(e.target.value);
                            }}
                        >
                            {LEARNING_LEVELS.map((lvl) => (
                                <MenuItem key={lvl} value={lvl}>
                                    {lvl}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>What knowledge level is this content suitable for?</FormHelperText>
                    </FormControl>
                </Grid>
            </Grid>

            <TextField
                label="Estimated Reading Time (minutes)"
                fullWidth
                type="number"
                value={estimatedTime}
                onChange={(e) => {
                    const value = e.target.value;
                    // Handle empty string or parse as integer
                    const numValue = value === '' ? '' : Math.max(1, parseInt(value) || 1);
                    setEstimatedTime(numValue);
                }}
                placeholder="How long does it take to consume this content?"
                margin="normal"
                variant="outlined"
                InputProps={{ inputProps: { min: 1, max: 120 } }}
            />
            
            <TextField
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a detailed description of what learners will gain from this content"
                margin="normal"
                variant="outlined"
                required
                onKeyDown={handleKeyDown}
                helperText={`${description.length}/1000 characters (min 10)`}
                error={description.length > 0 && description.length < 10}
            />

            <TextField
                label="Learning Goals"
                fullWidth
                multiline
                rows={2}
                value={learningGoals}
                onChange={(e) => setLearningGoals(e.target.value)}
                placeholder="What will learners achieve after engaging with this content? Separate goals with commas."
                margin="normal"
                variant="outlined"
            />

            {category && (
                <Box sx={{ mt: 2, mb: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Selected Category:
                    </Typography>
                    <Chip 
                        label={category} 
                        sx={{ 
                            bgcolor: getCategoryColor(category),
                            color: "white"
                        }}
                    />
                </Box>
            )}
            
            {/* File upload section */}
            <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Cover Image
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        (Adding a visual helps with learning retention)
                    </Typography>
                </Typography>
                
                <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                />
                
                {uploadLoading && (
                    <Box sx={{ width: '100%', mt: 2 }}>
                        <LinearProgress />
                        <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                            Uploading image...
                        </Typography>
                    </Box>
                )}
                
                {/* Image URL field (now hidden and optional) */}
                {!previewImage && (
                    <TextField
                        label="Image URL (optional)"
                        fullWidth
                        value={photoUrl}
                        onChange={handleImagePreview}
                        placeholder="Add an image URL related to your learning content"
                        margin="normal"
                        variant="outlined"
                        disabled={uploadLoading}
                    />
                )}
                
                {previewImage && (
                    <Box sx={{ mt: 2, position: 'relative', maxWidth: '100%', maxHeight: 300, overflow: 'hidden' }}>
                        <img 
                            src={previewImage} 
                            alt="Preview" 
                            className="learn-card"
                            style={{ 
                                width: '100%', 
                                objectFit: 'cover',
                                maxHeight: 300
                            }}
                            onError={(e) => {
                                console.log('Image failed to load');
                                setPreviewImage(null);
                            }}
                        />
                        <IconButton
                            size="small"
                            sx={{ 
                                position: 'absolute', 
                                top: 8, 
                                right: 8, 
                                bgcolor: 'rgba(0,0,0,0.5)',
                                '&:hover': {
                                    bgcolor: 'rgba(255,0,0,0.6)',
                                }
                            }}
                            onClick={handleRemoveImage}
                            disabled={uploadLoading}
                        >
                            <CloseIcon sx={{ color: 'white' }} />
                        </IconButton>
                    </Box>
                )}
                
                {!previewImage && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            className="btn-learn"
                            startIcon={<CloudUploadIcon />}
                            onClick={handleFileButtonClick}
                            disabled={uploadLoading}
                            sx={{ flex: 1 }}
                        >
                            Upload Image
                        </Button>
                        
                        <Button
                            variant="outlined"
                            className="btn-learn"
                            startIcon={<AddPhotoAlternateIcon />}
                            onClick={handleGenerateImage}
                            disabled={uploadLoading}
                            sx={{ flex: 1 }}
                        >
                            Generate Related Image
                        </Button>
                    </Box>
                )}
            </Box>
            
            {/* Video upload section */}
            <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Video Content
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        (Upload a short video, max 30 seconds/30MB)
                    </Typography>
                </Typography>
                
                <input
                    type="file"
                    accept="video/*"
                    style={{ display: 'none' }}
                    ref={videoInputRef}
                    onChange={handleVideoInputChange}
                />
                
                {/* Video URL field (optional) */}
                {!previewVideo && (
                    <TextField
                        label="Video URL (optional)"
                        fullWidth
                        value={videoUrl}
                        onChange={handleVideoPreview}
                        placeholder="Add a video URL related to your learning content"
                        margin="normal"
                        variant="outlined"
                        disabled={uploadLoading}
                    />
                )}
                
                {previewVideo && (
                    <Box sx={{ mt: 2, position: 'relative', maxWidth: '100%' }}>
                        <video 
                            src={previewVideo} 
                            controls
                            className="learn-video"
                            style={{ 
                                width: '100%', 
                                maxHeight: 300
                            }}
                            onError={(e) => {
                                console.log('Video failed to load');
                                setPreviewVideo(null);
                            }}
                        />
                        <IconButton
                            size="small"
                            sx={{ 
                                position: 'absolute', 
                                top: 8, 
                                right: 8, 
                                bgcolor: 'rgba(0,0,0,0.5)',
                                '&:hover': {
                                    bgcolor: 'rgba(255,0,0,0.6)',
                                }
                            }}
                            onClick={handleRemoveVideo}
                            disabled={uploadLoading}
                        >
                            <CloseIcon sx={{ color: 'white' }} />
                        </IconButton>
                    </Box>
                )}

                {!previewVideo && (
                    <Box sx={{ mt: 2 }}>
                        <Button
                            variant="outlined"
                            className="btn-learn"
                            startIcon={<VideoLibraryIcon />}
                            onClick={handleVideoButtonClick}
                            disabled={uploadLoading}
                            fullWidth
                        >
                            Upload Video
                        </Button>
                    </Box>
                )}
            </Box>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                    variant="outlined"
                    className="btn-learn"
                    onClick={handleClose}
                    disabled={loading || uploadLoading}
                >
                    Cancel
                </Button>
                <Button 
                    type="submit"
                    variant="contained"
                    className="btn-learn"
                    disabled={loading || uploadLoading || !title.trim() || description.trim().length < 10 || !category}
                    startIcon={loading ? <CircularProgress size={20} /> : <EmojiObjectsIcon />}
                >
                    {loading ? 'Saving...' : isEditing ? 'Update Content' : 'Share Knowledge'}
                </Button>
            </Box>
        </Box>
    );

    // If used as a dialog
    if (typeof open !== 'undefined') {
        return (
            <Dialog 
                open={open} 
                onClose={handleClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SchoolIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                        <Typography variant="h6">
                            {isEditing ? 'Edit Learning Content' : 'Create Learning Content'}
                        </Typography>
                    </Box>
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <Typography variant="body2" color="text.secondary" sx={{ px: 3, pb: 2 }}>
                    Share your knowledge and help others learn something valuable today
                </Typography>
                <Divider />
                <DialogContent sx={{ py: 3 }}>
                    {content}
                </DialogContent>
            </Dialog>
        );
    }

    // If used as a standalone component
    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 3, my: 4 }} className="learn-card">
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                    <Typography variant="h5">
                        {isEditing ? 'Edit Learning Content' : 'Create Learning Content'}
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Share your knowledge and help others learn something valuable today
                </Typography>
                <Divider sx={{ mb: 3 }} />
                {content}
            </Paper>
        </Container>
    );
};

export default CreateLearningContent;