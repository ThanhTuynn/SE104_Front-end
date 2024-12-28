import React, { useState, useEffect } from "react";
import { Select, Input, Button, Space, message } from "antd";
import { UserOutlined, EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import CustomerSearchModal from "../Modal_timkiemkhachhang/Modal_timkiemkhachhang";
import ProductSearchModal from "../Modal_timkiemsanpham/ProductSearchModal";
import "./AddOrderModal.css";
import axios from 'axios';
import { createOrder } from '../../../services/Orderproduct'; // Thay đổi import
import productService from '../../../services/productService';
const { Option } = Select;

const AddOrderModal = ({ isVisible, onClose, title, save }) => {
  // Add products state
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [units, setUnits] = useState([]);
  const [categories, setCategories] = useState([]);

  // Add useEffect to fetch products when modal opens
  useEffect(() => {
    if (isVisible) {
      fetchProducts();
    }
  }, [isVisible]);

  const fetchProducts = async () => {
    try {
      const [productsRes, categoriesRes, unitsRes] = await Promise.all([
        axios.get('http://localhost:3000/api/product/get-all'),
        axios.get('http://localhost:3000/api/category/get-all'),
        axios.get('http://localhost:3000/api/unit/get-all')
      ]);

      // 1. Tạo mapping cho đơn vị tính
      const unitsMap = {};
      const units = Array.isArray(unitsRes.data) ? unitsRes.data : 
                   (unitsRes.data.data ? unitsRes.data.data : []);
      
      units.forEach(unit => {
        if (unit && unit.MaDVTinh) {
          unitsMap[unit.MaDVTinh] = unit.TenDVTinh;
        }
      });

      console.log('=== Units Data ===');
      console.log('Units from API:', units);
      console.log('Units Map:', unitsMap);

      // 2. Tạo mapping cho loại sản phẩm
      const categoryMap = {};
      categoriesRes.data.forEach(cat => {
        categoryMap[cat.MaLoaiSanPham] = {
          TenLoaiSanPham: cat.TenLoaiSanPham,
          PhanTramLoiNhuan: cat.PhanTramLoiNhuan,
          MaDVTinh: cat.MaDVTinh
        };
      });

      console.log('=== Categories Data ===');
      console.log('Categories Map:', categoryMap);

      // 3. Map sản phẩm với đơn vị tính
      const productsWithDetails = productsRes.data
        .filter(product => !product.isDelete)
        .map(product => {
          const category = categoryMap[product.MaLoaiSanPham] || {};
          const maDVTinh = category.MaDVTinh;
          const tenDVTinh = unitsMap[maDVTinh];

          console.log(`=== Product ${product.MaSanPham} ===`);
          console.log('Category:', category);
          console.log('MaDVTinh:', maDVTinh);
          console.log('TenDVTinh:', tenDVTinh);

          return {
            id: product.MaSanPham,
            name: product.TenSanPham,
            price: `${product.DonGia?.toLocaleString('vi-VN')} VNĐ`,
            rawPrice: product.DonGia,
            image: product.HinhAnh || 'default-image.png',
            MaLoaiSanPham: product.MaLoaiSanPham,
            TenLoaiSanPham: category.TenLoaiSanPham,
            DonGia: product.DonGia,
            stock: product.SoLuong || 0,
            PhanTramLoiNhuan: category.PhanTramLoiNhuan || 0,
            MaDVTinh: maDVTinh,
            TenDVTinh: tenDVTinh || 'N/A',
            categoryName: category.TenLoaiSanPham || 'Chưa phân loại'
          };
        });

      console.log('=== Final Products ===');
      console.log('Products with details:', productsWithDetails);

      setProducts(productsWithDetails);
    } catch (error) {
      console.error('Error in fetchProducts:', error);
      message.error('Không thể tải dữ liệu sản phẩm');
    }
  };

  const handleProductSelect = (product) => {
    console.log('=== Selected Product ===');
    console.log('Product:', product);

    // Tìm sản phẩm trong danh sách products đã fetch
    const productWithDetails = products.find(p => p.id === product.id);
    if (!productWithDetails) {
      message.error('Không tìm thấy thông tin sản phẩm');
      return;
    }

    if (cart.some((item) => item.id === product.id)) {
      setQuantities(prev => {
        const currentQty = prev[product.id] || 1;
        const newQty = currentQty + 1;
        
        if (newQty > productWithDetails.stock) {
          message.warning(`Số lượng không thể vượt quá số lượng tồn kho (${productWithDetails.stock})`);
          return prev;
        }
        
        return {
          ...prev,
          [product.id]: newQty
        };
      });
    } else {
      const newProduct = {
        ...productWithDetails, // Lấy tất cả thông tin từ sản phẩm đã fetch
        quantity: 1
      };

      console.log('=== Adding to Cart ===');
      console.log('Product with details:', newProduct);

      setCart(prevCart => [...prevCart, newProduct]);
      setQuantities(prev => ({
        ...prev,
        [product.id]: 1
      }));
    }
    
    setIsProductModalVisible(false);
  };

  const handleQuantityChange = (productId, change) => {
    const cartItem = cart.find(item => item.id === productId);
    if (!cartItem) return;
  
    setQuantities(prev => {
      const currentQty = prev[productId] || 1;
      const newQty = currentQty + change;
  
      // Kiểm tra số lượng tối thiểu
      if (newQty < 1) return prev;
  
      // Kiểm tra số lượng tồn kho
      if (newQty > cartItem.stock) {
        message.warning(`Số lượng không thể vượt quá số lượng tồn kho (${cartItem.stock})`);
        return prev;
      }
  
      // Cập nhật số lượng mới
      return { ...prev, [productId]: newQty };
    });
  };
  
  const resetModal = () => {
    setSearchTerm("");
    setFilteredProducts([]);
    setCart([]);
    setQuantities({});
    setOrderDate(new Date().toISOString().split('T')[0]);
    setSelectedCustomer(null);
    setIsProductModalVisible(false);
    setIsCustomerModalVisible(false);
  };
  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };
  const [selectedProducts, setSelectedProducts] = useState([]);
  // Format ngày tháng khi gửi lên server
  const formatDateForServer = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };
  // Add function to calculate selling price with profit margin
  const calculateSellingPrice = (basePrice, profitMargin) => {
    console.log('Calculating selling price:', { basePrice, profitMargin });
    const margin = (profitMargin || 0) / 100;
    const finalPrice = basePrice * (1 + margin);
    console.log('Final price:', finalPrice);
    return finalPrice;
  };
  // Thêm hàm tính tổng tiền
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const quantity = quantities[item.id] || 1;
      const sellingPrice = calculateSellingPrice(item.rawPrice, item.PhanTramLoiNhuan);
      return total + (quantity * sellingPrice);
    }, 0);
  };
  // Lưu đơn hàng
  const handleSaveOrder = async () => {
    try {
      if (!selectedCustomer?.id || !orderDate || cart.length === 0 || !invoiceNumber) {
        message.error('Vui lòng điền đầy đủ thông tin');
        return;
      }

      // Format dữ liệu theo yêu cầu backend
      const orderData = {
        invoiceData: {
          SoPhieuBH: invoiceNumber,
          NgayLap: orderDate,
          MaKhachHang: selectedCustomer.id,
          TongTien: calculateTotal()
        },
        details: cart.map(item => {
          const quantity = quantities[item.id] || 1;
          const sellingPrice = calculateSellingPrice(item.rawPrice, item.PhanTramLoiNhuan);
          return {
            MaSanPham: item.id,
            SoLuong: parseInt(quantity),
            DonGiaBanRa: parseFloat(sellingPrice),
            ThanhTien: quantity * sellingPrice
          };
        })
      };

      await createOrder(orderData);
      message.success('Lưu phiếu bán hàng thành công!');
      resetModal();
      onClose();
    } catch (error) {
      console.error('Save order error:', error);
      message.error('Có lỗi xảy ra khi lưu phiếu bán hàng');
    }
  };
  const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  if (!isVisible) return null;
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer({
      id: customer.id,
      name: customer.name,
      phone: customer.phone
    });
    setIsCustomerModalVisible(false);
  };
  
  return (
    <div className="tc1">
      <div className="overlay1">
        <div className="modal1">
          <div className="modal-content">
            <h3 className="modal-title">{title}</h3>
            <div className="modal-body">
              {/* Cột bên trái: Thông tin */}
              <div className="modal-column left-column">
                <div className="header-row">
                  <label>Mã phiếu bán hàng</label>
                </div>
                <Input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="Nhập mã phiếu bán hàng"
                  style={{
                    marginBottom: '16px',
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    width: "100%",
                    height: "40px",
                  }}
                />
                <div className="header-row">
                  <label>Thông tin khách hàng </label>
                  <div className="toggle-container">
                  </div>
                </div>
                <form>
                  <div className="custom-select-container">
                  <Button
                      type="primary"
                      className="custom-inputt"
                      onClick={() => setIsCustomerModalVisible(true)}
                      style={{
                        height: '40px',
                        borderRadius: '8px',
                        marginBottom: selectedCustomer ? '16px' : '0'
                      }}
                    >
                      Tìm kiếm khách hàng
                    </Button>
                    {selectedCustomer && (
                        <div style={{
                          padding: '12px',
                          border: '1px solid #e6e9f0',
                          borderRadius: '8px',
                          backgroundColor: '#f8f9ff'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <UserOutlined style={{ fontSize: '24px' }} />
                            <div>
                              <div style={{ fontWeight: 'bold' }}>{selectedCustomer.name}</div>
                              <div style={{ color: '#666' }}>{selectedCustomer.phone}</div>
                            </div>
                          </div>
                        </div>
                      )}
                      <CustomerSearchModal
                        isVisible={isCustomerModalVisible}
                        onCancel={() => setIsCustomerModalVisible(false)}
                        title={"Tìm kiếm khách hàng"}
                        onConfirm={handleCustomerSelect}
                      />
                  </div>
                  <br />
                  <div style={{ display: "flex", gap: "16px" }} className="row3">
                  </div>
                  <br />
                  <label>Ngày tháng năm đặt hàng</label>
                  <br />
                  <div className="days" style={{ display: "flex", gap: "16px" }}>
                    <input
                      type="date"
                      value={orderDate}
                      onChange={(e) => setOrderDate(e.target.value)}
                      style={{
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        width: "100%",
                        height: "30px",
                      }}
                    />
                  </div>
                </form>
              </div>

              {/* Cột bên phải: Chọn sản phẩm */}
              {/* Cột bên phải: Chọn sản phẩm và giỏ hàng */}
              <div className="modal-column right-column">
                <h3>Sản phẩm</h3>
                <Button
                  type="primary"
                  onClick={() => setIsProductModalVisible(true)}
                  style={{ width: "100%", marginTop: "-5px", borderRadius: '8px', height: '40px' }}
                >
                  Chọn sản phẩm
                </Button>
                <ProductSearchModal
                  isVisible={isProductModalVisible}
                  onCancel={() => setIsProductModalVisible(false)}
                  onConfirm={handleProductSelect}
                />
                {/* Hiển thị giỏ hàng */}
                <div className="cart-container" style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  paddingRight: '10px',
                  marginBottom: '20px'
                }}>
                  <h3>Giỏ hàng</h3>
                  {cart.length > 0 ? (
                    <>
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="cart-item"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 10,
                            padding: "10px",
                            backgroundColor: "#f8f9ff",
                            borderRadius: "8px"
                          }}
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: "40px",
                              height: "40px",
                              marginRight: "10px",
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              display: "flex", 
                              justifyContent: "space-between", 
                              alignItems: "center",
                              marginBottom: "4px"
                            }}>
                              <strong style={{ flex: 1 }}>{item.name}</strong>
                              <div style={{ 
                                color: "gray", 
                                marginLeft: "10px",
                                backgroundColor: "#f0f0f0",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontSize: "0.9em"
                              }}>
                                {item.TenDVTinh}
                              </div>
                            </div>
                            <div style={{ color: "gray" }}>
                              Đơn giá gốc: {item.price}
                            </div>
                            <div style={{ color: "gray" }}>
                              Lợi nhuận: {item.PhanTramLoiNhuan}%
                            </div>
                            <div style={{ color: "blue" }}>
                              Thành tiền: {new Intl.NumberFormat('vi-VN').format(
                                calculateSellingPrice(item.rawPrice, item.PhanTramLoiNhuan) * (quantities[item.id] || 1)
                              )} đ
                            </div>
                            <div style={{ color: item.stock > 0 ? "green" : "red", marginTop: "4px" }}>
                              Tồn kho: {item.stock}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '15px' }}>
                            <Button 
                              size="small"
                              onClick={() => handleQuantityChange(item.id, -1)}
                              disabled={quantities[item.id] <= 1}
                            >
                              -
                            </Button>
                            <span style={{ 
                              padding: '4px 8px',
                              backgroundColor: '#e6f7ff',
                              borderRadius: '4px',
                              minWidth: '40px',
                              textAlign: 'center'
                            }}>
                              {quantities[item.id] || 1}
                            </span>
                            <Button
                              size="small"
                              onClick={() => handleQuantityChange(item.id, 1)}
                              disabled={quantities[item.id] >= item.stock}
                            >
                              +
                            </Button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            style={{
                              backgroundColor: "#ff4d4f",
                              color: "#fff",
                              border: "none",
                              padding: "5px 10px",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            Xóa
                          </button>
                        </div>
                      ))}

                      {/* Tổng cộng */}
                      <div style={{
                        marginTop: "16px",
                        padding: "10px",
                        borderTop: "1px solid #eee",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <strong>Tổng cộng:</strong>
                        <span style={{ fontSize: "18px", color: "#1890ff" }}>
                          {new Intl.NumberFormat('vi-VN').format(calculateTotal())} đ
                        </span>
                      </div>
                    </>
                  ) : (
                    <p>Chưa có sản phẩm trong giỏ hàng</p>
                  )}
                </div>

                {/* Footer buttons */}
                <div className="modal-footer">
                  <button className="cancel-btn" onClick={onClose}>
                    Hủy
                  </button>
                  <button className="submit-btn" onClick={handleSaveOrder}>
                    {save}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOrderModal;