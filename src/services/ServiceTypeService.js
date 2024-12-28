import axios from 'axios';
import { getAccessToken } from '../utils/auth';

const API_URL = 'http://localhost:3000/api';

// Create axios instance with dynamic token configuration
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to add token before each request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const getAllServiceTypes = async () => {
    try {
        const response = await axiosInstance.get('/service-types/get-all');
        return response.data;
    } catch (error) {
        console.error('Error in getAllServiceTypes:', error.response?.data || error.message);
        throw error;
    }
};

const createServiceType = async (data) => {
    try {
        const response = await axiosInstance.post('/service-types/create', data);
        return response.data;
    } catch (error) {
        console.error('Error in createServiceType:', error.response?.data || error.message);
        throw error;
    }
};

const updateServiceType = async (id, data) => {
    try {
        const response = await axiosInstance.put(`/service-types/update/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error in updateServiceType:', error.response?.data || error.message);
        throw error;
    }
};

const deleteServiceType = async (id) => {
    try {
        const response = await axiosInstance.delete(`/service-types/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error in deleteServiceType:', error.response?.data || error.message);
        throw error;
    }
};

const ServiceTypeService = {
    getAllServiceTypes,
    createServiceType,
    updateServiceType,
    deleteServiceType,
};

export default ServiceTypeService;
