import apiClient from './apiClient';

export const getAllSlots = () => apiClient.get('/parking-slots');
export const getAvailableSlots = () => apiClient.get('/parking-slots/available');
export const addSlot = (slotData) => apiClient.post('/parking-slots', slotData);
export const updateSlot = (slotNumber, slotData) => apiClient.put(`/parking-slots/${slotNumber}`, slotData);
export const deleteSlot = (slotNumber) => apiClient.delete(`/parking-slots/${slotNumber}`);
