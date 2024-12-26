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

export const getAllOrders = async () => {
    try {
        // Get both orders and customers in parallel
        const [ordersRes, customersRes] = await Promise.all([
            axiosInstance.get('/sale/get-all'),
            axiosInstance.get('/customers/get-all')
        ]);

        // Create customer lookup map
        const customerMap = {};
        customersRes.data.forEach(customer => {
            customerMap[customer.MaKhachHang] = customer.TenKhachHang;
        });

        // Map the response including customer names
        const ordersWithCustomers = {
            ...ordersRes,
            data: ordersRes.data.map(order => ({
                ...order,
                TenKhachHang: customerMap[order.MaKhachHang] || 'Khách lẻ'
            }))
        };

        return ordersWithCustomers;
    } catch (error) {
        throw error;
    }
};

export const getOrderById = async (id) => {
    try {
        // Get both order and customer data
        const [orderResponse, customersResponse] = await Promise.all([
            axiosInstance.get(`/sale/get-by-id/${id}`),
            axiosInstance.get('/customers/get-all'),
        ]);

        // Find customer info from customer data
        const customerInfo = customersResponse.data.find(
            customer => customer.MaKhachHang === orderResponse.data.MaKhachHang
        );

        // Combine order data with customer info
        const enrichedResponse = {
            ...orderResponse.data,
            customer: {
                TenKhachHang: customerInfo?.TenKhachHang || '',
                SoDT: customerInfo?.SoDT || '',
                DiaChi: customerInfo?.DiaChi || ''
            }
        };

        console.log('Enriched order data:', enrichedResponse);
        return enrichedResponse;
    } catch (error) {
        console.error('Error getting order:', error);
        throw error;
    }
};

export const createOrder = async (orderData) => {
    try {
        const response = await axiosInstance.post('/sale/create', orderData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateOrder = async (id, orderData) => {
    try {
        const response = await axiosInstance.put(`/sale/update/${id}`, orderData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteOrder = async (id) => {
    try {
        await axiosInstance.delete(`/sale/delete/${id}`);
    } catch (error) {
        throw error;
    }
};
