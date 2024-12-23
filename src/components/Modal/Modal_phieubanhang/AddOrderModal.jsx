import React, { useState, useEffect } from "react";
import { Select, Input, Button, Space } from "antd";
import { UserOutlined, EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import CustomerSearchModal from "../Modal_timkiemkhachhang/Modal_timkiemkhachhang";
import ProductSearchModal from "../Modal_timkiemsanpham/ProductSearchModal";
import "./AddOrderModal.css";
import axios from 'axios';
import { createOrder } from '../../../services/Orderproduct'; // Thay đổi import
const { Option } = Select;

const AddOrderModal = ({ isVisible, onClose, title, save }) => {
  const [searchTerm, setSearchTerm] = useState(""); // Trạng thái tìm kiếm
  const [filteredProducts, setFilteredProducts] = useState([]); // Sản phẩm được lọc
  const [cart, setCart] = useState([]); // Giỏ hàng
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [quantities, setQuantities] = useState({}); // Thêm state để lưu số lượng
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Remove handleSearch function and productList since we don't need them anymore
  
  const handleProductSelect = (product) => {
    if (!cart.some((item) => item.id === product.id)) {
      // Add product with its quantity to cart
      setCart(prevCart => [...prevCart, product]);
      // Set the quantity from the modal
      setQuantities(prev => ({
        ...prev,
        [product.id]: product.quantity || 1
      }));
    }
    setIsProductModalVisible(false);
  };
  // Thêm sản phẩm vào giỏ hàng
  const addToCart = (product) => {
    if (!cart.some((item) => item.id === product.id)) {
      setCart((prevCart) => [...prevCart, product]);
    }
    setSearchTerm(""); // Reset thanh tìm kiếm về rỗng
    setFilteredProducts([]); // Reset danh sách sản phẩm
  };
  const handleQuantityChange = (productId, change) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + change)
    }));
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
  // Lưu đơn hàng
  const handleSaveOrder = async () => {
    try {
      // Validate input data
      if (!selectedCustomer?.id) {
        alert('Vui lòng chọn khách hàng');
        return;
      }

      if (!orderDate) {
        alert('Vui lòng chọn ngày lập phiếu');
        return;
      }

      if (cart.length === 0) {
        alert('Vui lòng thêm sản phẩm vào giỏ hàng');
        return;
      }

      // Format invoice data
      const invoiceData = {
        NgayLap: orderDate,
        MaKhachHang: selectedCustomer.id,
        TongTien: cart.reduce((total, item) => {
          const quantity = parseInt(quantities[item.id] || 1);
          const price = parseFloat(item.rawPrice || 0);
          return total + (quantity * price);
        }, 0)
      };

      // Format details
      const details = cart.map(item => ({
        MaSanPham: item.id,
        SoLuong: parseInt(quantities[item.id] || 1),
        DonGiaBanRa: parseFloat(item.rawPrice || 0),
        ThanhTien: parseFloat(item.rawPrice || 0) * parseInt(quantities[item.id] || 1)
      }));

      // Create final request data structure
      const orderData = {
        invoiceData,
        details 
      };

      console.log('Sending data:', orderData);
      const result = await createOrder(orderData);
      console.log('Server response:', result);

      alert('Lưu phiếu bán hàng thành công!');
      resetModal(); // Reset all states
      onClose();    // Close modal
    } catch (error) {
      console.error('Error:', error);
      alert(`Lỗi: ${error.response?.data?.message || 'Có lỗi xảy ra khi lưu phiếu bán hàng'}`);
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
                  style={{ width: "100%", marginBottom: 16, borderRadius: '8px' }}
                >
                  Chọn sản phẩm
                </Button>
                <ProductSearchModal
                  isVisible={isProductModalVisible}
                  onCancel={() => setIsProductModalVisible(false)}
                  onConfirm={handleProductSelect}
                />
                {/* Hiển thị giỏ hàng */}
                <div className="cart-container">
                  <h3>Giỏ hàng</h3>
                  {cart.length > 0 ? (
                            cart.map((item) => (
                              <div
                                key={item.id}
                                className="cart-item"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  marginBottom: 10,
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
                                  <strong>{item.name}</strong>
                                  <div style={{ color: "gray" }}>{item.price}</div>
                                </div>
                                <div style={{ 
                                  marginRight: '15px',
                                  padding: '4px 8px',
                                  backgroundColor: '#f5f5f5',
                                  borderRadius: '4px',
                                  fontSize: '14px'
                                }}>
                                  Số lượng: {quantities[item.id] || 1}
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
                            ))
                          ) : (
                            <p>Chưa có sản phẩm trong giỏ hàng</p>
                          )}
                          
                        </div>
                        
                        {/* Di chuyển modal-footer vào đây */}
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
