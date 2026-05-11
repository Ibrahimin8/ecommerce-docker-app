import axios from 'axios';

const API = axios.create({
  // Use the production URL you just finalized
  baseURL: 'https://ecommerce-docker-app.onrender.com/api', 
  withCredentials: true, // Important for handling cookies/sessions if needed
});

// Add a request interceptor to attach the JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;