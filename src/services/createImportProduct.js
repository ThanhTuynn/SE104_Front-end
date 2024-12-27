import axios from 'axios';
import { getAccessToken } from '../utils/auth';

const API_URL = 'http://localhost:3000/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for dynamic token
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

export const createImportProduct = {
  getAllProvider: async () => {
    try {
      const response = await axiosInstance.get('/provider/get-all');
      return response.data;
    } catch (error) {
      console.error('Get all provider error', error);
      throw error;
    }
  },
  createProvider: async (providerData) => {
    try {
      const response = await axiosInstance.post('/provider/create', providerData);
      return response.data;
    } catch (error) {
      console.error('Creating provider error', error);
      throw error;
    }
  },
  getAllProducts: async () => {
    try {
      const response = await axiosInstance.get('/product/get-all');
      return response.data;
    } catch (error) {
      console.error('Get all products error', error);
      throw error;
    }
  },
  createProduct: async (productData) => {
    try {
      const response = await axiosInstance.post('/product/create', productData);
      return response.data;
    } catch (error) {
      console.error('Creating product error', error);
      throw error;
    }
  },
  getAllProductCategoryNames: async () => {
    try {
      const response = await axiosInstance.get('/product/get-all');
      const products = response.data;

      // Extract unique category names
      const categoryNames = [...new Set(products.map(product => product.TenLoaiSanPham))];

      return categoryNames;
    } catch (error) {
      console.error('Get all product category names error', error);
      throw error;
    }
  },
  createOrder: async (orderData) => {
    try {
      const response = await axiosInstance.post('/purchase/create', orderData);
      return response.data;
    } catch (error) {
      console.error('Creating order error', error);
      throw error;
    }
  },
};

export default createImportProduct;
