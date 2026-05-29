import apiClient from './apiClient';

export const getAllCars = () => apiClient.get('/cars');
export const getCarByPlate = (plateNumber) => apiClient.get(`/cars/${plateNumber}`);
export const addCar = (carData) => apiClient.post('/cars', carData);
export const updateCar = (plateNumber, carData) => apiClient.put(`/cars/${plateNumber}`, carData);
export const deleteCar = (plateNumber) => apiClient.delete(`/cars/${plateNumber}`);
