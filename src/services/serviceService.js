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
            // Lấy cả danh sách dịch vụ và khách hàng
            const [servicesRes, customersRes] = await Promise.all([
                axiosInstance.get('/services/get-all'),
                axiosInstance.get('/customers/get-all')
            ]);

            // Debug log
            console.log('Services data:', servicesRes.data);
            console.log('Customers data:', customersRes.data);

            // Tạo map cho khách hàng
            const customerMap = {};
            customersRes.data.forEach(customer => {
                customerMap[customer.MaKhachHang] = customer.TenKhachHang;
            });

            console.log('Customer mapping:', customerMap);

            // Map response data với tên khách hàng
            const mappedData = servicesRes.data.map(ticket => {
                console.log('Processing ticket:', ticket);
                console.log('Customer for ticket:', customerMap[ticket.MaKhachHang]);

                return {
                    key: ticket.SoPhieuDV,
                    productCode: ticket.SoPhieuDV,
                    serviceName: ticket.CHITIETDICHVU?.[0]?.LOAIDICHVU?.TenLoaiDichVu || 'Chưa có tên dịch vụ',
                    postedDate: new Date(ticket.NgayLap).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    }),
                    price: new Intl.NumberFormat('vi-VN', {
                        style: 'decimal',
                        maximumFractionDigits: 0
                    }).format(ticket.TongTien || 0),
                    customer: customerMap[ticket.MaKhachHang] || 'Không tìm thấy khách hàng'
                };
            });

            console.log('Mapped data:', mappedData);
            return mappedData;
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
    }
};

export default serviceService;
