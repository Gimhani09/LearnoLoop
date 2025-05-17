import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    Box,
    Card,
    CardContent,
    Grid,
    Tabs,
    Tab,
    Alert,
    CircularProgress,
    Divider,
    IconButton,
    Tooltip
} from '@mui/material';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import QuizIcon from '@mui/icons-material/Quiz';
import AssessmentIcon from '@mui/icons-material/Assessment';

const AdminDashboard = ({ user }) => {
    const [reports, setReports] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [posts, setPosts] = useState({});
    const [selectedReport, setSelectedReport] = useState(null);
    const [openActionDialog, setOpenActionDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [actionData, setActionData] = useState({
        action: '',
        adminComment: ''
    });
    const [tabValue, setTabValue] = useState(0);
    const [mainTabValue, setMainTabValue] = useState(0); // 0 for Reports, 1 for Quizzes
    const [stats, setStats] = useState({
        totalReports: 0,
        pendingReports: 0,
        approvedReports: 0,
        rejectedReports: 0
    });
    const [quizStats, setQuizStats] = useState({
        totalQuizzes: 0,
        publishedQuizzes: 0,
        drafts: 0,
        totalAttempts: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.role === 'ADMIN') {
            if (mainTabValue === 0) {
                fetchReports();
                fetchPosts();
            } else if (mainTabValue === 1) {
                fetchQuizzes();
            }
        }
    }, [mainTabValue, tabValue]); // Remove user?.id from dependencies to prevent extra fetches

    const fetchPosts = async () => {
        try {
            const response = await api.getLearningContent();
            const postsMap = {};
            response.data.forEach(post => {
                const postId = post._id || post.id;
                if (postId) {
                    postsMap[postId] = post;
                }
            });
            setPosts(postsMap);
        } catch (error) {
            console.error('Error fetching posts:', error);
            setError('Failed to load posts data');
        }
    };

    const fetchReports = async () => {
        setLoading(true);
        try {
            // Get all reports only once and filter locally
            const allReportsResponse = await api.getAllReports();
            const allReports = allReportsResponse.data;
            
            // Set the reports based on the current tab filter
            let filteredReports;
            if (tabValue === 1) {
                filteredReports = allReports.filter(report => report.status === 'PENDING');
            } else if (tabValue === 2) {
                filteredReports = allReports.filter(report => report.status === 'APPROVE');
            } else if (tabValue === 3) {
                filteredReports = allReports.filter(report => report.status === 'REJECT');
            } else {
                filteredReports = allReports; // All reports for tab 0
            }
            
            setReports(filteredReports);
            
            // Calculate stats from the single report fetch
            const pendingCount = allReports.filter(r => r.status === 'PENDING').length;
            const approvedCount = allReports.filter(r => r.status === 'APPROVE').length;
            const rejectedCount = allReports.filter(r => r.status === 'REJECT').length;
            
            setStats({
                totalReports: allReports.length,
                pendingReports: pendingCount,
                approvedReports: approvedCount,
                rejectedReports: rejectedCount
            });
            setError(null);
        } catch (error) {
            console.error('Error fetching reports:', error);
            setError('Failed to load reports. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchQuizzes = async () => {
        setLoading(true);
        setError(null); // Reset error state at the start of fetching
        try {
            const response = await api.getQuizzes();
            if (response && response.data) {
                setQuizzes(response.data);
                
                // Calculate quiz stats
                const totalQuizzes = response.data.length;
                const publishedQuizzes = response.data.filter(q => q.isPublished).length;
                const drafts = totalQuizzes - publishedQuizzes;
                const totalAttempts = response.data.reduce((sum, quiz) => sum + (quiz.totalAttempts || 0), 0);
                
                setQuizStats({
                    totalQuizzes,
                    publishedQuizzes,
                    drafts,
                    totalAttempts
                });
                
                // Check if we're using mock data by examining the IDs
                const hasMockData = response.data.some(quiz => quiz.id.startsWith('mock'));
                if (hasMockData) {
                    // Show an info message instead of an error for mock data
                    setError(null);
                }
            }
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            setError('Failed to load quizzes. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Invalid date';
        }
    };

    const handleActionClick = (report) => {
        setSelectedReport(report);
        setOpenActionDialog(true);
        setActionData({
            action: '',
            adminComment: ''
        });
    };

    const handleActionSubmit = async () => {
        try {
            const reportId = selectedReport._id || selectedReport.id;
            if (!reportId) {
                alert('Invalid report ID');
                return;
            }
            
            await api.handleReportAction({
                reportId: reportId,
                action: actionData.action,
                adminComment: actionData.adminComment
            });
            
            setOpenActionDialog(false);
            setActionData({ action: '', adminComment: '' });
            fetchReports();
            alert('Action submitted successfully!');
        } catch (error) {
            console.error('Error submitting action:', error);
            alert(`Error: ${error.response?.data?.error || error.message || 'Failed to submit action'}`);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleMainTabChange = (event, newValue) => {
        setMainTabValue(newValue);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING':
                return 'warning';
            case 'APPROVE':
            case 'APPROVED':
                return 'success';
            case 'REJECT':
            case 'REJECTED':
                return 'error';
            default:
                return 'default';
        }
    };

    const handleCreateQuiz = () => {
        navigate('/admin/quizzes/create');
    };

    const handleEditQuiz = (quizId) => {
        navigate(`/admin/quizzes/edit/${quizId}`);
    };

    const handlePublishToggle = async (quiz) => {
        try {
            const quizId = quiz.id;
            if (quiz.isPublished) {
                await api.unpublishQuiz(quizId);
            } else {
                await api.publishQuiz(quizId);
            }
            fetchQuizzes();
        } catch (error) {
            console.error('Error toggling quiz publish status:', error);
            alert(`Error: ${error.response?.data?.error || error.message || 'Failed to update quiz'}`);
        }
    };

    const confirmDeleteQuiz = (quiz) => {
        setSelectedQuiz(quiz);
        setOpenDeleteDialog(true);
    };

    const handleDeleteQuiz = async () => {
        try {
            if (!selectedQuiz || !selectedQuiz.id) {
                alert('Invalid quiz selection');
                return;
            }
            
            await api.deleteQuiz(selectedQuiz.id);
            setOpenDeleteDialog(false);
            fetchQuizzes();
            alert('Quiz deleted successfully');
        } catch (error) {
            console.error('Error deleting quiz:', error);
            alert(`Error: ${error.response?.data?.error || error.message || 'Failed to delete quiz'}`);
        }
    };

    const handleViewQuizStats = (quizId) => {
        navigate(`/admin/quizzes/stats/${quizId}`);
    };

    if (!user) {
        return (
            <Container style={{ padding: '20px' }}>
                <Alert severity="error">
                    <Typography variant="h6">
                        Please login to access this page
                    </Typography>
                </Alert>
            </Container>
        );
    }
    
    if (user.role !== 'ADMIN') {
        return (
            <Container style={{ padding: '20px' }}>
                <Alert severity="error">
                    <Typography variant="h5">
                        Unauthorized: Admin access required
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                        You need admin privileges to access this dashboard. Please login with an admin account.
                    </Typography>
                </Alert>
            </Container>
        );
    }

    return (
        <Container style={{ padding: '20px' }}>
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Welcome, {user.username}! Manage your content and system settings here.
            </Typography>
            
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, mt: 2 }}>
                <Tabs value={mainTabValue} onChange={handleMainTabChange}>
                    <Tab icon={<AssessmentIcon />} iconPosition="start" label="Reports Management" />
                    <Tab icon={<QuizIcon />} iconPosition="start" label="Quiz Management" />
                </Tabs>
            </Box>

            {mainTabValue === 0 && (
                // Reports Management Tab
                <>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Total Reports
                                    </Typography>
                                    <Typography variant="h4">{stats.totalReports}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Pending
                                    </Typography>
                                    <Typography variant="h4" color="warning.main">
                                        {stats.pendingReports}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Approved
                                    </Typography>
                                    <Typography variant="h4" color="success.main">
                                        {stats.approvedReports}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Rejected
                                    </Typography>
                                    <Typography variant="h4" color="error.main">
                                        {stats.rejectedReports}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <Tabs value={tabValue} onChange={handleTabChange}>
                            <Tab label="All Reports" />
                            <Tab label="Pending Reports" />
                            <Tab label="Approved Reports" />
                            <Tab label="Rejected Reports" />
                        </Tabs>
                    </Box>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                            <CircularProgress />
                        </Box>
                    ) : reports.length === 0 ? (
                        <Alert severity="info" sx={{ mt: 3 }}>
                            <Typography variant="h6" align="center">
                                No reports available for this filter.
                            </Typography>
                        </Alert>
                    ) : (
                        <TableContainer component={Paper} elevation={3}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: 'primary.light' }}>
                                        <TableCell><Typography variant="subtitle2">Post Title</Typography></TableCell>
                                        <TableCell><Typography variant="subtitle2">Post Description</Typography></TableCell>
                                        <TableCell><Typography variant="subtitle2">Reported By</Typography></TableCell>
                                        <TableCell><Typography variant="subtitle2">Reason</Typography></TableCell>
                                        <TableCell><Typography variant="subtitle2">Status</Typography></TableCell>
                                        <TableCell><Typography variant="subtitle2">Date Reported</Typography></TableCell>
                                        <TableCell><Typography variant="subtitle2">Actions</Typography></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reports.map((report) => {
                                        const post = posts[report.postId] || {};
                                        const reportId = report._id || report.id;
                                        
                                        return (
                                            <TableRow key={reportId} hover>
                                                <TableCell>
                                                    {post.title || 'Unknown Post'}
                                                </TableCell>
                                                <TableCell>
                                                    {post.description ? 
                                                        (post.description.length > 50 ? 
                                                            `${post.description.substring(0, 50)}...` : 
                                                            post.description) : 
                                                        'No description'}
                                                </TableCell>
                                                <TableCell>{report.reportedByUserId}</TableCell>
                                                <TableCell>{report.reason}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={report.status}
                                                        color={getStatusColor(report.status)}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(report.reportedAt)}
                                                </TableCell>
                                                <TableCell>
                                                    {report.status === 'PENDING' && (
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            onClick={() => handleActionClick(report)}
                                                        >
                                                            Take Action
                                                        </Button>
                                                    )}
                                                    {report.status !== 'PENDING' && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {report.adminComment ? 'Reviewed' : 'No action needed'}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    <Dialog 
                        open={openActionDialog} 
                        onClose={() => setOpenActionDialog(false)}
                        maxWidth="sm"
                        fullWidth
                    >
                        <DialogTitle>Take Action on Report</DialogTitle>
                        <Divider />
                        <DialogContent>
                            {selectedReport && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Report Details:
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Post:</strong> {posts[selectedReport.postId]?.title || 'Unknown Post'}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Reason:</strong> {selectedReport.reason}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Description:</strong> {selectedReport.description}
                                    </Typography>
                                </Box>
                            )}
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" gutterBottom>
                                Select Action:
                            </Typography>
                            <Box sx={{ mb: 2, mt: 1, display: 'flex', gap: 2 }}>
                                <Button
                                    variant={actionData.action === 'APPROVE' ? 'contained' : 'outlined'}
                                    color="success"
                                    onClick={() => setActionData({ ...actionData, action: 'APPROVE' })}
                                    fullWidth
                                >
                                    Approve Report
                                </Button>
                                <Button
                                    variant={actionData.action === 'REJECT' ? 'contained' : 'outlined'}
                                    color="error"
                                    onClick={() => setActionData({ ...actionData, action: 'REJECT' })}
                                    fullWidth
                                >
                                    Reject Report
                                </Button>
                            </Box>
                            <TextField
                                margin="dense"
                                label="Admin Comment"
                                fullWidth
                                multiline
                                rows={4}
                                value={actionData.adminComment}
                                onChange={(e) =>
                                    setActionData({ ...actionData, adminComment: e.target.value })
                                }
                                placeholder="Provide a reason for your decision"
                                required
                                error={actionData.action && !actionData.adminComment.trim()}
                                helperText={actionData.action && !actionData.adminComment.trim() ? "Comment is required" : ""}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenActionDialog(false)}>Cancel</Button>
                            <Button 
                                onClick={handleActionSubmit} 
                                color="primary"
                                variant="contained"
                                disabled={!actionData.action || !actionData.adminComment.trim()}
                            >
                                Submit Decision
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}

            {mainTabValue === 1 && (
                // Quiz Management Tab
                <>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Total Quizzes
                                    </Typography>
                                    <Typography variant="h4">{quizStats.totalQuizzes}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Published
                                    </Typography>
                                    <Typography variant="h4" color="success.main">
                                        {quizStats.publishedQuizzes}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Drafts
                                    </Typography>
                                    <Typography variant="h4" color="warning.main">
                                        {quizStats.drafts}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Total Attempts
                                    </Typography>
                                    <Typography variant="h4" color="info.main">
                                        {quizStats.totalAttempts}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h5">Quizzes</Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleCreateQuiz}
                        >
                            Create New Quiz
                        </Button>
                    </Box>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                            <CircularProgress />
                        </Box>
                    ) : quizzes.length === 0 ? (
                        <Alert severity="info" sx={{ mt: 3, p: 4, textAlign: 'center' }}>
                            <Typography variant="h6" align="center" gutterBottom>
                                No quizzes available
                            </Typography>
                            <Typography variant="body1" align="center" gutterBottom>
                                Create your first quiz to get started!
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleCreateQuiz}
                                sx={{ mt: 2 }}
                            >
                                Create Quiz
                            </Button>
                        </Alert>
                    ) : (
                        <TableContainer component={Paper} elevation={3}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: 'primary.light' }}>
                                        <TableCell><Typography variant="subtitle2">Title</Typography></TableCell>
                                        <TableCell><Typography variant="subtitle2">Category</Typography></TableCell>
                                        <TableCell><Typography variant="subtitle2">Questions</Typography></TableCell>
                                        <TableCell><Typography variant="subtitle2">Status</Typography></TableCell>
                                        <TableCell><Typography variant="subtitle2">Created</Typography></TableCell>
                                        <TableCell><Typography variant="subtitle2">Attempts</Typography></TableCell>
                                        <TableCell><Typography variant="subtitle2">Avg. Score</Typography></TableCell>
                                        <TableCell><Typography variant="subtitle2">Actions</Typography></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {quizzes.map((quiz) => (
                                        <TableRow key={quiz.id} hover>
                                            <TableCell>{quiz.title}</TableCell>
                                            <TableCell>{quiz.category}</TableCell>
                                            <TableCell>{quiz.questions?.length || 0}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={quiz.isPublished ? 'Published' : 'Draft'}
                                                    color={quiz.isPublished ? 'success' : 'warning'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{formatDate(quiz.createdAt)}</TableCell>
                                            <TableCell>{quiz.totalAttempts || 0}</TableCell>
                                            <TableCell>
                                                {quiz.averageScore ? `${Math.round(quiz.averageScore)}%` : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex' }}>
                                                    <Tooltip title="Edit Quiz">
                                                        <IconButton 
                                                            color="primary" 
                                                            size="small"
                                                            onClick={() => handleEditQuiz(quiz.id)}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title={quiz.isPublished ? "Unpublish" : "Publish"}>
                                                        {quiz.questions?.length === 0 ? (
                                                            <span>
                                                                <IconButton 
                                                                    color={quiz.isPublished ? "warning" : "success"}
                                                                    size="small"
                                                                    disabled={true}
                                                                >
                                                                    {quiz.isPublished ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                                </IconButton>
                                                            </span>
                                                        ) : (
                                                            <IconButton 
                                                                color={quiz.isPublished ? "warning" : "success"}
                                                                size="small"
                                                                onClick={() => handlePublishToggle(quiz)}
                                                            >
                                                                {quiz.isPublished ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                            </IconButton>
                                                        )}
                                                    </Tooltip>
                                                    <Tooltip title="View Statistics">
                                                        {quiz.totalAttempts === 0 ? (
                                                            <span>
                                                                <IconButton 
                                                                    color="info" 
                                                                    size="small"
                                                                    disabled={true}
                                                                >
                                                                    <AssessmentIcon />
                                                                </IconButton>
                                                            </span>
                                                        ) : (
                                                            <IconButton 
                                                                color="info" 
                                                                size="small"
                                                                onClick={() => handleViewQuizStats(quiz.id)}
                                                            >
                                                                <AssessmentIcon />
                                                            </IconButton>
                                                        )}
                                                    </Tooltip>
                                                    <Tooltip title="Delete Quiz">
                                                        <IconButton 
                                                            color="error" 
                                                            size="small"
                                                            onClick={() => confirmDeleteQuiz(quiz)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Delete Quiz Confirmation Dialog */}
                    <Dialog 
                        open={openDeleteDialog} 
                        onClose={() => setOpenDeleteDialog(false)}
                    >
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogContent>
                            <Typography>
                                Are you sure you want to delete quiz "{selectedQuiz?.title}"? 
                                This action cannot be undone.
                            </Typography>
                            {(selectedQuiz?.totalAttempts > 0) && (
                                <Alert severity="warning" sx={{ mt: 2 }}>
                                    Warning: This quiz has {selectedQuiz?.totalAttempts} attempts. 
                                    Deleting it will remove all attempt data.
                                </Alert>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                            <Button 
                                onClick={handleDeleteQuiz} 
                                color="error"
                                variant="contained"
                            >
                                Delete Quiz
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </Container>
    );
};

export default AdminDashboard;
