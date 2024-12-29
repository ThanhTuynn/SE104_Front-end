import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import serviceService from "../../services/serviceService";
import { Table, Layout, Menu, Input, Select, Button, Checkbox, Row, Col, Card, Modal, DatePicker, message } from "antd";
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
    const navigate = useNavigate();
    const [invalidPrepayments, setInvalidPrepayments] = useState({});
    const [totalPossiblePrepayment, setTotalPossiblePrepayment] = useState(0);
    const [serviceDeliveryDates, setServiceDeliveryDates] = useState({});

    // Calculate derived values
    const subTotal = totalAmount - discount;
    const totalPayable = subTotal + shippingFee;

    // Add validatePrepayment function
    const validatePrepayment = (record, value) => {
        const basePrice = Number(record.price) + Number(record.additionalCost || 0);
        const total = (record.quantity || 1) * basePrice;
        const minPrepayment = total * (record.pttr / 100);
        return value >= minPrepayment;
    };

    useEffect(() => {
        const fetchServiceTicket = async () => {
            try {
                setLoading(true);
                const response = await serviceService.getServiceTicketById(id);
                
                if (!response || !response.serviceTicket || !response.serviceDetails) {
                    throw new Error('Invalid response data');
                }

                // Format ticket info
                const formattedTicketInfo = {
                    SoPhieuDV: response.serviceTicket.SoPhieuDV,
                    NgayLap: response.serviceTicket.NgayLap,
                    MaKhachHang: response.serviceTicket.MaKhachHang,
                    TongTien: response.serviceTicket.TongTien.toString(),
                    TongTienTraTruoc: response.serviceTicket.TongTienTraTruoc.toString(),
                    TinhTrang: response.serviceTicket.TinhTrang,
                    customer: {
                        TenKhachHang: response.serviceTicket.customer?.TenKhachHang,
                        SoDT: response.serviceTicket.customer?.SoDT,
                        DiaChi: response.serviceTicket.customer?.DiaChi
                    }
                };

                // Format services data
                const formattedServices = response.serviceDetails.map(detail => ({
                    id: detail.MaChiTietDV,
                    name: detail.TenLoaiDichVu,
                    price: parseFloat(detail.DonGiaDuocTinh),
                    quantity: parseInt(detail.SoLuong),
                    total: parseFloat(detail.ThanhTien),
                    prepaid: parseFloat(detail.TraTruoc),
                    additionalCost: parseFloat(detail.ChiPhiRieng || 0),
                    status: detail.TinhTrang,
                    deliveryDate: detail.NgayGiao,
                    pttr: parseFloat(detail.serviceType?.PhanTramTraTruoc) || 0,
                    serviceType: {
                        TenLoaiDichVu: detail.TenLoaiDichVu,
                        PhanTramTraTruoc: parseFloat(detail.serviceType?.PhanTramTraTruoc) || 0
                    }
                }));

                // Set state with formatted data
                setServiceTicket(formattedTicketInfo);
                setData(formattedServices);

                // Set customer info
                if (response.serviceTicket.customer) {
                    setSelectedCustomer({
                        id: response.serviceTicket.MaKhachHang,
                        name: response.serviceTicket.customer.TenKhachHang,
                        phone: response.serviceTicket.customer.SoDT,
                        address: response.serviceTicket.customer.DiaChi
                    });
                }

                // Calculate totals
                const totals = formattedServices.reduce(
                    (acc, item) => {
                        acc.amount += item.total;
                        acc.quantity += item.quantity;
                        acc.prepaid += item.prepaid;
                        return acc;
                    },
                    { amount: 0, quantity: 0, prepaid: 0 }
                );

                setTotalAmount(totals.amount);
                setTotalQuantity(totals.quantity);
                setTotalPrepaid(totals.prepaid);

                // Debug log
                console.log('Formatted data:', {
                    ticketInfo: formattedTicketInfo,
                    services: formattedServices
                });

            } catch (error) {
                console.error("Error fetching service ticket:", error);
                message.error("Không thể tải thông tin phiếu dịch vụ");
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

    const handleConfirm = (selectedServices, totalPrepayment, deliveryDates) => {
        console.log("Dịch vụ đã chọn:", selectedServices);
        const updatedData = [
            ...data,
            ...selectedServices.map((service) => {
                const basePrice = service.price;
                const quantity = service.quantity || 1;
                const total = basePrice * quantity;

                return {
                    ...service,
                    additionalCost: 0,
                    total: total,
                    prepayment: (total * service.pttr) / 100,
                    pttr: service.pttr
                };
            }),
        ];

        const newTotalAmount = updatedData.reduce((sum, item) => {
            const basePrice = parseFloat(item.price) || 0;
            const additionalCost = parseFloat(item.additionalCost) || 0;
            const quantity = parseInt(item.quantity) || 1;
            return sum + (basePrice + additionalCost) * quantity;
        }, 0);

        const newTotalQuantity = updatedData.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
        const newTotalPrepaid = totalPrepayment || 0;

        setData(updatedData);
        setTotalPossiblePrepayment(totalPrepayment);
        setServiceDeliveryDates(deliveryDates);
        setTotalAmount(newTotalAmount);
        setTotalQuantity(newTotalQuantity);
        setTotalPrepaid(newTotalPrepaid);
        setIsModalVisible(false);
    };

    const customers = [
        { id: 1, name: "Nguyễn Văn A", phone: "0312456789" },
        { id: 2, name: "Trần Thị Ngọc B", phone: "0918276345" },
        { id: 3, name: "Văn Mây", phone: "0328345671" },
    ];

    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

    const handleConfirmSave = async () => {
        try {
            // Format the data according to the required structure
            const updatedTicketData = {
                ticketData: {
                    // Format NgayLap to YYYY-MM-DD
                    NgayLap: moment(serviceTicket.NgayLap).format('YYYY-MM-DD'),
                    MaKhachHang: selectedCustomer?.id,
                    TinhTrang: serviceTicket.TinhTrang || "Chưa hoàn thành"
                },
                details: data.map(service => ({
                    MaChiTietDV: service.id,
                    MaLoaiDV: service.MaLoaiDV,
                    SoLuong: parseInt(service.quantity) || 1,
                    DonGiaDuocTinh: service.price.toString(),
                    TraTruoc: service.prepayment.toString(),
                    ChiPhiRieng: (service.additionalCost || 0).toString(),
                    TinhTrang: service.status || "Chưa giao",
                    NgayGiao: service.deliveryDate ? moment(service.deliveryDate).toISOString() : null
                }))
            };

            // Log the formatted data for debugging
            console.log('Formatted data for backend:', JSON.stringify(updatedTicketData, null, 2));

            // Call the API to update the service ticket
            await serviceService.updateServiceTicket(id, updatedTicketData);
            message.success('Cập nhật phiếu dịch vụ thành công');
            navigate('/list-service');
        } catch (error) {
            console.error('Update service ticket error:', error);
            message.error('Lỗi khi cập nhật phiếu dịch vụ: ' + (error.response?.data?.message || error.message));
        }
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
        },
        {
            title: "Đơn giá dịch vụ",
            dataIndex: "price",
            key: "price",
            width: "12%",
            render: (price) => formatCurrency(price),
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            width: "10%",
            render: (_, record) => (
                <Input
                    type="number"
                    defaultValue={record.quantity || 1}
                    onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        const updatedData = data.map((item) =>
                            item.id === record.id
                                ? {
                                      ...item,
                                      quantity: value,
                                      total: Number(value * (Number(item.price) + (Number(item.additionalCost) || 0))),
                                  }
                                : item
                        );
                        setData(updatedData);
                        calculateTotals(updatedData);
                    }}
                />
            ),
        },
        {
            title: "Chi phí riêng",
            dataIndex: "additionalCost",
            key: "additionalCost",
            width: "12%",
            render: (_, record) => (
                <Input
                    type="number"
                    defaultValue={record.additionalCost || 0}
                    onChange={(e) => {
                        const additionalCost = Math.round(Number(e.target.value) || 0);
                        const updatedData = data.map((item) => {
                            if (item.id === record.id) {
                                const basePrice = Math.round(Number(item.price) + additionalCost);
                                const quantity = item.quantity || 1;
                                const total = basePrice * quantity;

                                return {
                                    ...item,
                                    additionalCost: additionalCost,
                                    total: total,
                                };
                            }
                            return item;
                        });
                        setData(updatedData);
                        calculateTotals(updatedData);
                    }}
                    style={{ width: "100%" }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
            ),
        },
        {
            title: "Thành tiền",
            key: "total",
            width: "12%",
            render: (_, record) => {
                return formatCurrency(record.total || 0);
            },
        },
        {
            title: "Thanh toán",
            children: [
                {
                    title: "Trả trước",
                    dataIndex: "prepayment",
                    key: "prepayment",
                    width: "12%",
                    render: (_, record) => {
                        const total = record.total || 0;
                        const minPrepayment = (total * record.pttr) / 100;

                        return (
                            <div>
                                <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
                                    Tối thiểu: {formatCurrency(minPrepayment)} ({record.pttr}%)
                                </div>
                                <Input
                                    type="number"
                                    value={record.prepayment || 0}
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value) || 0;
                                        const isValid = value >= minPrepayment;

                                        setInvalidPrepayments((prev) => ({
                                            ...prev,
                                            [record.id]: !isValid,
                                        }));

                                        const updatedData = data.map((item) =>
                                            item.id === record.id
                                                ? {
                                                      ...item,
                                                      prepayment: value,
                                                      remaining: total - value,
                                                  }
                                                : item
                                        );
                                        setData(updatedData);
                                        calculateTotals(updatedData);
                                    }}
                                    style={{
                                        width: "100%",
                                        borderColor: invalidPrepayments[record.id] ? "#ff4d4f" : "#d9d9d9",
                                    }}
                                    status={invalidPrepayments[record.id] ? "error" : ""}
                                />
                                {invalidPrepayments[record.id] && (
                                    <div style={{ color: "#ff4d4f", fontSize: "12px", marginTop: "4px" }}>
                                        Số tiền trả trước phải lớn hơn hoặc bằng {record.pttr}% tổng tiền
                                    </div>
                                )}
                            </div>
                        );
                    },
                },
                {
                    title: "Còn lại",
                    dataIndex: "remaining",
                    key: "remaining",
                    width: "12%",
                    render: (_, record) => {
                        const basePrice = Number(record.price) + Number(record.additionalCost || 0);
                        const total = (record.quantity || 1) * basePrice;
                        return formatCurrency(total - (record.prepayment || 0));
                    },
                },
            ],
        },
        {
            title: "Ngày giao",
            dataIndex: "deliveryDate",
            key: "deliveryDate",
            width: "15%",
            render: (_, record) => (
                <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    onChange={(date) => {
                        const updatedData = data.map((item) =>
                            item.id === record.id ? { ...item, deliveryDate: date } : item
                        );
                        setData(updatedData);
                    }}
                />
            ),
        },
        {
            title: "Tình trạng",
            dataIndex: "status",
            key: "status",
            width: "10%",
            render: (_, record) => (
                <Select
                    defaultValue="Chưa giao"
                    style={{
                        width: "100%",
                        zIndex: 1000,
                    }}
                    dropdownStyle={{
                        zIndex: 1001,
                    }}
                    onChange={(value) => {
                        const updatedData = data.map((item) =>
                            item.id === record.id ? { ...item, status: value } : item
                        );
                        setData(updatedData);
                    }}
                    getPopupContainer={(trigger) => trigger.parentNode}
                >
                    <Option value="Chưa giao">Chưa giao</Option>
                    <Option value="Đã giao">Đã giao</Option>
                </Select>
            ),
        },
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
                    <span>Tổng tiền: {formatCurrency(totalAmount)}</span>
                </Col>
                <Col span={8}>
                    <span>Tổng tiền trả trước: {formatCurrency(serviceTicket?.TongTienTraTruoc)}</span>
                </Col>
                <Col span={8}>
                    <span>
                        Tổng tiền còn lại: {formatCurrency(totalAmount - (serviceTicket?.TongTienTraTruoc || 0))}
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
        if (!amount && amount !== 0) return '0 VND';
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

    // Thêm hàm tính toán số tiền tối thiểu cần trả
    const calculateMinimumPayment = () => {
        return data.reduce((total, service) => {
            const basePrice = Number(service.price) + Number(service.additionalCost || 0);
            const quantity = service.quantity || 1;
            const serviceTotal = basePrice * quantity;
            const minPrepayment = (serviceTotal * service.pttr) / 100;
            return total + minPrepayment;
        }, 0);
    };

    return (
        <Layout className="app-layout-adjust-servicessss">
            <div className="bod">
                <Layout>
                    <Content className="app-content">
                        <div className="title-container">
                            <h1 className="title">Điều chỉnh phiếu dịch vụ</h1>
                        </div>

                        {/* Thêm phần action buttons */}
                        <div className="header-actions" style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px',
                            marginBottom: '20px',
                            padding: '16px',
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}>
                            <Button 
                                onClick={() => navigate('/list-service')}
                                style={{
                                    width: '120px',
                                    height: '36px',
                                    borderRadius: '8px'
                                }}
                            >
                                Hủy
                            </Button>
                            <Button 
                                type="primary" 
                                onClick={() => setIsConfirmModalVisible(true)}
                                style={{
                                    width: '120px',
                                    height: '36px',
                                    backgroundColor: '#091057',
                                    borderColor: '#091057',
                                    borderRadius: '8px'
                                }}
                            >
                                Lưu thay đổi
                            </Button>
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
                                            value={serviceTicket?.NgayLap}
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
                                            Tổng tiền: {formatCurrency(totalAmount)}
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

                        <div className="payment-section" style={{
                            backgroundColor: "#f8f9ff",
                            padding: "24px",
                            borderRadius: "12px",
                            boxShadow: "0 2px 15px rgba(0, 0, 0, 0.1)",
                            border: "1px solid #e6e9f0",
                            marginTop: "20px"
                        }}>
                            <h2>Thanh toán</h2>
                            <Col span={24}>
                                <div style={{
                                    backgroundColor: "white",
                                    padding: "20px",
                                    borderRadius: "8px",
                                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)"
                                }}>
                                    <Row justify="space-between" className="payment-row">
                                        <Col span={12}>Số lượng dịch vụ</Col>
                                        <Col span={12} style={{ textAlign: "right", fontWeight: "500" }}>
                                            {totalQuantity}
                                        </Col>
                                    </Row>
                                    <Row justify="space-between" className="payment-row" style={{ marginTop: "12px" }}>
                                        <Col span={12}>Tổng tiền dịch vụ</Col>
                                        <Col span={12} style={{ textAlign: "right", fontWeight: "500" }}>
                                            {formatCurrency(totalAmount)}
                                        </Col>
                                    </Row>
                                    <Row justify="space-between" className="payment-row" style={{ marginTop: "12px" }}>
                                        <Col span={12}>Giảm giá</Col>
                                        <Col span={12} style={{ textAlign: "right", color: "#52c41a", fontWeight: "500" }}>
                                            -{formatCurrency(discount)}
                                        </Col>
                                    </Row>
                                    <Row justify="space-between" className="payment-row" style={{ marginTop: "12px" }}>
                                        <Col span={12}>Tạm tính</Col>
                                        <Col span={12} style={{ textAlign: "right", fontWeight: "500" }}>
                                            {formatCurrency(subTotal)}
                                        </Col>
                                    </Row>
                                    <Row justify="space-between" className="payment-row" style={{ marginTop: "12px" }}>
                                        <Col span={12}>Phí vận chuyển</Col>
                                        <Col span={12} style={{ textAlign: "right", fontWeight: "500" }}>
                                            {formatCurrency(shippingFee)}
                                        </Col>
                                    </Row>
                                    <div style={{
                                        marginTop: "16px",
                                        paddingTop: "16px",
                                        borderTop: "2px dashed #e8e8e8"
                                    }}>
                                        <Row justify="space-between" style={{ 
                                            fontWeight: "bold",
                                            fontSize: "16px",
                                            color: "#1890ff"
                                        }}>
                                            <Col span={12}>Phải thu</Col>
                                            <Col span={12} style={{ textAlign: "right" }}>
                                                {formatCurrency(totalPayable)}
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            </Col>
                        </div>

                        {/* Confirmation Modal */}
                        <Modal
                            title="Xác nhận lưu thay đổi"
                            visible={isConfirmModalVisible}
                            onOk={handleConfirmSave}
                            onCancel={handleCancelSave}
                            okText="Lưu"
                            cancelText="Hủy"
                            centered
                            okButtonProps={{
                                style: {
                                    backgroundColor: '#091057',
                                    borderColor: '#091057'
                                }
                            }}
                        >
                            <p>Bạn có chắc chắn muốn lưu những thay đổi này?</p>
                        </Modal>
                    </Content>
                </Layout>
            </div>
        </Layout>
    );
};

export default App;
