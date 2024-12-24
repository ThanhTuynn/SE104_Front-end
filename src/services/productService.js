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

const productService = {
    testConnection: async () => {
        try {
            const response = await axiosInstance.get('/product/get-all');
            console.log('Raw API response:', response);
            return { message: 'Connection successful' };
        } catch (error) {
            console.error('Connection error details:', {
                message: error.message,
                status: error?.response?.status,
                data: error?.response?.data
            });
            throw error;
        }
    },

    getAllProducts: async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                axiosInstance.get('/product/get-all'),
                axiosInstance.get('/category/get-all')
            ]);

            const categoryMap = {};
            categoriesRes.data.forEach(cat => {
                categoryMap[cat.MaLoaiSanPham] = cat.TenLoaiSanPham;
            });

            // Cập nhật đầy đủ thông tin sản phẩm theo cấu trúc bảng SANPHAM
            return productsRes.data.map(product => ({
                key: product.MaSanPham,
                MaSanPham: product.MaSanPham,        // Mã sản phẩm
                TenSanPham: product.TenSanPham,      // Tên sản phẩm
                MaLoaiSanPham: product.MaLoaiSanPham,// Mã loại sản phẩm
                TenLoaiSanPham: categoryMap[product.MaLoaiSanPham] || 'Chưa phân loại', // Tên loại
                DonGia: product.DonGia || 0,         // Đơn giá
                SoLuong: product.SoLuong || 0,       // Số lượng tồn kho
                HinhAnh: product.HinhAnh || 'default-image.png', // Hình ảnh

                // Các trường bổ sung cho giao diện
                productName: product.TenSanPham,
                productCode: product.MaSanPham,
                categoryId: product.MaLoaiSanPham,
                category: categoryMap[product.MaLoaiSanPham] || 'Chưa phân loại',
                stock: product.SoLuong || 0,
                image: product.HinhAnh || 'default-image.png',
                price: product.DonGia || 0,
                priceFormatted: `${(product.DonGia || 0).toLocaleString('vi-VN')} VNĐ`
            }));
        } catch (error) {
            console.error('Get products error:', error);
            throw error;
        }
    },

    getAllCategories: async () => {
        try {
            const response = await axiosInstance.get('/category/get-all');
            console.log('Raw categories response:', response.data); // Debug log
            return response.data.map(category => ({
                text: category.TenLoaiSanPham,
                value: category.MaLoaiSanPham
            }));
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },

    deleteProduct: async (id) => {
        try {
            const response = await axiosInstance.delete(`/product/delete/${id}`);
            console.log('Delete response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Delete product error:', error);
            throw new Error(error.response?.data?.message || 'Không thể xóa sản phẩm');
        }
    },

    deleteMultipleProducts: async (ids) => {
        try {
            // Sử dụng Promise.all để xóa nhiều sản phẩm cùng lúc
            await Promise.all(ids.map(id => 
                axiosInstance.delete(`/product/delete/${id}`)
            ));
            return { success: true, message: 'Đã xóa thành công các sản phẩm' };
        } catch (error) {
            console.error('Delete multiple products error:', error);
            throw new Error('Không thể xóa một số sản phẩm');
        }
    },

    getCategories: async () => {
        try {
            const response = await axiosInstance.get('/category/get-all');
            console.log('Raw categories response:', response.data); // Debug log
            return response.data; // Return raw data from API
        } catch (error) {
            console.error('Get categories error:', error);
            throw error;
        }
    },

    addProduct: async (productData) => {
        try {
            console.log('Sending product data:', productData);
            const response = await axiosInstance.post('/product/create', {
                MaSanPham: productData.MaSanPham,
                TenSanPham: productData.TenSanPham,
                MaLoaiSanPham: productData.MaLoaiSanPham,
                DonGia: parseFloat(productData.DonGia),
                SoLuong: parseInt(productData.SoLuong) || 0,
                HinhAnh: productData.HinhAnh || 'default-image.png'
            });
            return response.data;
        } catch (error) {
            console.error('Error adding product:', error.response?.data || error);
            throw new Error(error.response?.data?.message || 'Không thể thêm sản phẩm');
        }
    },

    updateProduct: async (id, productData) => {
        try {
            // Đảm bảo dữ liệu được gửi đi đầy đủ và đúng định dạng
            const dataToUpdate = {
                MaSanPham: productData.MaSanPham,
                TenSanPham: productData.TenSanPham,
                MaLoaiSanPham: productData.MaLoaiSanPham,
                DonGia: parseFloat(productData.DonGia),
                SoLuong: parseInt(productData.SoLuong),
                HinhAnh: productData.HinhAnh || 'default-image.png'
            };

            console.log('Sending update request:', {
                id,
                data: dataToUpdate
            });

            const response = await axiosInstance.patch(`/product/update/${id}`, dataToUpdate);
            console.log('Update response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Update error details:', error.response?.data || error);
            throw new Error(error.response?.data?.message || 'Không thể cập nhật sản phẩm');
        }
    },

    getProductById: async (id) => {
        try {
            console.log("Calling API with ID:", id);
            // Sửa lại endpoint để lấy chi tiết sản phẩm
            const response = await axiosInstance.get(`/product/get-details/${id}`);
            console.log("API Response:", response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    }
};

export default productService;
