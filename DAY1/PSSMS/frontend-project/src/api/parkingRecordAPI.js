import apiClient from './apiClient';

export const getAllRecords = () => apiClient.get('/parking-records');
export const getRecordById = (id) => apiClient.get(`/parking-records/${id}`);
export const addRecord = (recordData) => apiClient.post('/parking-records', recordData);
export const updateRecord = (id, recordData) => apiClient.put(`/parking-records/${id}`, recordData);
export const deleteRecord = (id) => apiClient.delete(`/parking-records/${id}`);
