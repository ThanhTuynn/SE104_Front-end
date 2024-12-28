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

const serviceService = {
    getAllServiceTickets: async () => {
        try {
            const response = await axiosInstance.get('/services/get-all');
            console.log('Service API response:', response.data); // Debug log
            return response.data;
        } catch (error) {
            console.error('Get services error:', error);
            throw error;
        }
    },

    getAllServices: async () => {
        try {
            const response = await axiosInstance.get('/services/get-all');
            return response.data.map(ticket => ({
                key: ticket.SoPhieuDV,
                SoPhieuDV: ticket.SoPhieuDV,
                NgayLap: ticket.NgayLap,
                customer: ticket.customer,
                TongTien: ticket.TongTien,
                TongTienTraTruoc: ticket.TongTienTraTruoc,
                TinhTrang: ticket.TinhTrang
            }));
        } catch (error) {
            console.error('Get services error:', error);
            throw error;
        }
    },

    deleteServiceTicket: async (id) => {
        try {
            await axiosInstance.delete(`/services/delete/${id}`);
        } catch (error) {
            console.error('Delete service error:', error);
            throw error;
        }
    },

    deleteMultipleServiceTickets: async (ids) => {
        try {
            const deletePromises = ids.map(id => 
                axiosInstance.delete(`/services/delete/${id}`)
            );
            await Promise.all(deletePromises);
        } catch (error) {
            console.error('Delete multiple services error:', error);
            throw error;
        }
    },

    createServiceTicket: async (ticketData, details) => {
        try {
            const response = await axiosInstance.post('/services/create', {
                ticketData,
                details
            });
            return response.data;
        } catch (error) {
            console.error('Create service ticket error:', error);
            throw new Error(
                error.response?.data?.message || 
                'Không thể tạo phiếu dịch vụ'
            );
        }
    },

    getServiceTicketById: async (id) => {
        try {
            const response = await axiosInstance.get(`/services/${id}`);
            console.log('Service ticket data:', response.data);
            return {
                ticketInfo: {
                    SoPhieuDV: response.data.serviceTicket.SoPhieuDV,
                    NgayLap: response.data.serviceTicket.NgayLap,
                    TongTien: response.data.serviceTicket.TongTien,
                    TongTienTraTruoc: response.data.serviceTicket.TongTienTraTruoc,
                    TinhTrang: response.data.serviceTicket.TinhTrang,
                    customer: response.data.serviceTicket.customer
                },
                services: response.data.serviceDetails.map(detail => ({
                    id: detail.MaChiTietDV,
                    name: detail.TenLoaiDichVu,
                    price: detail.DonGiaDuocTinh,
                    calculatedPrice: detail.DonGiaDuocTinh,
                    quantity: detail.SoLuong,
                    prepaid: detail.TraTruoc,
                    total: detail.ThanhTien,
                    additionalCost: detail.ChiPhiRieng,
                    deliveryDate: detail.NgayGiao,
                    status: detail.TinhTrang
                }))
            };
        } catch (error) {
            console.error('Get service ticket by ID error:', error);
            throw new Error(
                error.response?.data?.message || 
                'Không thể tải thông tin phiếu dịch vụ'
            );
        }
    }
};

export default serviceService;
