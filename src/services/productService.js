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
            // Kiểm tra sản phẩm tồn tại
            const allProducts = await axios.get(`${BASE_URL}/product/get-all`);
            const existingProduct = allProducts.data.find(
                p => p.MaSanPham === productData.productCode
            );

            if (existingProduct) {
                // Nếu sản phẩm đã tồn tại, tạo một bản ghi mới với thông tin của sản phẩm cũ
                const response = await axios.post(`${BASE_URL}/product/create`, {
                    TenSanPham: existingProduct.TenSanPham,
                    MaLoaiSanPham: existingProduct.MaLoaiSanPham,
                    MaSanPham: existingProduct.MaSanPham,
                    DonGia: existingProduct.DonGia,
                    SoLuong: 1 // Mỗi lần thêm mới là cộng 1
                });
                return response.data;
            } else {
                // Nếu là sản phẩm mới
                const response = await axios.post(`${BASE_URL}/product/create`, {
                    TenSanPham: productData.productName,
                    MaLoaiSanPham: productData.categoryId,
                    MaSanPham: productData.productCode,
                    DonGia: parseFloat(productData.price),
                    SoLuong: 0
                });
                return response.data;
            }
        } catch (error) {
            console.error('Error adding product:', error);
            throw new Error(error.response?.data?.message || 'Không thể thêm sản phẩm');
        }
    }
};

export default productService;
