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
    Divider
} from '@mui/material';
import { api } from '../services/api';

const AdminDashboard = ({ user }) => {
    const [reports, setReports] = useState([]);
    const [posts, setPosts] = useState({});
    const [selectedReport, setSelectedReport] = useState(null);
    const [openActionDialog, setOpenActionDialog] = useState(false);
    const [actionData, setActionData] = useState({
        action: '',
        adminComment: ''
    });
    const [tabValue, setTabValue] = useState(0);
    const [stats, setStats] = useState({
        totalReports: 0,
        pendingReports: 0,
        approvedReports: 0,
        rejectedReports: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user && user.role === 'ADMIN') {
            fetchReports();
            fetchPosts();
        }
    }, [tabValue, user]);

    const fetchPosts = async () => {
        try {
            const response = await api.getPosts();
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
            let response;
            if (tabValue === 1) {
                response = await api.getPendingReports();
            } else if (tabValue === 2) {
                response = await api.getAllReports();
                response.data = response.data.filter(report => report.status === 'APPROVE');
            } else if (tabValue === 3) {
                response = await api.getAllReports();
                response.data = response.data.filter(report => report.status === 'REJECT');
            } else {
                response = await api.getAllReports();
            }
            
            setReports(response.data);
            
            const allReports = await api.getAllReports();
            const pendingCount = allReports.data.filter(r => r.status === 'PENDING').length;
            const approvedCount = allReports.data.filter(r => r.status === 'APPROVE').length;
            const rejectedCount = allReports.data.filter(r => r.status === 'REJECT').length;
            
            setStats({
                totalReports: allReports.data.length,
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
                Welcome, {user.username}! Here you can manage reported posts and take actions.
            </Typography>
            
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

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
        </Container>
    );
};

export default AdminDashboard;
