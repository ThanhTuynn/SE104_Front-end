import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import serviceService from "../../services/serviceService";
import { Table, Layout, Menu, Input, Select, Button, Checkbox, Row, Col, Card, Modal, DatePicker } from "antd";
import { UserOutlined } from "@ant-design/icons";
import ServiceConfirmationModal from "../../components/Modal/Modal_xacnhan/Modal_xacnhan";
import ServiceModal from "../../components/Modal/Modal_timkiemdichvu/Modal_timkiemdichvu";
import "./AdjustServicePage.css";
import { width } from "@fortawesome/free-solid-svg-icons/fa0";
import moment from "moment";

const { Sider, Content } = Layout;
const { TextArea } = Input;
const { Search } = Input;

const App = () => {
    const { id } = useParams(); // Get service ticket ID from URL
    const [loading, setLoading] = useState(true);
    const [serviceTicket, setServiceTicket] = useState(null);
    const [data, setData] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isPaid, setIsPaid] = useState(null); // null: chưa chọn, true: Đã thanh toán, false: Thanh toán sau
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
    const [totalQuantity, setTotalQuantity] = useState(0); // Tổng số lượng dịch vụ
    const [totalAmount, setTotalAmount] = useState(0); // Tổng tiền
    const [totalPrepaid, setTotalPrepaid] = useState(0);
    const [selectedCustomers, setSelectedCustomers] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [shippingFee, setShippingFee] = useState(0);
    const [services] = useState([
        { id: 1, name: "Dịch vụ kiểm định và định giá", price: 1000000 },
        { id: 2, name: "Thiết kế trang sức theo yêu cầu", price: 5000000 },
        { id: 3, name: "Tư vấn cá nhân hóa", price: 1000000 },
        { id: 4, name: "Dịch vụ bảo hành và đổi trả", price: 2000000 },
        { id: 5, name: "Chương trình khách hàng thân thiết", price: 5000000 },
    ]);

    // Calculate derived values
    const subTotal = totalAmount - discount;
    const vat = subTotal * 0.08; // 8% VAT
    const totalPayable = subTotal + shippingFee + vat;

    useEffect(() => {
        const fetchServiceTicket = async () => {
            try {
                setLoading(true);
                const ticketData = await serviceService.getServiceTicketById(id);

                // Set service ticket data
                setServiceTicket(ticketData.ticketInfo);

                // Set services data
                setData(ticketData.services);

                // Set customer data
                if (ticketData.ticketInfo.customer) {
                    setSelectedCustomer({
                        id: ticketData.ticketInfo.customer.MaKhachHang,
                        name: ticketData.ticketInfo.customer.TenKhachHang,
                        phone: ticketData.ticketInfo.customer.SoDT,
                        address: ticketData.ticketInfo.customer.DiaChi,
                    });
                }

                // Calculate totals
                const newTotalAmount = ticketData.services.reduce((sum, item) => sum + item.total, 0);
                setTotalAmount(newTotalAmount);
                setTotalQuantity(ticketData.services.length);
            } catch (error) {
                console.error("Failed to fetch service ticket:", error);
                Modal.error({
                    title: "Lỗi",
                    content: "Không thể tải thông tin phiếu dịch vụ",
                });
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchServiceTicket();
        }
    }, [id]);

    // Hàm xử lý khi nhấn vào nút "Đã thanh toán"
    const handlePaidClick = () => {
        setIsPaid(true);
    };

    const handlePayLaterClick = () => {
        setIsPaid(false);
    };

    const { Option } = Select;

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleConfirm = (selectedServices) => {
        console.log("Dịch vụ đã chọn:", selectedServices);
        const updatedData = [
            ...data,
            ...selectedServices.map((service) => ({
                ...service,
                total: service.price.toLocaleString() + " VND", // Tính tổng tiền cho từng dịch vụ
            })),
        ];

        const newTotalAmount = updatedData.reduce((sum, item) => {
            const totalValue = item.price ? parseInt(item.price, 10) : 0;
            return sum + totalValue;
        }, 0);

        setData(updatedData); // Cập nhật dữ liệu cho bảng
        setTotalAmount(newTotalAmount); // Cập nhật tổng tiền
        setTotalQuantity(updatedData.length); // Cập nhật số lượng dịch vụ
        setIsModalVisible(false); // Đóng modal
    };

    const customers = [
        { id: 1, name: "Nguyễn Văn A", phone: "0312456789" },
        { id: 2, name: "Trần Thị Ngọc B", phone: "0918276345" },
        { id: 3, name: "Văn Mây", phone: "0328345671" },
    ];

    const handleSearch = () => {
        const result = customers.filter((customer) => customer.name.toLowerCase().includes(searchValue.toLowerCase()));
        setFilteredCustomers(result);
        setIsCustomerModalVisible(true);
    };

    const handleDeleteService = (id) => {
        const updatedData = data.filter((service) => service.id !== id); // Filter out the service with the given ID
        setData(updatedData); // Update the state with the new data

        // Update total amount and quantity dynamically
        const newTotalAmount = updatedData.reduce((sum, item) => sum + (item.price || 0), 0);
        setTotalAmount(newTotalAmount);
        setTotalQuantity(updatedData.length);
    };

    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

    const handleConfirmSave = () => {
        // Add your save logic here
        console.log("Saving service...");
        setIsConfirmModalVisible(false);
    };

    const handleCancelSave = () => {
        setIsConfirmModalVisible(false);
    };

    const columns = [
        {
            title: "STT",
            dataIndex: "stt",
            key: "stt",
            width: "5%",
            align: "center",
            render: (_, __, index) => index + 1,
        },
        {
            title: "Loại dịch vụ",
            dataIndex: "name",
            key: "name",
            width: "15%",
            // Allow changing service type
            render: (_, record) => (
                <Select
                    value={record.name}
                    onChange={(value, option) => handleServiceTypeChange(record.id, value, option)}
                    style={{ width: '100%' }}
                >
                    {services.map(service => (
                        <Option key={service.id} value={service.name} data-price={service.price}>
                            {service.name}
                        </Option>
                    ))}
                </Select>
            ),
        },
        {
            title: "Đơn giá dịch vụ",
            dataIndex: "price",
            key: "price",
            width: "12%",
            render: (price) => formatCurrency(price),
        },
        // ...other columns with disabled inputs...
    ];

    // Add handler for service type change
    const handleServiceTypeChange = (recordId, newValue, option) => {
        const newPrice = option['data-price'];
        const updatedData = data.map(item => {
            if (item.id === recordId) {
                const newTotal = newPrice * (item.quantity || 1) + (item.additionalCost || 0);
                return {
                    ...item,
                    name: newValue,
                    price: newPrice,
                    total: newTotal,
                };
            }
            return item;
        });
        setData(updatedData);
        calculateTotals(updatedData);
    };

    const handleConfirm_cus = (customers) => {
        console.log("Selected customers:", customers);
        setSelectedCustomers(customers);
        setIsCustomerModalVisible(false);
    };

    const ServiceHeader = () => (
        <div style={{ marginBottom: 20 }}>
            <Row gutter={24}>
                <Col span={12}>
                    <Row>
                        <Col span={8}>Số phiếu:</Col>
                        <Col span={16}>{serviceTicket?.SoPhieuDV}</Col>
                    </Row>
                    <Row>
                        <Col span={8}>Khách hàng:</Col>
                        <Col span={16}>{selectedCustomer?.name}</Col>
                    </Row>
                </Col>
                <Col span={12}>
                    <Row>
                        <Col span={8}>Ngày lập:</Col>
                        <Col span={16}>{serviceTicket?.NgayLap}</Col>
                    </Row>
                    <Row>
                        <Col span={8}>Số điện thoại:</Col>
                        <Col span={16}>{selectedCustomer?.phone}</Col>
                    </Row>
                </Col>
            </Row>
            <Row style={{ marginTop: 10 }}>
                <Col span={8}>
                    <span>Tổng tiền: {totalAmount?.toLocaleString()} VND</span>
                </Col>
                <Col span={8}>
                    <span>Tổng tiền trả trước: {serviceTicket?.TongTienTraTruoc?.toLocaleString()} VND</span>
                </Col>
                <Col span={8}>
                    <span>
                        Tổng tiền còn lại: {(totalAmount - (serviceTicket?.TongTienTraTruoc || 0))?.toLocaleString()}{" "}
                        VND
                    </span>
                </Col>
            </Row>
        </div>
    );

    const handlePriceChange = (key, value) => {
        const newData = data.map((item) => {
            if (item.key === key) {
                const newPrice = parseFloat(value) || 0;
                const quantity = item.quantity || 0;
                const additionalCost = item.additionalCost || 0;
                const total = newPrice * quantity + additionalCost;
                return { ...item, price: newPrice, total };
            }
            return item;
        });
        setData(newData);
        updateTotals(newData);
    };

    const handleCalculatedPriceChange = (key, value) => {
        const newData = data.map((item) => {
            if (item.key === key) {
                const newCalculatedPrice = parseFloat(value) || 0;
                const quantity = item.quantity || 0;
                const additionalCost = item.additionalCost || 0;
                const total = newCalculatedPrice * quantity + additionalCost;
                return { ...item, calculatedPrice: newCalculatedPrice, total };
            }
            return item;
        });
        setData(newData);
        updateTotals(newData);
    };

    const handleQuantityChange = (key, value) => {
        const newData = data.map((item) => {
            if (item.key === key) {
                const newQuantity = parseInt(value) || 0;
                const price = item.price || 0;
                const additionalCost = item.additionalCost || 0;
                const total = price * newQuantity + additionalCost;
                return { ...item, quantity: newQuantity, total };
            }
            return item;
        });
        setData(newData);
        updateTotals(newData);
    };

    const handlePrepaidChange = (key, value) => {
        const newData = data.map((item) => {
            if (item.key === key) {
                const newPrepaid = parseFloat(value) || 0;
                const total = item.total || 0;
                const remaining = total - newPrepaid;
                return { ...item, prepaid: newPrepaid, remaining };
            }
            return item;
        });
        setData(newData);
        updateTotals(newData);
    };

    const handleAdditionalCostChange = (key, value) => {
        const newData = data.map((item) => {
            if (item.key === key) {
                const newAdditionalCost = parseFloat(value) || 0;
                const total = item.total || 0;
                const remaining = total - newAdditionalCost;
                return { ...item, additionalCost: newAdditionalCost, remaining };
            }
            return item;
        });
        setData(newData);
        updateTotals(newData);
    };

    const handleDeliveryDateChange = (key, date) => {
        const newData = data.map((item) => {
            if (item.key === key) {
                return { ...item, deliveryDate: date };
            }
            return item;
        });
        setData(newData);
        updateTotals(newData);
    };

    const handleStatusChange = (key, value) => {
        const newData = data.map((item) => {
            if (item.key === key) {
                return { ...item, status: value };
            }
            return item;
        });
        setData(newData);
        updateTotals(newData);
    };

    const updateTotals = (newData) => {
        const newTotalAmount = newData.reduce((sum, item) => sum + (item.total || 0), 0);
        const newTotalPrepaid = newData.reduce((sum, item) => sum + (item.prepaid || 0), 0);
        setTotalAmount(newTotalAmount);
        setTotalPrepaid(newTotalPrepaid);
    };

    // Add missing utility functions
    const formatCurrency = (amount) => {
        if (!amount) return '0 VND';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount).replace('₫', 'VND');
    };

    const calculateTotals = (currentData) => {
        if (!currentData?.length) return;

        const totals = currentData.reduce(
            (acc, item) => {
                const basePrice = parseFloat(item.price) || 0;
                const additionalCost = parseFloat(item.additionalCost) || 0;
                const quantity = parseInt(item.quantity) || 1;
                const prepayment = parseFloat(item.prepayment) || 0;

                acc.amount += (basePrice + additionalCost) * quantity;
                acc.prepaid += prepayment;
                acc.quantity += quantity;

                return acc;
            },
            { amount: 0, prepaid: 0, quantity: 0 }
        );

        setTotalAmount(totals.amount);
        setTotalPrepaid(totals.prepaid);
        setTotalQuantity(totals.quantity);
    };

    const formatDate = (date) => {
        if (!date) return '';
        return moment(date).format('DD/MM/YYYY');
    };

    const formatNumber = (value) => {
        if (!value) return '0';
        return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    return (
        <Layout className="app-layout-ser">
            <div className="bod">
                <Layout>
                    <Content className="app-content">
                        {/* Header section */}
                        <div className="title-container">
                            <h1 className="title">Điều chỉnh phiếu dịch vụ</h1>
                            {/* ...existing header content... */}
                        </div>

                        {/* Service Ticket Information Section */}
                        <div className="section" style={{
                            backgroundColor: "#f8f9ff",
                            padding: "20px",
                            borderRadius: "12px",
                            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                            border: "1px solid #e6e9f0",
                            marginBottom: "40px",
                            marginTop: "20px",
                        }}>
                            <h2>Thông tin phiếu</h2>
                            <Row gutter={16} style={{ marginBottom: "16px" }}>
                                <Col span={12}>
                                    <div style={{ marginBottom: "16px" }}>
                                        <label style={{ display: "block", marginBottom: "8px" }}>
                                            Số phiếu dịch vụ
                                        </label>
                                        <Input
                                            value={serviceTicket?.SoPhieuDV}
                                            disabled
                                            style={{
                                                width: "100%",
                                                height: "40px",
                                                borderRadius: "8px",
                                            }}
                                        />
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <div style={{ marginBottom: "16px" }}>
                                        <label style={{ display: "block", marginBottom: "8px" }}>Ngày lập</label>
                                        <Input
                                            value={formatDate(serviceTicket?.NgayLap)}
                                            disabled
                                            style={{
                                                width: "100%",
                                                height: "40px",
                                                borderRadius: "8px",
                                            }}
                                        />
                                    </div>
                                </Col>
                            </Row>

                            {/* Customer Information */}
                            <h3>Thông tin khách hàng</h3>
                            {selectedCustomer && (
                                <div style={{
                                    padding: "12px",
                                    border: "1px solid #e6e9f0",
                                    borderRadius: "8px",
                                    backgroundColor: "#fff",
                                }}>
                                    {/* ...existing customer display... */}
                                </div>
                            )}
                        </div>

                        {/* Services Section */}
                        <Row gutter={16} className="classification-status">
                            <Col span={24}>
                                <div className="section">
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
                                        onClick={showModal}
                                    >
                                        Chọn dịch vụ
                                    </Button>

                                    <Table
                                        dataSource={data}
                                        columns={columns}
                                        style={{
                                            backgroundColor: "#fff",
                                            borderRadius: "8px",
                                            overflow: "hidden",
                                        }}
                                        bordered
                                        pagination={false}
                                    />

                                    <Row
                                        style={{
                                            marginTop: "16px",
                                            fontWeight: "bold",
                                            padding: "12px",
                                            backgroundColor: "#fff",
                                            borderRadius: "8px",
                                            display: "flex",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <Col span={12}>Tổng số lượng dịch vụ: {totalQuantity}</Col>
                                        <Col span={12} style={{ textAlign: "right" }}>
                                            Tổng tiền: {totalAmount.toLocaleString()} VND
                                        </Col>
                                    </Row>
                                </div>
                            </Col>
                        </Row>

                        <ServiceModal
                            isVisible={isModalVisible}
                            onCancel={handleCancel}
                            onConfirm={handleConfirm}
                            services={services}
                        />

                        <div className="customer-section">
                            <h2>Khách hàng</h2>
                            {selectedCustomer && (
                                <Card>
                                    <Row align="middle">
                                        <Col span={2}>
                                            <UserOutlined />
                                        </Col>
                                        <Col span={18}>
                                            <div>
                                                <div>{selectedCustomer.name}</div>
                                                <div>{selectedCustomer.phone}</div>
                                                <div>{selectedCustomer.address}</div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card>
                            )}
                        </div>

                        <div className="payment-section">
                            <h2>Thanh toán</h2>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <div style={{ marginBottom: "16px" }}>
                                        <label>Ghi chú phiếu dịch vụ</label>
                                        <Input.TextArea
                                            placeholder="Nhập ghi chú dịch vụ tại đây"
                                            rows={4}
                                            style={{ marginTop: "8px" }}
                                        />
                                    </div>
                                </Col>

                                <Col span={12}>
                                    <Row justify="space-between">
                                        <Col span={12}>Số lượng dịch vụ</Col>
                                        <Col span={12} style={{ textAlign: "right" }}>
                                            {totalQuantity}
                                        </Col>
                                    </Row>
                                    <Row justify="space-between" style={{ marginTop: "8px" }}>
                                        <Col span={12}>Tổng tiền dịch vụ</Col>
                                        <Col span={12} style={{ textAlign: "right" }}>
                                            {totalAmount.toLocaleString()} VND
                                        </Col>
                                    </Row>
                                    <Row justify="space-between" style={{ marginTop: "8px" }}>
                                        <Col span={12}>Giảm giá</Col>
                                        <Col span={12} style={{ textAlign: "right" }}>
                                            -{discount.toLocaleString()} VND
                                        </Col>
                                    </Row>
                                    <Row justify="space-between" style={{ marginTop: "8px" }}>
                                        <Col span={12}>Tạm tính</Col>
                                        <Col span={12} style={{ textAlign: "right" }}>
                                            {subTotal.toLocaleString()} VND
                                        </Col>
                                    </Row>
                                    <Row justify="space-between" style={{ marginTop: "8px" }}>
                                        <Col span={12}>Phí vận chuyển</Col>
                                        <Col span={12} style={{ textAlign: "right" }}>
                                            {shippingFee.toLocaleString()} VND
                                        </Col>
                                    </Row>
                                    <Row justify="space-between" style={{ marginTop: "8px" }}>
                                        <Col span={12}>Thuế VAT (8%)</Col>
                                        <Col span={12} style={{ textAlign: "right" }}>
                                            {vat.toLocaleString()} VND
                                        </Col>
                                    </Row>
                                    <Row
                                        justify="space-between"
                                        style={{ marginTop: "8px", fontWeight: "bold" }}
                                    >
                                        <Col span={12} style={{ fontWeight: "bold" }}>
                                            Phải thu
                                        </Col>
                                        <Col span={12} style={{ textAlign: "right", fontWeight: "bold" }}>
                                            {totalPayable.toLocaleString()} VND
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                            <div className="invoice-checkbox-container">
                                <Checkbox />
                                <span className="invoice-checkbox-label">Yêu cầu xuất hóa đơn điện tử</span>
                            </div>
                            <Row justify="end" style={{ marginTop: "16px" }} gutter={16}>
                                <Col>
                                    <Button
                                        className={`payment-button ${isPaid === true ? "primary" : "default"}`}
                                        onClick={() => setIsPaid(isPaid === true ? null : true)} // Đổi trạng thái khi nhấn
                                    >
                                        Đã thanh toán
                                    </Button>
                                </Col>
                                <Col>
                                    <Button
                                        className={`payment-button ${isPaid === false ? "primary" : "default"}`}
                                        onClick={() => setIsPaid(isPaid === false ? null : false)} // Đổi trạng thái khi nhấn
                                    >
                                        Thanh toán sau
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    </Content>
                </Layout>
            </div>
        </Layout>
    );
};

export default App;
