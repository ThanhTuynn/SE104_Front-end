import React, { useState, useEffect } from "react";
import { Select, Input, Button, Space, message } from "antd";
import { UserOutlined } from '@ant-design/icons';
import CustomerSearchModal from "../Modal_timkiemkhachhang/Modal_timkiemkhachhang";
import ProductSearchModal from "../Modal_timkiemsanpham/ProductSearchModal";
import "./AddOrderModal.css";
import axios from 'axios';
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
  const [deletedDetails, setDeletedDetails] = useState([]); // Add state to track deleted details
  
  // Load initial data when modal opens
  useEffect(() => {
    const fetchOrderData = async () => {
        if (initialData && isVisible) {
            try {
                // Lấy song song order, products và categories
                const [orderResponse, productsRes, categoriesRes] = await Promise.all([
                    getOrderById(initialData.SoPhieuBH),
                    axios.get('http://localhost:3000/api/product/get-all'),
                    axios.get('http://localhost:3000/api/category/get-all')
                ]);

                // Tạo map cho categories để lưu PhanTramLoiNhuan
                const categoryMap = {};
                categoriesRes.data.forEach(cat => {
                    categoryMap[cat.MaLoaiSanPham] = cat.PhanTramLoiNhuan;
                });

                // Map products với PhanTramLoiNhuan
                const productMap = {};
                productsRes.data.forEach(product => {
                    productMap[product.MaSanPham] = {
                        ...product,
                        PhanTramLoiNhuan: parseFloat(categoryMap[product.MaLoaiSanPham] || 0)
                    };
                });

                if (orderResponse) {
                    setOrderDate(new Date(orderResponse.NgayLap).toISOString().split('T')[0]);
                    setSelectedCustomer({
                        id: orderResponse.MaKhachHang,
                        name: orderResponse.customer.TenKhachHang,
                        phone: orderResponse.customer.SoDT,
                        address: orderResponse.customer.DiaChi
                    });

                    if (Array.isArray(orderResponse.details)) {
                        const cartItems = orderResponse.details.map(detail => {
                            const product = productMap[detail.MaSanPham];
                            return {
                                id: detail.MaSanPham,
                                name: product?.TenSanPham || `Sản phẩm ${detail.MaSanPham}`,
                                price: `${new Intl.NumberFormat('vi-VN').format(detail.DonGiaBanRa)} đ`,
                                rawPrice: detail.DonGiaBanRa,
                                PhanTramLoiNhuan: product?.PhanTramLoiNhuan || 0,
                                image: product?.HinhAnh || 'default-image-url',
                                quantity: detail.SoLuong,
                                MaChiTietBH: detail.MaChiTietBH
                            };
                        });

                        console.log('Processed cart items:', cartItems);
                        setCart(cartItems);

                        const initQuantities = {};
                        orderResponse.details.forEach(detail => {
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

// Sửa handleProductSelect để lưu PhanTramLoiNhuan và hiển thị hình ảnh đúng cách
const handleProductSelect = (product) => {
  if (cart.some((item) => item.id === product.id)) {
    setQuantities(prev => ({
      ...prev,
      [product.id]: (prev[product.id] || 1) + (product.quantity || 1)
    }));
  } else {
    const productWithPTLN = {
      ...product,
      PhanTramLoiNhuan: product.PhanTramLoiNhuan,
      image: product.HinhAnh || 'default-image-url' // Ensure image URL is set correctly
    };
    setCart(prevCart => [...prevCart, productWithPTLN]);
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

  // Update removeFromCart to track deleted details
  const removeFromCart = (productId) => {
    const productToRemove = cart.find(item => item.id === productId);
    if (productToRemove && productToRemove.MaChiTietBH) {
      setDeletedDetails(prev => [...prev, productToRemove]);
    }
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Format ngày tháng khi gửi lên server
  const formatDateForServer = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };

  // Add function to calculate selling price with profit margin
  const calculateSellingPrice = (basePrice, profitMargin) => {
    const margin = (profitMargin || 0) / 100;
    const finalPrice = basePrice * (1 + margin);
    return parseFloat(finalPrice.toFixed(2)); // Ensure 2 decimal places
  };

  // Add the single calculateTotal function
  const calculateTotal = () => {
    return parseFloat(cart.reduce((total, item) => {
      const quantity = quantities[item.id] || 1;
      const sellingPrice = calculateSellingPrice(item.rawPrice, item.PhanTramLoiNhuan);
      return total + (quantity * sellingPrice);
    }, 0).toFixed(2));
  };

// Update handleUpdateOrder function
const handleUpdateOrder = async () => {
  try {
    // Validate input data
    if (!selectedCustomer?.id) {
      message.error('Vui lòng chọn khách hàng');
      return;
    }

    if (!orderDate) {
      message.error('Vui lòng chọn ngày lập phiếu');
      return;
    }

    // Calculate total amount with proper decimal handling
    const total = calculateTotal();
    const totalAmount = parseFloat(total.toFixed(2));

    // Format data for backend
    const updateData = {
      updateDetails: [{
        NgayLap: formatDateForServer(orderDate),
        MaKH: selectedCustomer.id,
        TongTien: totalAmount // Send as number with 2 decimal places
      }],
      addDetails: cart.filter(item => !item.MaChiTietBH).map(item => {
        const sellingPrice = parseFloat(calculateSellingPrice(item.rawPrice, item.PhanTramLoiNhuan).toFixed(2));
        const quantity = quantities[item.id] || 1;
        const lineTotal = parseFloat((sellingPrice * quantity).toFixed(2));
        
        return {
          MaSanPham: item.id,
          SoLuong: quantity,
          DonGiaBanRa: sellingPrice,
          ThanhTien: lineTotal,
          HinhAnh: item.image || 'default-image.png'
        };
      }),
      deleteDetails: deletedDetails.map(item => ({
        MaChiTietBH: item.MaChiTietBH,
        MaSanPham: item.id,
        SoLuong: item.quantity
      }))
    };

    const loadingMessage = message.loading('Đang cập nhật đơn hàng...', 0);

    try {
      await updateOrder(initialData.SoPhieuBH, updateData);
      loadingMessage();
      message.success('Cập nhật phiếu bán hàng thành công!');
      onSave();
      onClose();
    } catch (error) {
      loadingMessage();
      console.error('Update error:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật phiếu bán hàng');
    }
  } catch (error) {
    console.error('Error in handleUpdateOrder:', error);
    message.error('Có lỗi xảy ra khi cập nhật phiếu bán hàng');
  }
};

// Add useEffect to handle cart updates
useEffect(() => {
    if (initialData?.details && Array.isArray(initialData.details)) {
        const cartItems = initialData.details.map(detail => ({
            id: detail.MaSanPham,
            name: detail.TenSanPham,
            image: detail.HinhAnh || 'default-image.png',
            price: `${new Intl.NumberFormat('vi-VN').format(detail.DonGiaBanRa)} đ`,
            rawPrice: detail.DonGiaBanRa,
            PhanTramLoiNhuan: detail.PhanTramLoiNhuan || 0,
            quantity: detail.SoLuong,
            MaChiTietBH: detail.MaChiTietBH
        }));

        setCart(cartItems);

        const initQuantities = {};
        initialData.details.forEach(detail => {
            initQuantities[detail.MaSanPham] = detail.SoLuong;
        });
        setQuantities(initQuantities);
    }
}, [initialData]);

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
                    <Input
                      type="date"
                      value={orderDate}
                      onChange={(e) => setOrderDate(e.target.value)}
                      style={{
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        width: "100%",
                        height: "40px",
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
                  style={{ width: "100%", marginTop: "-5px", borderRadius: '8px',height: '40px' }}
                >
                  Chọn sản phẩm
                </Button>
                <ProductSearchModal
                  isVisible={isProductModalVisible}
                  onCancel={() => setIsProductModalVisible(false)}
                  onConfirm={handleProductSelect}
                  cart={cart} // Pass the cart prop
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
                          {new Intl.NumberFormat('vi-VN', { 
                            style: 'currency', 
                            currency: 'VND' 
                          }).format(calculateTotal())}
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
