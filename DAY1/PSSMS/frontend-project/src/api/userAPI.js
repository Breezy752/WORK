import apiClient from './apiClient';

export const loginUser = (credentials) => apiClient.post('/auth/login', credentials);
export const registerUser = (userData) => apiClient.post('/auth/register', userData);
export const logoutUser = () => apiClient.post('/auth/logout');
export const checkSession = () => apiClient.get('/auth/session');
export const resetPassword = (data) => apiClient.post('/auth/reset-password', data);
