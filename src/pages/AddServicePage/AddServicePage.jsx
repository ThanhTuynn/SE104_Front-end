import React, { useState, useEffect } from "react";
import ServiceConfirmationModal from "../../components/Modal/Modal_xacnhan/Modal_xacnhan";
import ServiceModal from "../../components/Modal/Modal_timkiemdichvu/Modal_timkiemdichvu"
import CustomerModal from "../../components/Modal/Modal_timkiemkhachhang/Modal_timkiemkhachhang";
import {
  Table,
  Layout,
  Menu,
  Input,
  Select,
  Button,
  Checkbox,
  Row,
  Col,
  Card,
} from "antd";
import {
  UserOutlined,
} from "@ant-design/icons";
import "./AddServicePage.css";
const { Sider, Content } = Layout;
const { TextArea } = Input;
const { Search } = Input;
const App = () => {
  const [isPaid, setIsPaid] = useState(null); // null: chưa chọn, true: Đã thanh toán, false: Thanh toán sau
  const { Option } = Select;  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const columns = [
    {
      title: <span style={{ fontSize: "20px" }}>Dịch vụ</span>,
      dataIndex: "name",
      key: "name",
      align: "left",
      width: "50%",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={record.image || "https://via.placeholder.com/40"} // Sử dụng ảnh mặc định nếu không có `image`
            alt="Dịch vụ"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "4px",
              marginRight: "10px",
            }}
          />
          <span className="title_1">{text}</span>
        </div>
      )      
    },
    {
      title: <span style={{ fontSize: "20px" }}>Số lượng</span>,
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      width: '20%',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span style={{ margin: '0 8px' }}>{record.quantity}</span>
        </div>
      )
    },
    {
      title: <span style={{ fontSize: "20px"}}>Thành tiền</span>,
      key: "totalAndAction",
      align: "left",
      width: "40%",
      render: (text, record) => (
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          position: "relative",  // Add relative positioning
          width: "100%"         // Ensure full width
        }}>
          <span className="title_1">{record.total}</span>
          <Button
            type="text"
            danger
            onClick={() => handleDeleteService(record.id)}
            className="delete"
            style={{ 
              position: "absolute",  // Position absolutely
              right: "50px",           // Align to right edge
              top: "50%",           // Center vertically
              transform: "translateY(-50%)" // Perfect vertical centering
            }}
          >
            Xóa
          </Button>
        </div>
      ),
    }
  ];
  const onSearch22 = () => {
    setIsModalVisible(true);
  };
  const [totalQuantity, setTotalQuantity] = useState(0); // Tổng số lượng dịch vụ
  const [totalAmount, setTotalAmount] = useState(0); // Tổng tiền
  // Hàm xử lý khi xác nhận chọn dịch vụ từ modal
  const handleConfirm_cus = (customer) => {
    console.log("Selected customer:", customer);
    setSelectedCustomers([customer]); // Wrap single customer in array
    setIsCustomerModalVisible(false);
  };
  // Thêm hàm định dạng tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount).replace('₫', 'VND');
  };
  // Sửa lại hàm xử lý khi chọn dịch vụ
  const handleConfirm = (selectedServices) => {
    const updatedData = [...data, ...selectedServices.map(service => ({
      ...service,
      total: formatCurrency(service.price * (service.quantity || 1))
    }))];
  
    // Tính toán tổng số tiền dựa trên DonGiaDV từ LOAIDICHVU
    const newTotalAmount = updatedData.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return sum + (price * quantity);
    }, 0);
  
    const newTotalQuantity = updatedData.reduce((sum, item) => 
      sum + (parseInt(item.quantity) || 1), 0
    );
  
    setData(updatedData);
    setTotalAmount(newTotalAmount);
    setTotalQuantity(newTotalQuantity);
    setIsModalVisible(false);
  };
  const customers = [
    { id: 1, name: "Nguyễn Văn A", phone: "0312456789" },
    { id: 2, name: "Trần Thị Ngọc B", phone: "0918276345" },
    { id: 3, name: "Văn Mây", phone: "0328345671" },
  ];
  const handleSearch = () => {
    setIsCustomerModalVisible(true); // Chỉ cần mở modal
  };

  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
  const [data, setData] = useState([]); // Khởi tạo state cho danh sách dịch vụ
  const discount = 50000; // Example discount
  const shippingFee = 30000; // Example shipping fee
  const totalquantity = data.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
  const totalamount = data.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 1;
    return sum + (price * quantity);
  }, 0);
  // Tính PhanTramTraTruoc từ LOAIDICHVU
  const calculatedTraTruoc = data.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 1;
    const phanTramTraTruoc = item.phanTramTraTruoc || 0; // Từ database
    return sum + ((price * quantity) * (phanTramTraTruoc / 100));
  }, 0);
  // Tính toán các giá trị khác
  const subTotal = totalAmount;
  const vat = Math.round(subTotal * 0.08); // VAT 8%
  const totalPayable = subTotal + vat;
  const conLai = totalPayable - calculatedTraTruoc;
  // Function to handle deleting a service from the table
  const handleDeleteService = (id) => {
    const updatedData = data.filter((service) => service.id !== id);
    
    const newTotalAmount = updatedData.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return sum + (price * quantity);
    }, 0);
    
    const newTotalQuantity = updatedData.reduce((sum, item) => 
      sum + (parseInt(item.quantity) || 1), 0
    );
  
    setData(updatedData);
    setTotalAmount(newTotalAmount);
    setTotalQuantity(newTotalQuantity);
  };
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  const handleConfirmSave = () => {
    // Add your save logic here
    console.log('Saving service...');
    setIsConfirmModalVisible(false);
  };

  const handleCancelSave = () => {
    setIsConfirmModalVisible(false);
  };

  useEffect(() => {
    console.log('Modal state changed:', isModalVisible);
  }, [isModalVisible]);

  useEffect(() => {
    console.log('Updated selected customers:', selectedCustomers);
  }, [selectedCustomers]);

  return (
    <Layout className="app-layout-ser">
      {/* Sidebar */}
      <div className="bod">
        {/* Nội dung chính */}
        <Layout>
        <Content className="app-content">
            <div className="title-container">
                <h1 className="title">Thông tin phiếu dịch vụ</h1>
                  <img src="/bell.jpg" alt="Logo" className="logo-imag1" />
                  <img src="/girl.jpg" alt="Logo" className="logo-imag2" />
            </div>
            <div className="header-actions">
              <Button type="default" className="action-btnt">
                Hủy
              </Button>
              <Button type="primary" className="action-btnt" onClick={() => setIsConfirmModalVisible(true)} >
                + Lưu tạo mới
              </Button>
            </div>
            <ServiceConfirmationModal
              isVisible={isConfirmModalVisible}
              onConfirm={handleConfirmSave}
              onCancel={handleCancelSave}
              title="Xác nhận lưu"
              amount={totalPayable}
              content="Bạn có chắc chắn muốn lưu phiếu dịch vụ này không?"
            />
            <Row gutter={16} className="classification-status">
              <Col span={24}>
                <div className="section" style={{
                  backgroundColor: "#f8f9ff", // Light blue-gray background
                  padding: "20px",
                  borderRadius: "12px",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                  border: "1px solid #e6e9f0",
                  marginTop: "0px",
                  width: "100%",
                }}>
                  <h2>Dịch vụ đăng ký</h2>
                  <Button
                    type="primary"
                    style={{
                      width: "200px",
                      marginBottom: "20px",
                   
                      fontSize: "14px",
                      fontWeight: "500",
                      backgroundColor: "#1890ff",
                      borderRadius: "8px",
                      boxShadow: "0 2px 6px rgba(24, 144, 255, 0.2)",
                    }}
                    onClick={onSearch22}
                  >
                    Chọn dịch vụ
                  </Button>
                  <Table
                    dataSource={data}
                    columns={columns}
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      overflow: "hidden"
                    }}
                    bordered
                    pagination={false}
                  />
                  <Row style={{ 
                  marginTop: "16px", 
                  fontWeight: "bold",
                  padding: "12px",
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between"
                }}>
                  <Col span={12}>Tổng số lượng dịch vụ: {totalQuantity}</Col>
                  <Col span={12} style={{ textAlign: "right" }}>
                    Tổng tiền: {formatCurrency(totalAmount)}
                  </Col>
                </Row>
                </div>
              </Col>
            </Row>
            <ServiceModal
              isVisible={isModalVisible}  // Giữ nguyên tên prop để đồng nhất
              onCancel={handleCancel}
              onConfirm={handleConfirm}
            />
            {/* Thông tin chung */}
            <div 
              style={{
                backgroundColor: "#f8f9ff",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                border: "1px solid #e6e9f0",
                marginTop: "20px",
              }}
            >
              <h2>Khách hàng</h2>
              <Row gutter={16} align="middle" style={{ marginBottom: "16px" }}>
                <Col span={24} style={{ display: "flex", alignItems: "center" }}>
                  <Button
                    type="primary"
                    onClick={handleSearch}
                    style={{ 
                      borderRadius: "8px",
                      width: "200px",
                    }}
                  >
                    Tìm kiếm
                  </Button>
                  <span style={{ marginLeft: "10px" }}>hoặc</span>
                  <a href="#" style={{ marginLeft: "10px", color: "#1890ff" }}>
                    + Tạo khách hàng mới
                  </a>
                </Col>
              </Row>

              <CustomerModal
                isVisible={isCustomerModalVisible}
                onCancel={() => setIsCustomerModalVisible(false)}
                onConfirm={handleConfirm_cus}
                customers={customers}
              />

              {/* Hiển thị thông tin khách hàng đã chọn */}
              {selectedCustomers?.[0] && (
                <Card
                  style={{ 
                    marginTop: "16px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)"
                  }}
                >
                  <Row align="middle">
                    <Col span={2}>
                      <UserOutlined 
                        style={{
                          fontSize: "24px",
                          backgroundColor: "#1890ff",
                          padding: "8px",
                          borderRadius: "50%",
                          color: "white"
                        }}
                      />
                    </Col>
                    <Col span={18}>
                      <div style={{ marginLeft: "16px" }}>
                        <div style={{ fontSize: "16px", fontWeight: "500" }}>
                          {selectedCustomers[0].name}
                        </div>
                        <div style={{ color: "rgba(0, 0, 0, 0.45)" }}>
                          {selectedCustomers[0].phone}
                        </div>
                      </div>
                    </Col>
                    <Col span={4} style={{ textAlign: "right" }}>
                      <Button 
                        type="text" 
                        danger
                        onClick={() => setSelectedCustomers([])}
                      >
                        Xóa
                      </Button>
                    </Col>
                  </Row>
                </Card>
              )}
            </div>
            {data.length > 0 && (
            <div 
            style={{
              backgroundColor: "#f8f9ff",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
              border: "1px solid #e6e9f0",
              width: "1000px",
              marginTop: "20px",
            }}
          >
            <h2>Thanh toán</h2>
            <Row gutter={16}>
              {/* Cột ghi chú */}
              <Col span={12}>
                <div style={{ marginBottom: "16px" }}>
                  <label>Ghi chú phiếu dịch vụ</label>
                  <Input.TextArea
                    placeholder="Nhập ghi chú dịch vụ tại đây"
                    rows={10}
                    style={{ 
                      marginTop: "8px",
                      borderRadius: "8px"
                    }}
                  />
                </div>
              </Col>
          
              {/* Cột thông tin thanh toán */}
              <Col span={12}>
                <div style={{
                  backgroundColor: "#fff",
                  padding: "16px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)"
                }}>
                  <Row justify="space-between">
                    <Col span={12}>Số lượng dịch vụ</Col>
                    <Col span={12} style={{ textAlign: "right" }}>{totalquantity}</Col>
                  </Row>
                  <Row justify="space-between" style={{ marginTop: "8px" }}>
                    <Col span={12}>Tổng tiền dịch vụ</Col>
                    <Col span={12} style={{ textAlign: "right" }}>{formatCurrency(totalamount)}</Col>
                  </Row>
                  <Row justify="space-between" style={{ marginTop: "8px" }}>
                    <Col span={12}>Giảm giá</Col>
                    <Col span={12} style={{ textAlign: "right", color: "#ff4d4f" }}>-{formatCurrency(discount)}</Col>
                  </Row>
                  <Row justify="space-between" style={{ marginTop: "8px" }}>
                    <Col span={12}>Tạm tính</Col>
                    <Col span={12} style={{ textAlign: "right" }}>{formatCurrency(subTotal)}</Col>
                  </Row>
                  <Row justify="space-between" style={{ marginTop: "8px" }}>
                    <Col span={12}>Phí vận chuyển</Col>
                    <Col span={12} style={{ textAlign: "right" }}>{shippingFee.toLocaleString()} VND</Col>
                  </Row>
                  <Row justify="space-between" style={{ marginTop: "8px" }}>
                    <Col span={12}>Thuế VAT (8%)</Col>
                    <Col span={12} style={{ textAlign: "right" }}>{vat.toLocaleString()} VND</Col>
                  </Row>
                  <Row justify="space-between" style={{ 
                    marginTop: "16px", 
                    padding: "12px",
                    borderTop: "1px solid #e6e9f0",
                    fontWeight: "bold" 
                  }}>
                    <Col span={12}>Phải thu</Col>
                    <Col span={12} style={{ textAlign: "right" }}>{formatCurrency(totalPayable)}</Col>
                  </Row>
                </div>
          
                <div style={{ marginTop: "16px" }}>
                <Checkbox 
                      style={{ 
                        marginBottom: "16px",
                        display: "flex",
                        alignItems: "center",
                        padding: "4px 0" // Add padding to create vertical space
                      }}
                    >
                      <span style={{ 
                        marginLeft: "8px",
                        lineHeight: "20px", // Adjust line height to match checkbox height
                        display: "inline-block", // Ensure text behaves as a block
                        verticalAlign: "middle", // Align text vertically
                        marginTop: "5px"
                      }}>
                        Yêu cầu xuất hóa đơn điện tử
                      </span>
                    </Checkbox>
                  <Row justify="end" gutter={16}>
                    <Col>
                      <Button
                        className={`payment-button ${isPaid === true ? "primary" : "default"}`}
                        onClick={() => setIsPaid(isPaid === true ? null : true)}
                        style={{ borderRadius: "8px" }}
                      >
                        Đã thanh toán
                      </Button>
                    </Col>
                    <Col>
                      <Button
                        className={`payment-button ${isPaid === false ? "primary" : "default"}`}
                        onClick={() => setIsPaid(isPaid === false ? null : false)}
                        style={{ borderRadius: "8px" }}
                      >
                        Thanh toán sau
                      </Button>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          </div>
            )}
          </Content>
        </Layout>
      </div>
    </Layout>
  );
};

export default App;
