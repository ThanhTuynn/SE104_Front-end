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
      const response = await axiosInstance.post('/purchase/create', {
        soPhieu: orderData.orderId,
        ngayLap: orderData.date,
        nhaCungCap: orderData.supplierId,
        chiTietSanPham: orderData.products.map(product => ({
          maSanPham: product.code,
          soLuong: parseInt(product.quantity),
          donGia: parseFloat(product.unitPrice),
          thanhTien: parseInt(product.quantity) * parseFloat(product.unitPrice)
        }))
      });
      return response.data;
    } catch (error) {
      console.error('Create purchase order error:', error);
      throw error;
    }
  },
  getPurchaseById: async (id) => {
    try {
      const response = await axiosInstance.get(`/purchase/get-details/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get purchase by id error:', error);
      throw error;
    }
  },
  getProviderById: async (providerId) => {
    try {
      const response = await axiosInstance.get(`/provider/get-details/${providerId}`);
      return response.data;
    } catch (error) {
      console.error('Get provider details error:', error);
      throw error;
    }
  },
  getProductById: async (productId) => {
    try {
      const response = await axiosInstance.get(`/product/get-details/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Get product details error:', error);
      throw error;
    }
  },
  updatePurchase: async (id, updateData) => {
    try {
      const { updateDetails, addDetails, deleteDetails } = updateData;
      const response = await axiosInstance.patch(`/purchase/update/${id}`, {
        updateDetails: updateDetails || [],
        addDetails: addDetails || [],
        deleteDetails: deleteDetails || []
      });
      return response.data;
    } catch (error) {
      console.error('Update purchase error:', error);
      throw error;
    }
  },
};

export default createImportProduct;
