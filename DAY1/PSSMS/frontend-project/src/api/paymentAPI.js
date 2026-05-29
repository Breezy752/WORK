import apiClient from './apiClient';

export const getAllPayments = () => apiClient.get('/payments');
export const getPaymentById = (id) => apiClient.get(`/payments/${id}`);
export const getDailyReport = (date) => apiClient.get(`/payments/report/daily${date ? `?date=${date}` : ''}`);
export const addPayment = (paymentData) => apiClient.post('/payments', paymentData);
export const updatePayment = (id, paymentData) => apiClient.put(`/payments/${id}`, paymentData);
export const deletePayment = (id) => apiClient.delete(`/payments/${id}`);
