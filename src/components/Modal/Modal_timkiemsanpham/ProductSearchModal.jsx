import React, { useState, useEffect } from "react";
import { Modal, Input, Table, Button, message } from "antd";
import axios from 'axios';
import "./ProductSearchModal.css";
import productService from '../../../services/productService';
import { getUnitById } from "../../../services/UnitTypeService";
const ProductSearchModal = ({ isVisible, onCancel, onConfirm, isProductPage = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [quantities, setQuantities] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Chỉ fetch products nếu không phải đang ở trang products
    if (isVisible && !isProductPage) {
      fetchProducts();
    }
  }, [isVisible, isProductPage]);

  const fetchProducts = async () => {
    try {
        setLoading(true);
        // Lấy song song sản phẩm và categories
        const [productsResponse, categoriesResponse] = await Promise.all([
            axios.get('http://localhost:3000/api/product/get-all'),
            axios.get('http://localhost:3000/api/category/get-all')
        ]);

        console.log('API Response - Products:', productsResponse.data);
        console.log('API Response - Categories:', categoriesResponse.data);

        // Tạo map cho loại sản phẩm
        const categoryMap = {};
        categoriesResponse.data.forEach(cat => {
            categoryMap[cat.MaLoaiSanPham] = {
                TenLoaiSanPham: cat.TenLoaiSanPham,
                PhanTramLoiNhuan: cat.PhanTramLoiNhuan, // Lấy trực tiếp từ LOAISANPHAM
                MaDVTinh: cat.MaDVTinh,
                TenDVTinh: cat.TenDVTinh // Thêm trường này
            };
        });

        // Format lại products với thông tin từ category
        const formattedProducts = productsResponse.data.map(product => {
            const category = categoryMap[product.MaLoaiSanPham];
            console.log('Mapping product:', {
                productId: product.MaSanPham,
                categoryInfo: category,
                ptln: category?.PhanTramLoiNhuan
            });

            return {
                id: product.MaSanPham,
                MaSanPham: product.MaSanPham,
                TenSanPham: product.TenSanPham,
                name: product.TenSanPham,
                MaLoaiSanPham: product.MaLoaiSanPham,
                DonGia: product.DonGia,
                SoLuong: product.SoLuong || 0,
                stock: product.SoLuong || 0,
                price: `${product.DonGia?.toLocaleString('vi-VN')} VNĐ`,
                rawPrice: product.DonGia,
                image: product.HinhAnh || 'default-image.png',
                // Lấy PhanTramLoiNhuan từ category map
                PhanTramLoiNhuan: parseFloat(category?.PhanTramLoiNhuan || 0),
                categoryName: category?.TenLoaiSanPham || 'Chưa phân loại',
                TenDVTinh: category?.TenDVTinh || 'N/A' // Ánh xạ đơn vị tính
            };
        });

        console.log('Formatted Products with PTLN:', formattedProducts);
        setProducts(formattedProducts);
    } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Không thể tải dữ liệu sản phẩm');
    } finally {
        setLoading(false);
    }
};

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuantityChange = (productId, change, maxStock) => {
    setQuantities(prev => {
      const currentQty = prev[productId] || 1;
      const newQty = currentQty + change;
      
      // Chỉ kiểm tra số lượng, không cập nhật database
      if (newQty < 1) {
        return prev;
      }
      if (newQty > maxStock) {
        message.warning(`Số lượng không thể vượt quá số lượng tồn kho (${maxStock})`);
        return prev;
      }
      
      return { ...prev, [productId]: newQty };
    });
  };

  const handleProductConfirm = (product) => {
    try {
        const selectedQuantity = quantities[product.id] || 1;
        
        if (selectedQuantity > product.stock) {
            message.error('Số lượng vượt quá tồn kho hiện có!');
            return;
        }

        // Log chi tiết trước khi gửi đi
        console.log('Selected product details:', {
            id: product.id,
            MaSanPham: product.MaSanPham,
            name: product.name,
            price: product.price,
            rawPrice: product.rawPrice,
            PhanTramLoiNhuan: product.PhanTramLoiNhuan,
            stock: product.stock,
            selectedQuantity
        });

        onConfirm({
            ...product,
            quantity: selectedQuantity,
            originalStock: product.stock,
            requestedQuantity: selectedQuantity
        });

        onCancel();
        message.success(`Đã thêm ${selectedQuantity} sản phẩm vào giỏ hàng`);
    } catch (error) {
        console.error('Error confirming product:', error);
        message.error('Không thể thêm sản phẩm');
    }
};

  return (
    <div className="modal-for-product1">
    <Modal
      title="Chọn sản phẩm"
      visible={isVisible} // dùng visible cho AntD 4 hoặc cũ hơn
      onCancel={onCancel}
      footer={null}
      width={1000}
    >
      <Input.Search
        placeholder="Tìm kiếm sản phẩm..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: "100%", marginBottom: 16 }}
      />
      <Table
        loading={loading}
        columns={[
          {
            title: 'Hình ảnh',
            dataIndex: 'image',
            width: '100px',
          },
          {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
          },
          {
            title: 'Giá',
            dataIndex: 'price',
          },
          {
            title: 'Tồn kho',
            dataIndex: 'stock',
            width: '100px',
          },
          {
            title: 'Số lượng',
            dataIndex: 'quantity',
            width: '150px',
            render: (_, record) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Button
                  onClick={() => handleQuantityChange(record.id, -1, record.stock)}
                  disabled={(quantities[record.id] || 1) <= 1}
                  style={{
                    width: '24px',
                    height: '24px',
                    minWidth: '24px',
                    borderRadius: '4px',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  -
                </Button>
                <span style={{ margin: '0 4px' }}>{quantities[record.id] || 1}</span>
                <Button
                  onClick={() => handleQuantityChange(record.id, 1, record.stock)}
                  style={{
                    width: '24px',
                    height: '24px',
                    minWidth: '24px',
                    borderRadius: '4px',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  +
                </Button>
              </div>
            ),
          },
          {
            title: '',
            render: (_, record) => (
              <Button
                type="primary"
                onClick={() => handleProductConfirm(record)}
              >
                Chọn
              </Button>
            ),
          },
        ]}
        dataSource={filteredProducts}
        rowKey="id"
        pagination={false}
        scroll={{ y: 300 }}
      />
    </Modal>
    </div>
  );
};

export default ProductSearchModal;