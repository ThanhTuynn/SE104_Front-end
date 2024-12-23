import React, { useState, useEffect } from "react";
import { Select, Input, Button, Space, message } from "antd";
import { UserOutlined } from '@ant-design/icons';
import CustomerSearchModal from "../Modal_timkiemkhachhang/Modal_timkiemkhachhang";
import ProductSearchModal from "../Modal_timkiemsanpham/ProductSearchModal";
import "./AddOrderModal.css";
// Change this import
import { getOrderById, updateOrder } from '../../../services/Orderproduct';  // Update import to include updateOrder
const { Option } = Select;

const EditOrderModal = ({ isVisible, onClose, onSave, initialData, title = "Sửa đơn hàng" }) => {
  const [searchTerm, setSearchTerm] = useState(""); // Trạng thái tìm kiếm
  const [filteredProducts, setFilteredProducts] = useState([]); // Sản phẩm được lọc
  const [cart, setCart] = useState([]); // Giỏ hàng
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [quantities, setQuantities] = useState({}); // Thêm state để lưu số lượng
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Load initial data when modal opens
  useEffect(() => {
    const fetchOrderData = async () => {
        if (initialData && isVisible) {
            try {
                const response = await getOrderById(initialData.SoPhieuBH);
                console.log('Order data received:', response);

                if (response) {
                    setOrderDate(new Date(response.NgayLap).toISOString().split('T')[0]);

                    // Set customer info from enriched data
                    setSelectedCustomer({
                        id: response.MaKhachHang,
                        name: response.customer.TenKhachHang,
                        phone: response.customer.SoDT,
                        address: response.customer.DiaChi
                    });

                    if (Array.isArray(response.details)) {
                        const cartItems = response.details.map(detail => ({
                            id: detail.MaSanPham,
                            name: detail.product?.TenSanPham || `Sản phẩm ${detail.MaSanPham}`,
                            price: `${new Intl.NumberFormat('vi-VN').format(detail.DonGiaBanRa)} đ`,
                            rawPrice: detail.DonGiaBanRa,
                            image: detail.product?.HinhAnh || 'default-image.png',
                            quantity: detail.SoLuong,
                            MaChiTietBH: detail.MaChiTietBH
                        }));

                        console.log('Processed cart items:', cartItems);
                        setCart(cartItems);

                        const initQuantities = {};
                        response.details.forEach(detail => {
                            initQuantities[detail.MaSanPham] = detail.SoLuong;
                        });
                        setQuantities(initQuantities);
                    }
                }
            } catch (error) {
                console.error('Error fetching order data:', error);
                message.error('Có lỗi khi tải thông tin đơn hàng');
            }
        }
    };

    fetchOrderData();
}, [initialData, isVisible]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isVisible) {
      setCart([]);
      setQuantities({});
      setSelectedCustomer(null);
      setOrderDate(new Date().toISOString().split('T')[0]);
    }
  }, [isVisible]);

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

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Format ngày tháng khi gửi lên server
  const formatDateForServer = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };
  // Lưu đơn hàng
  const handleUpdateOrder = async () => {
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

      // Format data theo đúng cấu trúc backend yêu cầu
      const updateData = {
        invoiceData: {
          NgayLap: orderDate,
          MaKhachHang: selectedCustomer.id,
          TongTien: calculateTotal()
        },
        details: cart.map(item => ({
          MaChiTietBH: item.MaChiTietBH || `CTBH${Date.now()}_${item.id}`,
          SoPhieuBH: initialData.SoPhieuBH,
          MaSanPham: item.id,
          SoLuong: quantities[item.id] || 1,
          DonGiaBanRa: parseFloat(item.rawPrice),
          ThanhTien: (quantities[item.id] || 1) * parseFloat(item.rawPrice)
        }))
      };

      // Log để debug
      console.log('Updating invoice:', initialData.SoPhieuBH);
      console.log('Update data:', JSON.stringify(updateData, null, 2));

      // Gọi API update using updateOrder from Orderproduct service
      const result = await updateOrder(initialData.SoPhieuBH, updateData);
      console.log('Update response:', result);

      alert('Cập nhật phiếu bán hàng thành công!');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating:', error);
      console.error('Error response:', error.response?.data);
      alert(`Lỗi: ${error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật phiếu bán hàng'}`);
    }
  };
  if (!isVisible) return null;
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer({
      id: customer.id,
      name: customer.name,
      phone: customer.phone
    });
    setIsCustomerModalVisible(false);
  };

  // Thêm hàm tính tổng tiền
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const quantity = quantities[item.id] || 1;
      return total + (quantity * item.rawPrice);
    }, 0);
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
                              <div style={{ color: '#666' }}>SĐT: {selectedCustomer.phone}</div>
                              <div style={{ color: '#666' }}>Địa chỉ: {selectedCustomer.address}</div>
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
                <div className="cart-container" style={{
                  maxHeight: '400px',  // Giới hạn chiều cao tối đa
                  overflowY: 'auto',   // Thêm thanh cuộn dọc khi nội dung vượt quá
                  paddingRight: '10px', // Thêm padding để tránh nội dung bị che bởi thanh cuộn
                  marginBottom: '20px'  // Thêm khoảng cách với footer
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
                            <strong>{item.name}</strong>
                            <div style={{ color: "gray" }}>
                              Đơn giá: {item.price}
                            </div>
                            <div style={{ color: "blue" }}>
                              Thành tiền: {new Intl.NumberFormat('vi-VN').format(item.rawPrice * (quantities[item.id] || 1))} đ
                            </div>
                          </div>
                          <div style={{ 
                            marginRight: '15px',
                            padding: '4px 8px',
                            backgroundColor: '#e6f7ff',
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
                      ))}
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
                        
                        {/* Di chuyển modal-footer vào đây */}
                        <div className="modal-footer">
                          <button className="cancel-btn" onClick={onClose}>
                            Hủy
                          </button>
                          <button className="submit-btn" onClick={handleUpdateOrder}>
                            Cập nhật
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

export default EditOrderModal;
