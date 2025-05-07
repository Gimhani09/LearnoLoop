import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8081', // Set the backend URL here
});

export default axiosInstance;
