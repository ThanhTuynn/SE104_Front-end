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
    
            // Sort products by createdAt in descending order
            const sortedProducts = productsRes.data.sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
    
            // Map the sorted products
            return sortedProducts.map(product => ({
                key: product.MaSanPham,
                MaSanPham: product.MaSanPham,
                TenSanPham: product.TenSanPham,
                MaLoaiSanPham: product.MaLoaiSanPham,
                TenLoaiSanPham: categoryMap[product.MaLoaiSanPham] || 'Chưa phân loại',
                DonGia: product.DonGia || 0,
                SoLuong: product.SoLuong || 0,
                HinhAnh: product.HinhAnh || 'default-image.png',
                createdAt: product.createdAt,
    
                // Additional fields for UI
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
            console.log('Bắt đầu lấy danh sách loại sản phẩm...');
            const categoriesRes = await axiosInstance.get('/category/get-all');
            console.log('Đã nhận được danh sách loại sản phẩm:', categoriesRes.data);

            const categories = categoriesRes.data;
            
            // Thêm logs để theo dõi quá trình xử lý
            console.log('Đang xử lý từng loại sản phẩm để lấy đơn vị tính...');
            const categoriesWithUnits = await Promise.all(
                categories.map(async (category) => {
                    try {
                        console.log(`Đang lấy thông tin đơn vị tính cho loại sản phẩm ${category.TenLoaiSanPham}...`);
                        console.log('MaDVTinh của loại sản phẩm:', category.MaDVTinh);
                        console.log('MaDVTinh của loại sản phẩm:', category.PhanTramLoiNhuan);
                        const unitResponse = await axiosInstance.get(`/unit/get-details/${category.MaDVTinh}`);
                        console.log('Đã nhận được thông tin đơn vị tính:', unitResponse.data);

                        const result = {
                            ...category,
                            text: category.TenLoaiSanPham,
                            value: category.MaLoaiSanPham,
                            MaDVTinh: category.MaDVTinh,
                            PhanTramLoiNhuan: category.PhanTramLoiNhuan,
                            TenDVTinh: unitResponse.data.TenDVTinh
                            
                        };
                        
                        console.log('Đã map thành công:', {
                            CategoryName: result.TenLoaiSanPham,
                            UnitName: result.TenDVTinh,
                            PhanTramLoiNhuan: result.PhanTramLoiNhuan
                        });
                        
                        return result;
                    } catch (error) {
                        console.error(`Lỗi khi lấy đơn vị tính cho ${category.TenLoaiSanPham}:`, error);
                        return {
                            ...category,
                            text: category.TenLoaiSanPham,
                            value: category.MaLoaiSanPham,
                            MaDVTinh: category.MaDVTinh,
                            PhanTramLoiNhuan: category.PhanTramLoiNhuan,
                            TenDVTinh: 'Chưa có đơn vị'
                        };
                    }
                })
            );

            console.log('Hoàn thành xử lý tất cả loại sản phẩm với đơn vị tính:', categoriesWithUnits);
            return categoriesWithUnits;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách loại sản phẩm:', error);
            throw error;
        }
    },

    getAllUnits: async () => {
        try {
            const response = await axiosInstance.get('/unit/get-all');
            return response.data;
        } catch (error) {
            console.error('Error fetching units:', error);
            throw error;
        }
    },
    
    createProduct: async (productData, imageFile) => {
        try {
            const formData = new FormData();
            
            // Debug logs for product data
            console.log('Product Data before FormData:', {
                rawData: productData,
                imageFile: imageFile ? {
                    name: imageFile.name,
                    type: imageFile.type,
                    size: imageFile.size
                } : 'No image'
            });
            
            // Append all product data fields
            for (let key in productData) {
                formData.append(key, productData[key]);
                console.log(`Adding to FormData - ${key}:`, productData[key]);
            }
            
            // Append image file with specific field name
            if (imageFile) {
                formData.append('imageFile', imageFile, imageFile.name);
                console.log('Image file added to FormData:', {
                    fileName: imageFile.name,
                    fileType: imageFile.type,
                    fileSize: imageFile.size
                });
            }

            // Log final FormData contents
            console.log('Final FormData contents:');
            for (let pair of formData.entries()) {
                console.log(`${pair[0]}: ${pair[1] instanceof File ? 'File object' : pair[1]}`);
            }

            const response = await axiosInstance.post('/product/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            console.log('Create product success:', {
                status: response.status,
                data: response.data
            });
            
            return response.data;
        } catch (error) {
            console.error('Create product error full details:', {
                message: error.message,
                status: error.response?.status,
                responseData: error.response?.data,
                requestData: {
                    productData,
                    hasImage: !!imageFile
                }
            });
            throw new Error(error.response?.data?.error || 'Không thể tạo sản phẩm');
        }
    },

    updateProduct: async (id, dataToUpdate) => {
        try {
            const response = await axiosInstance.patch(`/product/update/${id}`, dataToUpdate, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
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
