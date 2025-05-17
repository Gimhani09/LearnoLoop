import React, { useState, useEffect } from 'react';
import {
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Container,
    Chip,
    Box,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    Grid,
    Divider
} from '@mui/material';
import { api } from '../services/api';

const UserReports = ({ user }) => {
    const [reports, setReports] = useState([]);
    const [posts, setPosts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });

    useEffect(() => {
        if (user) {
            fetchUserReports();
            fetchPosts();
        }
    }, [user && user.id]); // Only re-run when user ID changes

    const fetchUserReports = async () => {
        if (!user) return;
        
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching reports for user ID:', user._id || user.id);
            const response = await api.getUserReports(user._id || user.id);
            console.log('User reports response:', response.data);
            
            if (Array.isArray(response.data)) {
                setReports(response.data);
                calculateStats(response.data);
            } else {
                console.error('Unexpected response format:', response.data);
                setReports([]);
                setError('Received unexpected data format from the server');
            }
        } catch (error) {
            console.error('Error fetching user reports:', error);
            setError('Failed to load your reports. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (reportsData) => {
        const stats = {
            total: reportsData.length,
            pending: 0,
            approved: 0,
            rejected: 0
        };
        
        reportsData.forEach(report => {
            if (report.status === 'PENDING') {
                stats.pending++;
            } else if (report.status === 'APPROVE' || report.status === 'APPROVED') {
                stats.approved++;
            } else if (report.status === 'REJECT' || report.status === 'REJECTED') {
                stats.rejected++;
            }
        });
        
        setStats(stats);
    };

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
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        
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
            console.error('Date formatting error:', e);
            return 'Invalid date';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING':
                return 'warning';
            case 'APPROVED':
            case 'APPROVE':
                return 'success';
            case 'REJECTED':
            case 'REJECT':
                return 'error';
            default:
                return 'default';
        }
    };

    const getPostTitle = (postId) => {
        const post = posts[postId];
        if (!post) {
            return 'Unknown Post';
        }
        return post.title || 'Untitled Post';
    };

    const refreshData = () => {
        fetchUserReports();
        fetchPosts();
    };

    if (!user) {
        return (
            <Container style={{ padding: '20px' }}>
                <Typography variant="h5" align="center">
                    Please log in to view your reports
                </Typography>
            </Container>
        );
    }

    return (
        <Container style={{ padding: '20px' }}>
            <Typography variant="h4" gutterBottom>
                My Reports
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
                            <Typography variant="h4">{stats.total}</Typography>
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
                                {stats.pending}
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
                                {stats.approved}
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
                                {stats.rejected}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Divider sx={{ mb: 3 }} />
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : reports.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="h6" align="center">
                        You haven't submitted any reports yet.
                    </Typography>
                </Alert>
            ) : (
                <TableContainer component={Paper} elevation={3}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: 'primary.light' }}>
                                <TableCell><Typography variant="subtitle2">Post Title</Typography></TableCell>
                                <TableCell><Typography variant="subtitle2">Report Reason</Typography></TableCell>
                                <TableCell><Typography variant="subtitle2">Status</Typography></TableCell>
                                <TableCell><Typography variant="subtitle2">Admin Comment</Typography></TableCell>
                                <TableCell><Typography variant="subtitle2">Date Submitted</Typography></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reports.map((report) => (
                                <TableRow key={report._id || report.id} hover>
                                    <TableCell>
                                        {getPostTitle(report.postId)}
                                    </TableCell>
                                    <TableCell>{report.reason}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={report.status}
                                            color={getStatusColor(report.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {report.adminComment ? (
                                            <Typography variant="body2">{report.adminComment}</Typography>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">No comment yet</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(report.reportedAt)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
};

export default UserReports;