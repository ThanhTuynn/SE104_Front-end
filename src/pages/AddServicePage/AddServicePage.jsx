import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Layout, Menu, Input, Select, Button, Checkbox, Row, Col, Card, DatePicker, Modal } from "antd";
import { UserOutlined } from "@ant-design/icons";
import ServiceConfirmationModal from "../../components/Modal/Modal_xacnhan/Modal_xacnhan";
import ServiceModal from "../../components/Modal/Modal_timkiemdichvu/Modal_timkiemdichvu";
import CustomerSearchModal from "../../components/Modal/Modal_timkiemkhachhang/Modal_timkiemkhachhang";
import serviceService from "../../services/serviceService";
import "./AddServicePage.css";

const { Content } = Layout;
const { Option } = Select;

const AddServicePage = () => {
    const [data, setData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isCustomerSearchVisible, setIsCustomerSearchVisible] = useState(false);
    const [serviceTicketId, setServiceTicketId] = useState("");
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [totalPrepaid, setTotalPrepaid] = useState(0);
    const [deliveryDate, setDeliveryDate] = useState(null);
    const [totalPossiblePrepayment, setTotalPossiblePrepayment] = useState(0);
    const [serviceDeliveryDates, setServiceDeliveryDates] = useState({});
    const [invalidPrepayments, setInvalidPrepayments] = useState({});
    const navigate = useNavigate();

    const handleCancel = () => {
        setIsModalVisible(false);
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
            width: "15%",
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
                                <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
                                    Tối thiểu: {formatCurrency(minPrepayment)} ({record.pttr}%)
                                </div>
                                <Input
                                    type="number"
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
                    style={{ width: "100%" }}
                    onChange={(value) => {
                        const updatedData = data.map((item) =>
                            item.id === record.id ? { ...item, status: value } : item
                        );
                        setData(updatedData);
                    }}
                >
                    <Option value="Chưa giao">Chưa giao</Option>
                    <Option value="Đã giao">Đã giao</Option>
                </Select>
            ),
        },
    ];

    const rowSelection = {
        selectedRowKeys: selectedRows,
        onChange: (selectedRowKeys) => {
            setSelectedRows(selectedRowKeys);
        },
    };

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
                    MaLoaiDV: service.id, // Make sure to include MaLoaiDV
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

    const handleConfirmSave = async () => {
        try {
            // Validate required fields with more specific checks
            if (!serviceTicketId?.trim()) {
                Modal.error({
                    title: "Lỗi",
                    content: "Vui lòng nhập số phiếu dịch vụ",
                });
                return;
            }

            if (!selectedCustomer?.id) {
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

            const serviceData = {
                ticketData: {
                    SoPhieuDV: serviceTicketId.trim(),
                    MaKhachHang: selectedCustomer.id,
                    NgayLap: new Date().toISOString().split("T")[0],
                    TongTien: totalAmount,
                    TongTienTraTruoc: calculatedTraTruoc,
                    TinhTrang: "Chưa giao",
                },
                details: data.map((item) => ({
                    MaLoaiDV: item.id,
                    SoLuong: parseInt(item.quantity) || 1,
                    DonGiaDuocTinh: item.price.toString(),
                    ChiPhiRieng: (item.additionalCost || 0).toString(),
                    TraTruoc: item.prepayment.toString(),
                    ThanhTien: ((item.price + (item.additionalCost || 0)) * (item.quantity || 1)).toString(),
                    ConLai: (
                        (item.price + (item.additionalCost || 0)) * (item.quantity || 1) -
                        (item.prepayment || 0)
                    ).toString(),
                    NgayGiao: item.deliveryDate,
                    TinhTrang: "Chưa giao",
                })),
            };

            await serviceService.createServiceTicket(serviceData);

            Modal.success({
                title: "Thành công",
                content: "Đã lưu phiếu dịch vụ thành công",
                onOk: () => navigate("/list-service"),
            });
        } catch (error) {
            console.error("Error saving service ticket:", error);

            // Check if error message contains "đã tồn tại"
            if (error.message?.includes("đã tồn tại")) {
                Modal.error({
                    title: "Lỗi",
                    content: error.message,
                });
            } else {
                Modal.error({
                    title: "Lỗi",
                    content: error.message || "Không thể lưu phiếu dịch vụ",
                });
            }
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

    const handleDeliveryDateChange = (date, dateString) => {
        setDeliveryDate(date);
    };

    const handleBulkDelete = () => {
        const updatedData = data.filter((item) => !selectedRows.includes(item.id));
        setData(updatedData);
        setSelectedRows([]);

        const newTotalAmount = updatedData.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 1;
            return sum + price * quantity;
        }, 0);

        const newTotalQuantity = updatedData.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);

        setTotalAmount(newTotalAmount);
        setTotalQuantity(newTotalQuantity);
    };

    useEffect(() => {
        console.log("Modal state changed:", isModalVisible);
    }, [isModalVisible]);

    useEffect(() => {
        console.log("Updated selected customers:", selectedCustomers);
    }, [selectedCustomers]);

    const calculateTotals = (currentData) => {
        const newTotalAmount = currentData.reduce((sum, item) => {
            const basePrice = item.price + (item.additionalCost || 0);
            const quantity = item.quantity || 1;
            return sum + basePrice * quantity;
        }, 0);

        const newTotalPrepaid = currentData.reduce((sum, item) => {
            return sum + (item.prepayment || 0);
        }, 0);

        setTotalAmount(newTotalAmount);
        setTotalPrepaid(newTotalPrepaid);
    };

    useEffect(() => {
        const updatedData = data.map((item) => {
            const basePrice = Number(item.price) + Number(item.additionalCost || 0);
            const total = (item.quantity || 1) * basePrice;
            const minPrepayment = total * (item.pttr / 100); // Tối thiểu trả trước

            return {
                ...item,
                prepayment: Math.max(item.prepayment || 0, minPrepayment), // Cập nhật mặc định trả trước
            };
        });

        setData(updatedData); // Cập nhật dữ liệu mới
        calculateTotals(updatedData); // Tính toán lại tổng
    }, [data]); // Chạy khi dữ liệu thay đổi

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

    // const handleSaveService = async () => {
    //     try {
    //         if (!selectedCustomer) {
    //             Modal.warning({
    //                 title: "Thông báo",
    //                 content: "Vui lòng chọn khách hàng",
    //             });
    //             return;
    //         }

    //         if (data.length === 0) {
    //             Modal.warning({
    //                 title: "Thông báo",
    //                 content: "Vui lòng chọn ít nhất một dịch vụ",
    //             });
    //             return;
    //         }

    //         const invalidPrepayments = data.filter((item) => {
    //             const total =
    //                 (item.quantity || 1) * ((item.calculatedPrice || item.price) + (item.additionalCost || 0));
    //             const minPrepayment = total * (item.pttr / 100);
    //             return (item.prepayment || 0) < minPrepayment;
    //         });

    //         if (invalidPrepayments.length > 0) {
    //             Modal.error({
    //                 title: "Lỗi",
    //                 content: (
    //                     <div>
    //                         <p>Số tiền trả trước không đủ cho các dịch vụ sau:</p>
    //                         <ul>
    //                             {invalidPrepayments.map((item, index) => {
    //                                 const total =
    //                                     (item.quantity || 1) *
    //                                     ((item.calculatedPrice || item.price) + (item.additionalCost || 0));
    //                                 const minPrepayment = total * (item.pttr / 100);
    //                                 return (
    //                                     <li key={index}>
    //                                         {item.name}: cần trả trước tối thiểu {formatCurrency(minPrepayment)} (
    //                                         {item.pttr}%)
    //                                     </li>
    //                                 );
    //                             })}
    //                         </ul>
    //                     </div>
    //                 ),
    //             });
    //             return;
    //         }

    //         const serviceTicket = {
    //             MaKhachHang: selectedCustomer.id,
    //             NgayLap: new Date(),
    //             TongTien: totalAmount,
    //             TongTienTraTruoc: totalPrepaid,
    //             TinhTrang: "Chưa hoàn thành",
    //         };

    //         const details = data.map((item) => ({
    //             MaLoaiDichVu: item.id,
    //             SoLuong: item.quantity || 1,
    //             DonGiaDuocTinh: item.calculatedPrice || item.price,
    //             ChiPhiRieng: item.additionalCost || 0,
    //             TraTruoc: item.prepayment || 0,
    //             NgayGiao: item.deliveryDate,
    //             TinhTrang: "Chưa giao",
    //         }));

    //         await serviceService.createServiceTicket(serviceTicket, details);

    //         Modal.success({
    //             title: "Thành công",
    //             content: "Đã lưu phiếu dịch vụ thành công",
    //             onOk: () => navigate("/services"),
    //         });
    //     } catch (error) {
    //         Modal.error({
    //             title: "Lỗi",
    //             content: error.message,
    //         });
    //     }
    // };

    const handleSaveService = async () => {
        try {
            // Kiểm tra nếu chưa chọn khách hàng
            if (!selectedCustomer) {
                Modal.warning({
                    title: "Thông báo",
                    content: "Vui lòng chọn khách hàng",
                });
                return;
            }

            // Kiểm tra nếu chưa có dịch vụ nào
            if (data.length === 0) {
                Modal.warning({
                    title: "Thông báo",
                    content: "Vui lòng chọn ít nhất một dịch vụ",
                });
                return;
            }

            // Kiểm tra trả trước tối thiểu
            const invalidPrepayments = data.filter((item) => {
                const basePrice = Number(item.price) + Number(item.additionalCost || 0);
                const total = (item.quantity || 1) * basePrice; // Tổng tiền
                const minPrepayment = total * (item.pttr / 100); // Tối thiểu trả trước
                return (item.prepayment || 0) < minPrepayment; // Trả trước < tối thiểu
            });

            if (invalidPrepayments.length > 0) {
                Modal.error({
                    title: "Lỗi",
                    content: (
                        <div>
                            <p>Số tiền trả trước không đủ cho các dịch vụ sau:</p>
                            <ul>
                                {invalidPrepayments.map((item, index) => {
                                    const basePrice = Number(item.price) + Number(item.additionalCost || 0);
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

            const serviceData = {
                ticketData: {
                    SoPhieuDV: serviceTicketId,
                    MaKhachHang: selectedCustomer.id,
                    NgayLap: new Date().toISOString(),
                    TongTien: totalAmount,
                    TongTienTraTruoc: calculatedTraTruoc,
                    TinhTrang: "Chưa giao",
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

            // Chuẩn bị dữ liệu gửi lên API
            const serviceTicket = {
                customerId: selectedCustomer.id,
                issueDate: new Date(),
                totalAmount: totalAmount,
                totalPrepaid: totalPrepaid,
                status: "Chưa hoàn thành",
            };

            const details = data.map((item) => ({
                serviceId: item.id,
                quantity: item.quantity || 1,
                price: item.price,
                additionalCost: item.additionalCost || 0,
                prepayment: item.prepayment || 0,
                deliveryDate: item.deliveryDate,
                status: item.status || "Chưa giao",
            }));

            // Gọi API lưu phiếu dịch vụ
            const response = await serviceService.createServiceTicket(serviceTicket, details);

            if (response.success) {
                Modal.success({
                    title: "Thành công",
                    content: "Đã lưu phiếu dịch vụ thành công!",
                    onOk: () => navigate("/services"), // Chuyển hướng sau khi lưu
                });
            } else {
                throw new Error(response.message || "Lưu phiếu thất bại");
            }
        } catch (error) {
            Modal.error({
                title: "Lỗi",
                content: error.message || "Có lỗi xảy ra khi lưu phiếu",
            });
        }
    };

    const formatNumber = (value) => {
        return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    return (
        <Layout className="app-layout">
            <Layout>
                <Content className="app-content">
                    <div className="title-container">
                        <h1 className="title">Thông tin phiếu dịch vụ</h1>
                    </div>
                    <div className="header-actions">
                        <Button type="default" className="action-btnt" onClick={() => navigate("/list-service")}>
                            Hủy
                        </Button>
                        <Button type="primary" className="action-btnt" onClick={handleConfirmSave}>
                            Lưu tạo phiếu
                        </Button>
                    </div>

                    {/* Service Ticket Information Section */}
                    <div className="section">
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
                        <Row gutter={16} style={{ marginBottom: "16px" }}>
                            <Col span={24}>
                                <div style={{ marginBottom: "16px" }}>
                                    {selectedCustomer ? (
                                        <div>
                                            <p>Tên khách hàng: {selectedCustomer.name}</p>
                                            <p>Số điện thoại: {selectedCustomer.phone}</p>
                                        </div>
                                    ) : (
                                        <p>Chưa có thông tin khách hàng</p>
                                    )}
                                    <Button
                                        type="primary"
                                        onClick={handleCustomerSearch}
                                        style={{
                                            marginTop: "8px",
                                            borderRadius: "8px",
                                        }}
                                    >
                                        Tìm kiếm khách hàng
                                    </Button>
                                </div>
                            </Col>
                        </Row>

                        {/* Xóa hoặc thay đổi nút này nếu không cần thiết */}
                        {/* <Button
                            type="primary"
                            className="action-btnt"
                            onClick={() => setIsConfirmModalVisible(true)}
                        >
                            + Lưu tạo mới
                        </Button> */}
                    </div>

                    {/* Services Section */}
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
                            onClick={() => setIsModalVisible(true)} // Update this line
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
                                boxShadow: selectedRows.length > 0 ? "0 2px 6px rgba(248, 9, 9, 0.2)" : "none",
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

                    {/* Payment Section */}
                    {data.length > 0 && (
                        <div className="section">
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
                    <ServiceModal isVisible={isModalVisible} onCancel={handleCancel} onConfirm={handleConfirm} />

                    <CustomerSearchModal
                        isVisible={isCustomerSearchVisible}
                        onCancel={() => setIsCustomerSearchVisible(false)}
                        onConfirm={handleCustomerSelect}
                    />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AddServicePage;
