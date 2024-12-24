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

// Add request interceptor to handle token
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



// Hàm lấy danh sách tất cả phiếu mua hàng
export const getAllPurchases = async () => {
  try {
    const response = await axiosInstance.get('/purchase/get-all');
    return response.data;
  } catch (error) {
    console.error('Getting all purchase orders failed:', error);
    throw error;
  }
};

// Hàm lấy chi tiết phiếu mua hàng theo số phiếu
export const getPurchaseDetails = async (soPhieu) => {
  try {
    const response = await axiosInstance.get(`/purchase/get-detail/${soPhieu}`);
    return response.data;
  } catch (error) {
    console.error('Getting purchase order details failed:', error);
    throw error;
  }
};

// Hàm tạo phiếu mua hàng mới
export const createPurchase = async (purchaseData) => {
  try {
    const response = await axiosInstance.post('/purchase/create', purchaseData);
    return response.data;
  } catch (error) {
    console.error('Creating purchase failed:', error);
    throw error;
  }
};

// Hàm cập nhật phiếu mua hàng
export const updatePurchase = async (soPhieu, purchaseData) => {
  try {
    const response = await axiosInstance.put(`/purchase/update/${soPhieu}`, purchaseData);
    return response.data;
  } catch (error) {
    console.error('Updating purchase order failed:', error);
    throw error;
  }
};

// Hàm xóa phiếu mua hàng
export const deletePurchase = async (soPhieu) => {
  try {
    await axiosInstance.delete(`/purchase/delete/${soPhieu}`);
  } catch (error) {
    console.error('Deleting purchase order failed:', error);
    throw error;
  }
};
