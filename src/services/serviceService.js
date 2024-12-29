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

    createServiceTicket: async (serviceData) => {
        try {
            // Validate and format data before sending
            const formattedData = {
                ticketData: {
                    SoPhieuDV: serviceData.ticketData.SoPhieuDV,
                    MaKhachHang: serviceData.ticketData.MaKhachHang,
                    NgayLap: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
                    TongTien: Number(serviceData.ticketData.TongTien) || 0,
                    TongTienTraTruoc: Number(serviceData.ticketData.TongTienTraTruoc) || 0,
                    TinhTrang: "Chưa giao"
                },
                details: serviceData.details.map(detail => ({
                    MaLoaiDV: detail.MaLoaiDV,
                    SoLuong: Number(detail.SoLuong),
                    DonGiaDuocTinh: detail.DonGiaDuocTinh,
                    ChiPhiRieng: detail.ChiPhiRieng,
                    TraTruoc: detail.TraTruoc,
                    ThanhTien: detail.ThanhTien,
                    NgayGiao: detail.NgayGiao,
                    TinhTrang: "Chưa giao"
                }))
            };

            // Log the formatted data
            console.log('Formatted service data:', formattedData);

            const response = await axiosInstance.post('/services/create', formattedData);
            return response.data;
        } catch (error) {
            console.error('Create service ticket error:', error);
            throw new Error(
                error.response?.data?.message || 
                'Lỗi tạo phiếu dịch vụ'
            );
        }
    },

    getServiceTicketById: async (id) => {
        try {
            const response = await axiosInstance.get(`/services/${id}`);
            console.log("Raw API response:", response.data);

            // Kiểm tra dữ liệu trả về
            if (!response.data || !response.data.serviceTicket || !response.data.serviceDetails) {
                throw new Error('Invalid response structure from API');
            }

            const formattedResponse = {
                ticketInfo: {
                    SoPhieuDV: response.data.serviceTicket.SoPhieuDV,
                    NgayLap: response.data.serviceTicket.NgayLap,
                    MaKhachHang: response.data.serviceTicket.MaKhachHang,
                    TongTien: response.data.serviceTicket.TongTien?.toString() || "0",
                    TongTienTraTruoc: response.data.serviceTicket.TongTienTraTruoc?.toString() || "0",
                    TinhTrang: response.data.serviceTicket.TinhTrang || "Chưa giao",
                    customer: {
                        TenKhachHang: response.data.serviceTicket.customer?.TenKhachHang || "",
                        SoDT: response.data.serviceTicket.customer?.SoDT || "",
                        DiaChi: response.data.serviceTicket.customer?.DiaChi || ""
                    }
                },
                services: response.data.serviceDetails.map(detail => ({
                    id: detail.MaChiTietDV,
                    name: detail.TenLoaiDichVu || "",
                    price: parseFloat(detail.DonGiaDuocTinh) || 0,
                    quantity: parseInt(detail.SoLuong) || 1,
                    total: parseFloat(detail.ThanhTien) || 0,
                    prepaid: parseFloat(detail.TraTruoc) || 0,
                    additionalCost: parseFloat(detail.ChiPhiRieng) || 0,
                    status: detail.TinhTrang || "Chưa giao",
                    deliveryDate: detail.NgayGiao || null,
                    pttr: parseFloat(detail.serviceType?.PhanTramTraTruoc) || 0,
                    serviceType: {
                        TenLoaiDichVu: detail.TenLoaiDichVu || "",
                        PhanTramTraTruoc: parseFloat(detail.serviceType?.PhanTramTraTruoc) || 0
                    }
                }))
            };

            console.log("Formatted response:", formattedResponse);
            return formattedResponse;

        } catch (error) {
            console.error('Get service ticket by ID error:', error);
            throw new Error(
                error.response?.data?.message || 
                'Không thể tải thông tin phiếu dịch vụ'
            );
        }
    },

    updateServiceTicket: async (id, ticketData) => {
        try {
            // Use axiosInstance instead of axios to ensure token is included
            const response = await axiosInstance.put(`/services/update/${id}`, ticketData);
            return response.data;
        } catch (error) {
            console.error('Update service error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw new Error(error.response?.data?.message || 'Không thể cập nhật phiếu dịch vụ');
        }
    }
};

export default serviceService;
