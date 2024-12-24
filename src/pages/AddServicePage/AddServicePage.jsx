import React, { useState, useEffect } from "react";
import ServiceConfirmationModal from "../../components/Modal/Modal_xacnhan/Modal_xacnhan";
import ServiceModal from "../../components/Modal/Modal_timkiemdichvu/Modal_timkiemdichvu"
import CustomerSearchModal from "../../components/Modal/Modal_timkiemkhachhang/Modal_timkiemkhachhang";
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
  DatePicker
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
  const [totalPossiblePrepayment, setTotalPossiblePrepayment] = useState(0); // Add new state for total prepayment
  const [isCustomerSearchVisible, setIsCustomerSearchVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(null); // Add new state for delivery date
  const [serviceDeliveryDates, setServiceDeliveryDates] = useState({});
  const [additionalCost, setAdditionalCost] = useState(0); // Add new state for additional cost

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const columns = [
    {
      title: <span style={{ fontSize: "14px" }}>Dịch vụ</span>,
      dataIndex: "name",
      key: "name",
      width: "15%",
      align: "left",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span className="title_1">{text}</span>
        </div>
      )      
    },
    {
      title: <span style={{ fontSize: "14px" }}>Số lượng</span>,
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      width: '10%',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span style={{ margin: '0 8px' }}>{record.quantity}</span>
        </div>
      )
    },
    {
      title: <span style={{ fontSize: "14px" }}>Trả trước</span>,
      key: "prepayment",
      width: "20%",
      render: (_, record) => (
        <Input
          type="number"
          placeholder="Nhập số tiền"
          defaultValue={record.prepaymentAmount || 0}
          style={{ width: '100%' }}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            const updatedData = data.map(item => 
              item.id === record.id 
                ? { ...item, prepaymentAmount: value }
                : item
            );
            setData(updatedData);
          }}

        />
      ),
    },
    {
      title: <span style={{ fontSize: "14px" }}>Chi phí riêng</span>,
      key: "additionalCost",
      width: "20%",
      render: (_, record) => (
        <Input
          type="number"
          placeholder="Nhập chi phí"
          defaultValue={record.additionalCost || 0}
          style={{ width: '100%' }}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            const updatedData = data.map(item => 
              item.id === record.id 
                ? { ...item, additionalCost: value }
                : item
            );
            setData(updatedData);
          }}
          onClick={e => e.stopPropagation()}
        />
      ),
    },
    {
      title: <span style={{ fontSize: "14px"}}>Thành tiền</span>,
      key: "totalAndAction",
      align: "left",
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
  const handleConfirm = (selectedServices, totalPrepayment, deliveryDates) => {
    const updatedData = [...data, ...selectedServices.map(service => ({
      ...service,
      total: formatCurrency(service.price * (service.quantity || 1))
    }))];
  
    // Calculate new totals
    const newTotalAmount = updatedData.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return sum + (price * quantity);
    }, 0);
  
    const newTotalQuantity = updatedData.reduce((sum, item) => 
      sum + (parseInt(item.quantity) || 1), 0
    );
  
    // Update state with new values
    setData(updatedData);
    setTotalPossiblePrepayment(totalPrepayment);
    setServiceDeliveryDates(deliveryDates);
    setTotalAmount(newTotalAmount);
    setTotalQuantity(newTotalQuantity);
    setIsModalVisible(false);
  };
  
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

  const handleCustomerSearch = () => {
    setIsCustomerSearchVisible(true);
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setIsCustomerSearchVisible(false);
  };

  const handleCustomerCancel = () => {
    setIsCustomerSearchVisible(false);
  };

  const handleDeliveryDateChange = (date, dateString) => {
    setDeliveryDate(date);
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
                  <Button
                    style={{
                      width: "200px",
                      marginLeft: "auto", // Add this to align right
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      backgroundColor: "#1890ff",
                      borderRadius: "8px",
                      boxShadow: "0 2px 6px rgba(248, 9, 9, 0.2)",
                    }}
                    onClick={onSearch22}
                  >
                    xóa dịch vụ
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
                    onClick={handleCustomerSearch}
                    style={{ 
                      borderRadius: "8px",
                      width: "200px",
                    }}
                  >
                    Tìm kiếm khách hàng
                  </Button>
                  <span style={{ marginLeft: "10px" }}>hoặc</span>
                  <a href="#" style={{ marginLeft: "10px", color: "#1890ff" }}>
                    + Tạo khách hàng mới
                  </a>
                </Col>
              </Row>

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
              {selectedCustomer && (
                <Card style={{ marginTop: "16px" }}>
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
                          {selectedCustomer.name}
                        </div>
                        <div style={{ color: "rgba(0, 0, 0, 0.45)" }}>
                          {selectedCustomer.phone}
                        </div>
                      </div>
                    </Col>
                    <Col span={4} style={{ textAlign: "right" }}>
                      <Button 
                        type="text" 
                        danger
                        onClick={() => setSelectedCustomer(null)}
                      >
                        Xóa
                      </Button>
                    </Col>
                  </Row>
                </Card>
              )}
              <CustomerSearchModal
                isVisible={isCustomerSearchVisible}
                onCancel={handleCustomerCancel}
                onConfirm={handleCustomerSelect}
              />
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
              {/* Cột thông tin thanh toán */}
              <Col span={24}>
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
              </Col>
          </div>
            )}
          </Content>
        </Layout>
      </div>
    </Layout>
  );
};

export default App;
