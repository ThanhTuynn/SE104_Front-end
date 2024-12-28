import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Layout, Menu, Input, Select, Button, Checkbox, Row, Col, Card, DatePicker, Modal, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import ServiceConfirmationModal from "../../components/Modal/Modal_xacnhan/Modal_xacnhan";
import ServiceModal from "../../components/Modal/Modal_timkiemdichvu/Modal_timkiemdichvu";
import CustomerSearchModal from "../../components/Modal/Modal_timkiemkhachhang/Modal_timkiemkhachhang";
import serviceService from "../../services/serviceService";
import "./AddServicePage.css";

const { Sider, Content } = Layout;
const { TextArea } = Input;
const { Search } = Input;

const App = () => {
    const [data, setData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [isPaid, setIsPaid] = useState(null);
    const { Option } = Select;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [totalPossiblePrepayment, setTotalPossiblePrepayment] = useState(0);
    const [isCustomerSearchVisible, setIsCustomerSearchVisible] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [deliveryDate, setDeliveryDate] = useState(null);
    const [serviceDeliveryDates, setServiceDeliveryDates] = useState({});
    const [additionalCost, setAdditionalCost] = useState(0);
    const [additionalCosts, setAdditionalCosts] = useState({});
    const [totalPrepaid, setTotalPrepaid] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [serviceTicketId, setServiceTicketId] = useState(""); // Add new state for manual ticket ID
    const [invalidPrepayments, setInvalidPrepayments] = useState({}); // Add new state for tracking invalid prepayments
    const navigate = useNavigate();

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const validatePrepayment = (record, value) => {
        const basePrice = Number(record.price) + Number(record.additionalCost || 0);
        const total = (record.quantity || 1) * basePrice;
        const minPrepayment = total * (record.pttr / 100);
        return value >= minPrepayment;
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
                        // console.log("updatedData", updatedData);
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
                                // console.log("additionalCost", additionalCost);

                                const basePrice = Math.round(Number(item.price) + additionalCost);
                                // console.log("basePrice", basePrice);
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
                        const basePrice = Number(record.price) + Number(record.additionalCost || 0);
                        const total = (record.quantity || 1) * basePrice;
                        const minPrepayment = total * (record.pttr / 100);

                        return (
                            <div>
                                <div
                                    style={{
                                        fontSize: "12px",
                                        color: "#666",
                                        marginBottom: "4px",
                                    }}
                                >
                                    Tối thiểu: {formatCurrency(minPrepayment)} ({record.pttr}%)
                                </div>
                                <Input
                                    type="number"
                                    value={record.prepayment || 0}
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value) || 0;
                                        const isValid = validatePrepayment(record, value);

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
                                    <div
                                        style={{
                                            color: "#ff4d4f",
                                            fontSize: "12px",
                                            marginTop: "4px",
                                        }}
                                    >
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
                        zIndex: 1000, // Add z-index to ensure dropdown shows above other elements
                    }}
                    dropdownStyle={{
                        zIndex: 1001, // Ensure dropdown menu appears above other elements
                    }}
                    onChange={(value) => {
                        const updatedData = data.map((item) =>
                            item.id === record.id ? { ...item, status: value } : item
                        );
                        setData(updatedData);
                    }}
                    getPopupContainer={(trigger) => trigger.parentNode} // This ensures the dropdown renders relative to its parent
                >
                    <Option value="Chưa giao">Chưa giao</Option>
                    <Option value="Đã giao">Đã giao</Option>
                </Select>
            ),
        },
    ];

    const onSearch22 = () => {
        setIsModalVisible(true);
    };

    const handleConfirm_cus = (customer) => {
        console.log("Selected customer:", customer);
        setSelectedCustomers([customer]);
        setIsCustomerModalVisible(false);
    };

    const formatCurrency = (amount) => {
        const formattedAmount = Math.round(amount);
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })
            .format(formattedAmount)
            .replace("₫", "VND");
    };

    const handleConfirm = (selectedServices, totalPrepayment, deliveryDates) => {
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

    const handleSearch = () => {
        setIsCustomerModalVisible(true);
    };

    const [selectedCustomers, setSelectedCustomers] = useState([]);
    const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
    const discount = 50000;
    const shippingFee = 30000;
    const totalquantity = data.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
    const totalamount = data.reduce((sum, item) => {
        const basePrice = parseFloat(item.price) || 0;
        const additionalCost = parseFloat(item.additionalCost) || 0;
        const quantity = parseInt(item.quantity) || 1;
        return sum + (basePrice + additionalCost) * quantity;
    }, 0);

    const calculatedTraTruoc = data.reduce((sum, item) => {
        const prepayment = parseFloat(item.prepayment) || 0; // Chuyển đổi giá trị sang số hoặc mặc định là 0
        return sum + prepayment;
    }, 0);

    // console.log("Tổng tiền trả trước:", calculatedTraTruoc);

    const subTotal = totalAmount;
    const totalPayable = subTotal;
    const conLai = totalPayable - calculatedTraTruoc;

    const handleDeleteService = (id) => {
        const updatedData = data.filter((service) => service.id !== id);

        const newTotalAmount = updatedData.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 1;
            return sum + price * quantity;
        }, 0);

        const newTotalQuantity = updatedData.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);

        setData(updatedData);
        setTotalAmount(newTotalAmount);
        setTotalQuantity(newTotalQuantity);
    };

    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

    const handleConfirmSave = async () => {
        try {
            // Validate required fields
            if (!serviceTicketId.trim()) {
                Modal.error({
                    title: "Lỗi",
                    content: "Vui lòng nhập số phiếu dịch vụ",
                });
                return;
            }

            if (!selectedCustomer) {
                Modal.error({
                    title: "Lỗi",
                    content: "Vui lòng chọn khách hàng",
                });
                return;
            }

            if (data.length === 0) {
                Modal.error({
                    title: "Lỗi",
                    content: "Vui lòng thêm ít nhất một dịch vụ",
                });
                return;
            }

            // Validate prepayments
            const invalidPrepayments = data.filter((item) => {
                const basePrice = (item.price || 0) + (item.additionalCost || 0);
                const total = (item.quantity || 1) * basePrice;
                const minPrepayment = total * (item.pttr / 100);
                return (item.prepayment || 0) < minPrepayment;
            });

            if (invalidPrepayments.length > 0) {
                Modal.error({
                    title: "Lỗi",
                    content: (
                        <div>
                            <p>Số tiền trả trước không đủ cho các dịch vụ sau:</p>
                            <ul>
                                {invalidPrepayments.map((item, index) => {
                                    const basePrice = (item.price || 0) + (item.additionalCost || 0);
                                    const total = (item.quantity || 1) * basePrice;
                                    const minPrepayment = total * (item.pttr / 100);
                                    return (
                                        <li key={index}>
                                            {item.name}: cần trả trước tối thiểu {formatCurrency(minPrepayment)} (
                                            {item.pttr}%)
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ),
                });
                return;
            }

            // Prepare service ticket data
            const serviceTicket = {
                SoPhieuDV: serviceTicketId,
                MaKhachHang: selectedCustomer.id,
                NgayLap: new Date(),
                TongTien: totalAmount,
                TongTienTraTruoc: calculatedTraTruoc,
                TinhTrang: "Chưa hoàn thành",
            };

            console.log(serviceTicket);

            // Prepare service details
            const details = data.map((item) => ({
                MaLoaiDV: item.id,
                SoLuong: item.quantity || 1,
                DonGiaDuocTinh: item.price,
                ChiPhiRieng: item.additionalCost || 0,
                TraTruoc: item.prepayment || 0,
                ThanhTien: (item.price + (item.additionalCost || 0)) * (item.quantity || 1),
                ConLai: (item.price + (item.additionalCost || 0)) * (item.quantity || 1) - (item.prepayment || 0),
                NgayGiao: item.deliveryDate,
                TinhTrang: "Chưa giao",
            }));

            console.log(details);

            // Call service to save
            await serviceService.createServiceTicket(serviceTicket, details);

            Modal.success({
                title: "Thành công",
                content: "Đã lưu phiếu dịch vụ thành công",
                onOk: () => navigate("/list-service"),
            });
        } catch (error) {
            console.error("Error saving service ticket:", error);
            Modal.error({
                title: "Lỗi",
                content: error.message || "Không thể lưu phiếu dịch vụ",
            });
        }
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

    const handleDeliveryDateChange = (serviceId, date) => {
        const updatedData = data.map((item) => (item.id === serviceId ? { ...item, deliveryDate: date } : item));
        updateData(updatedData);
    };

    const handleBulkDelete = () => {
        if (selectedRows.length === 0) {
            return;
        }

        Modal.confirm({
            title: "Xác nhận xóa",
            content: `Bạn có chắc chắn muốn xóa ${selectedRows.length} dịch vụ đã chọn?`,
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk() {
                const updatedData = data.filter((item) => !selectedRows.includes(item.id));
                setData(updatedData);
                setSelectedRows([]);
                calculateTotals(updatedData);
                message.success("Đã xóa các dịch vụ đã chọn");
            },
        });
    };

    useEffect(() => {
        if (data.length > 0) {
            const totals = calculateTotals(data);
            if (totals) {
                setTotalAmount(totals.amount);
                setTotalPrepaid(totals.prepaid);
                setTotalQuantity(totals.quantity);
            }
        }
    }, [data]); // Only recalculate when data changes

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

        return totals;
    };

    const updateData = (newData) => {
        setData(newData);
        const totals = calculateTotals(newData);
        if (totals) {
            setTotalAmount(totals.amount);
            setTotalPrepaid(totals.prepaid);
            setTotalQuantity(totals.quantity);
        }
    };

    const ServiceHeader = () => {
        const currentTotalPrepaid = totalPrepaid || 0;
        const currentTotalAmount = totalAmount || 0;

        return (
            <div style={{ marginBottom: 20 }}>
                <Row gutter={24}>
                    <Col span={12}>
                        <Row>
                            <Col span={8}>Số phiếu:</Col>
                            <Col span={16}>{/* Số phiếu tự động */}</Col>
                        </Row>
                        <Row>
                            <Col span={8}>Khách hàng:</Col>
                            <Col span={16}>{selectedCustomer?.name}</Col>
                        </Row>
                    </Col>
                    <Col span={12}>
                        <Row>
                            <Col span={8}>Ngày lập:</Col>
                            <Col span={16}>{new Date().toLocaleDateString()}</Col>
                        </Row>
                        <Row>
                            <Col span={8}>Số điện thoại:</Col>
                            <Col span={16}>{selectedCustomer?.phone}</Col>
                        </Row>
                    </Col>
                </Row>
                <Row style={{ marginTop: 10 }}>
                    <Col span={8}>
                        <span>Tổng tiền: {formatCurrency(currentTotalAmount)}</span>
                    </Col>
                    <Col span={8}>
                        <span>Tổng tiền trả trước: {formatCurrency(currentTotalPrepaid)}</span>
                    </Col>
                    <Col span={8}>
                        <span>Tổng tiền còn lại: {formatCurrency(currentTotalAmount - currentTotalPrepaid)}</span>
                    </Col>
                </Row>
            </div>
        );
    };

    const updateTotals = (updatedData) => {
        const newTotalAmount = updatedData.reduce((sum, item) => {
            const price = item.calculatedPrice || item.price;
            const quantity = item.quantity || 1;
            const additionalCost = item.additionalCost || 0;
            return sum + (price * quantity + additionalCost);
        }, 0);

        const newTotalPrepaid = updatedData.reduce((sum, item) => {
            return sum + (item.prepayment || 0);
        }, 0);

        setTotalAmount(newTotalAmount);
        setTotalPrepaid(newTotalPrepaid);
    };

    const formatNumber = (value) => {
        return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const handleSaveService = async () => {
        try {
            if (!serviceTicketId) {
                Modal.error({
                    title: "Lỗi",
                    content: "Vui lòng nhập mã phiếu dịch vụ",
                });
                return;
            }

            if (!selectedCustomer) {
                Modal.error({
                    title: "Lỗi",
                    content: "Vui lòng chọn khách hàng",
                });
                return;
            }

            // Check for invalid prepayments
            const hasInvalidPrepayments = Object.values(invalidPrepayments).some((invalid) => invalid);
            if (hasInvalidPrepayments) {
                Modal.error({
                    title: "Lỗi",
                    content: "Vui lòng kiểm tra lại số tiền trả trước của các dịch vụ",
                });
                return;
            }

            const serviceData = {
                ticketData: {
                    SoPhieuDV: serviceTicketId,
                    MaKhachHang: selectedCustomer.id,
                    NgayLap: new Date().toISOString(),
                    TongTien: totalAmount,
                    TongTienTraTruoc: calculatedTraTruoc,
                    TinhTrang: "Chưa hoàn thành",
                },
                details: data.map((item) => ({
                    MaLoaiDV: item.serviceId || item.id, // Make sure we're using the correct ID field
                    SoLuong: parseInt(item.quantity) || 1,
                    DonGiaDuocTinh: parseFloat(item.price) || 0,
                    ChiPhiRieng: parseFloat(item.additionalCost) || 0,
                    TraTruoc: parseFloat(item.prepayment) || 0,
                    ThanhTien:
                        (parseFloat(item.price) + (parseFloat(item.additionalCost) || 0)) *
                        (parseInt(item.quantity) || 1),
                    NgayGiao: item.deliveryDate || null,
                    TinhTrang: "Chưa giao",
                })),
            };

            console.log("Sending service data:", serviceData); // Add logging

            await serviceService.createServiceTicket(serviceData);

            Modal.success({
                title: "Thành công",
                content: "Đã lưu phiếu dịch vụ thành công",
                onOk: () => navigate("/services"),
            });
        } catch (error) {
            console.error("Error saving service:", error);
            Modal.error({
                title: "Lỗi",
                content: error.message || "Không thể lưu phiếu dịch vụ",
            });
        }
    };

    const rowSelection = {
        selectedRowKeys: selectedRows,
        onChange: (selectedRowKeys) => {
            setSelectedRows(selectedRowKeys);
        },
    };

    return (
        <Layout className="app-layout-ser">
            <div className="bod">
                <Layout>
                    <Content className="app-content">
                        {/* Header section */}
                        <div className="title-container">
                            <h1 className="title">Thông tin phiếu dịch vụ</h1>
                            <img src="/bell.jpg" alt="Logo" className="logo-imag1" />
                            <img src="/girl.jpg" alt="Logo" className="logo-imag2" />
                        </div>

                        {/* Action buttons */}
                        <div className="header-actions">
                            <Button type="default" className="action-btnt">
                                Hủy
                            </Button>
                            <Button type="primary" className="action-btnt" onClick={handleConfirmSave}>
                                Lưu tạo phiếu
                            </Button>
                        </div>

                        {/* Service Ticket ID Input */}
                        {/* <Row gutter={16} className="service-ticket-section" style={{ marginBottom: '20px' }}>
                            <Col span={24}>
                                <div className="section" style={{
                                    backgroundColor: "#f8f9ff",
                                    padding: "20px",
                                    borderRadius: "12px",
                                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                                    border: "1px solid #e6e9f0"
                                }}>
                                    <h2>Thông tin phiếu</h2>
                                    <Input
                                        placeholder="Nhập số phiếu dịch vụ"
                                        value={serviceTicketId}
                                        onChange={(e) => setServiceTicketId(e.target.value)}
                                        style={{ width: '300px' }}
                                    />
                                </div>
                            </Col>
                        </Row> */}

                        {/* Customer Section - Moved up */}
                        <div
                            className="section"
                            style={{
                                backgroundColor: "#f8f9ff",
                                padding: "20px",
                                borderRadius: "12px",
                                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                                border: "1px solid #e6e9f0",
                                marginBottom: "40px",
                                marginTop: "20px",
                            }}
                        >
                            <h2>Thông tin phiếu</h2>
                            <Row gutter={16} style={{ marginBottom: "16px" }}>
                                <Col span={12}>
                                    <div style={{ marginBottom: "16px" }}>
                                        <label style={{ display: "block", marginBottom: "8px" }}>
                                            Số phiếu dịch vụ <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <Input
                                            value={serviceTicketId}
                                            onChange={(e) => setServiceTicketId(e.target.value)}
                                            placeholder="Nhập số phiếu dịch vụ"
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
                                            value={new Date().toLocaleDateString()}
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

                            <h3>Thông tin khách hàng</h3>
                            <Button
                                type="primary"
                                onClick={handleCustomerSearch}
                                style={{
                                    height: "40px",
                                    borderRadius: "8px",
                                    marginBottom: selectedCustomer ? "16px" : "0",
                                }}
                            >
                                Tìm kiếm khách hàng
                            </Button>

                            <CustomerSearchModal
                                isVisible={isCustomerSearchVisible}
                                onCancel={handleCustomerCancel}
                                onConfirm={handleCustomerSelect}
                            />

                            {selectedCustomer && (
                                <div
                                    style={{
                                        padding: "12px",
                                        border: "1px solid #e6e9f0",
                                        borderRadius: "8px",
                                        backgroundColor: "#fff",
                                        marginTop: "12px",
                                    }}
                                >
                                    <Row gutter={16}>
                                        <Col span={24}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <UserOutlined style={{ fontSize: "24px" }} />
                                                <div>
                                                    <div style={{ fontWeight: "500" }}>{selectedCustomer.name}</div>
                                                    <div>{selectedCustomer.phone}</div>
                                                    <div>{selectedCustomer.address}</div>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            )}
                        </div>

                        {/* Services Section - Moved down */}
                        <Row gutter={16} className="classification-status">
                            <Col span={24}>
                                <div
                                    className="section"
                                    style={{
                                        backgroundColor: "#f8f9ff",
                                        padding: "20px",
                                        borderRadius: "12px",
                                        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                                        border: "1px solid #e6e9f0",
                                    }}
                                >
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
                                            marginLeft: "auto",
                                            display: "block",
                                            fontSize: "14px",
                                            fontWeight: "500",
                                            backgroundColor: selectedRows.length > 0 ? "#ff4d4f" : "#d9d9d9",
                                            color: selectedRows.length > 0 ? "#fff" : "rgba(0, 0, 0, 0.25)",
                                            borderRadius: "8px",
                                            boxShadow:
                                                selectedRows.length > 0 ? "0 2px 6px rgba(248, 9, 9, 0.2)" : "none",
                                            marginBottom: "10px",
                                        }}
                                        onClick={handleBulkDelete}
                                        disabled={selectedRows.length === 0}
                                    >
                                        Xóa dịch vụ ({selectedRows.length})
                                    </Button>
                                    <Table
                                        rowSelection={rowSelection}
                                        dataSource={data}
                                        columns={columns}
                                        rowKey="id"
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
                                            Tổng tiền: {formatCurrency(totalAmount)}
                                        </Col>
                                    </Row>
                                </div>
                            </Col>
                        </Row>
                        <ServiceModal isVisible={isModalVisible} onCancel={handleCancel} onConfirm={handleConfirm} />
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
                                <Col span={24}>
                                    <div
                                        style={{
                                            backgroundColor: "#fff",
                                            padding: "16px",
                                            borderRadius: "8px",
                                            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                                        }}
                                    >
                                        <Row justify="space-between">
                                            <Col span={12}>Số lượng dịch vụ</Col>
                                            <Col span={12} style={{ textAlign: "right" }}>
                                                {totalquantity}
                                            </Col>
                                        </Row>
                                        <Row justify="space-between" style={{ marginTop: "8px" }}>
                                            <Col span={12}>Tổng tiền dịch vụ</Col>
                                            <Col span={12} style={{ textAlign: "right" }}>
                                                {formatCurrency(totalamount)}
                                            </Col>
                                        </Row>
                                        <Row
                                            justify="space-between"
                                            style={{
                                                marginTop: "16px",
                                                padding: "12px",
                                                borderTop: "1px solid #e6e9f0",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            <Col span={12}>Trả trước</Col>
                                            <Col span={12} style={{ textAlign: "right" }}>
                                                {formatCurrency(calculatedTraTruoc)}
                                            </Col>
                                            <Col span={12}>Còn lại</Col>
                                            <Col span={12} style={{ textAlign: "right" }}>
                                                {formatCurrency(totalamount - calculatedTraTruoc)}
                                            </Col>
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
