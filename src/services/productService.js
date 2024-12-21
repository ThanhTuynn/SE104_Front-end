import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';  // Sửa lại BASE_URL

const productService = {
    testConnection: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/product/get-all`);
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
                axios.get(`${BASE_URL}/product/get-all`),
                axios.get(`${BASE_URL}/category/get-all`)
            ]);

            const categoryMap = {};
            categoriesRes.data.forEach(cat => {
                categoryMap[cat.MaLoaiSanPham] = cat.TenLoaiSanPham;
            });

            return productsRes.data.map(product => ({
                key: product.MaSanPham,
                productName: product.TenSanPham,
                productCode: product.MaSanPham,
                categoryId: product.MaLoaiSanPham,
                category: categoryMap[product.MaLoaiSanPham] || 'Chưa phân loại',
                stock: product.SoLuong || 0, // Sử dụng trường SoLuong từ database
                image: product.HinhAnh || 'kc_v.png',
                price: product.DonGia || 0
            }));
        } catch (error) {
            console.error('Get products error:', error);
            throw error;
        }
    },

    getAllCategories: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/category/get-all`);
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
            const response = await axios.delete(`${BASE_URL}/product/delete/${id}`);
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
                axios.delete(`${BASE_URL}/product/delete/${id}`)
            ));
            return { success: true, message: 'Đã xóa thành công các sản phẩm' };
        } catch (error) {
            console.error('Delete multiple products error:', error);
            throw new Error('Không thể xóa một số sản phẩm');
        }
    },

    getCategories: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/category/get-all`);
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
            const response = await axios.post(`${BASE_URL}/product/create`, {
                TenSanPham: productData.TenSanPham,
                MaLoaiSanPham: productData.MaLoaiSanPham,
                MaSanPham: productData.MaSanPham,
                DonGia: parseFloat(productData.DonGia),
                SoLuong: productData.SoLuong || 0
            });
            return response.data;
        } catch (error) {
            console.error('Error adding product:', error.response?.data || error);
            throw new Error(error.response?.data?.message || 'Không thể thêm sản phẩm');
        }
    },

    updateProduct: async (id, productData) => {
        try {
            console.log('Sending update request:', {
                id,
                data: {
                    TenSanPham: productData.TenSanPham,
                    MaLoaiSanPham: productData.MaLoaiSanPham,
                    MaSanPham: productData.MaSanPham,
                    DonGia: parseFloat(productData.DonGia || productData.price),
                    SoLuong: productData.SoLuong || 0 // Thêm trường SoLuong
                }
            });

            const response = await axios.patch(`${BASE_URL}/product/update/${id}`, {
                TenSanPham: productData.TenSanPham,
                MaLoaiSanPham: productData.MaLoaiSanPham,
                MaSanPham: productData.MaSanPham,
                DonGia: parseFloat(productData.DonGia || productData.price),
                SoLuong: productData.SoLuong || 0 // Thêm trường SoLuong
            });

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
            const response = await axios.get(`${BASE_URL}/product/get-details/${id}`);
            console.log("API Response:", response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    }
};

export default productService;
