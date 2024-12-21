import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/product';

const productService = {
    testConnection: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/get-all`);
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
            const response = await axios.get(`${BASE_URL}/get-all`);
            console.log('Raw product data:', response.data);
            
            return response.data.map(product => ({
                _id: product.MaSanPham,
                productName: product.TenSanPham,
                productCode: product.MaSanPham,
                category: product.TenLoaiSanPham || 'Chưa phân loại',
                stock: product.SoLuong || 0,
                price: product.DonGia || 0
            }));
        } catch (error) {
            console.error('Get products error:', error);
            throw error;
        }
    },

    deleteProduct: async (id) => {
        try {
            const response = await axios.delete(`${BASE_URL}/delete/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteMultipleProducts: async (ids) => {
        try {
            const response = await axios.post(`${BASE_URL}/delete-multiple`, { ids });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default productService;
