import axios from 'axios';

const API_URL = 'http://localhost:8081/api';

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    // Enable cookies/credentials with every request
    withCredentials: true
});

// Add a request interceptor to log requests and handle IDs
axiosInstance.interceptors.request.use(
    config => {
        console.log(`${config.method.toUpperCase()} request to ${config.url}`);
        
        if (config.data) {
            console.log('Request payload:', config.data);
        }
        return config;
    },
    error => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor to log responses
axiosInstance.interceptors.response.use(
    response => {
        console.log('Response received:', {
            status: response.status,
            url: response.config.url
        });
        return response;
    },
    error => {
        console.error('Response error:', error);
        return Promise.reject(error);
    }
);

export const api = {
    // Auth
    login: (data) => axiosInstance.post('/auth/login', data),
    signup: (data) => axiosInstance.post('/auth/signup', data),
    // Generic method for custom endpoints
    get: (endpoint) => axiosInstance.get(endpoint),
    post: (endpoint, data) => axiosInstance.post(endpoint, data),
    
    // Posts
    getPosts: () => axiosInstance.get('/posts'),
    getPostById: (id) => axiosInstance.get(`/posts/${id}`),

    // Reports
    createReport: (data) => axiosInstance.post('/reports', data),
    getReportsByPostId: (postId) => axiosInstance.get(`/reports/post/${postId}`),
    getUserReports: (userId) => axiosInstance.get(`/reports/user/${userId}`),
    // Admin
    getAllReports: () => axiosInstance.get('/admin/reports'),
    getPendingReports: () => axiosInstance.get('/admin/reports/pending'),
    handleReportAction: (data) => axiosInstance.put('/admin/reports/action', data)
};