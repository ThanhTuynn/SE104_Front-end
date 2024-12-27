import React, { useState, useEffect, useMemo } from "react";
import { Table, Button, Input, DatePicker, Space, Tag, Menu, Modal, Row, Col } from "antd";
import { ExportOutlined, DeleteOutlined, PlusOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import Topbar from "../../components/TopbarComponent/TopbarComponent";
import {
  DownOutlined,
} from "@ant-design/icons";
import "./ServicePage.css";
import serviceService from '../../services/serviceService';
const { Search } = Input;

// Add formatCurrency function
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount).replace('₫', 'VND');
};

const App1 = () => {
  const navigate = useNavigate();

  const handleAddService = () => {
    navigate('/add-service');
  };
  const [modalMode, setModalMode] = useState("add"); 
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [state, setState] = useState({
    filters: {
      orderType: "Tất cả",
      date: null,
      dateString: "",
      searchQuery: "",
    },
    selectedOrders: [],
    isModalVisible: false,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const [data, setData] = useState([]);
  const [totalPrepayment, setTotalPrepayment] = useState(0);
  const [searchValue, setSearchValue] = useState("");

  const onSearch = (value) => {
    setSearchValue(value);
  };

  useEffect(() => {
    const fetchServiceTickets = async () => {
      try {
        const serviceData = await serviceService.getAllServiceTickets();
        setData(serviceData);
      } catch (error) {
        console.error('Failed to fetch service tickets:', error);
        Modal.error({
          title: 'Lỗi',
          content: 'Không thể tải dữ liệu phiếu dịch vụ'
        });
      }
    };

    fetchServiceTickets();
  }, []);
  const menu = (
    <Menu>
      <Menu.Item key="1">Sắp xếp tên</Menu.Item>
      <Menu.Item key="2">Sắp xếp theo</Menu.Item>
      <Menu.Item key="3">Sắp xếp theo lượng tồn</Menu.Item>
    </Menu>
  );

  const menu1 = (
    <Menu>
      <Menu.Item key="1">Sắp xếp tăng dần</Menu.Item>
      <Menu.Item key="2">Sắp xếp giảm dần</Menu.Item>
    </Menu>
  );

  const menu2 = (
    <Menu>
      <Menu.Item key="1">Chờ Xác Nhận</Menu.Item>
      <Menu.Item key="2">Đã Xác Nhận</Menu.Item>
      <Menu.Item key="3">Đã Hủy</Menu.Item>
    </Menu>
  );
  const handleCheckboxChange = (key) => {
    const updatedData = data.map((item) =>
      item.key === key ? { ...item, checked: !item.checked } : item
    );
    setData(updatedData);
  };

  const handleRowClick = (record) => {
    const updatedData = data.map((item) =>
      item.key === record.key ? { ...item, expanded: !item.expanded } : item
    );
    setData(updatedData);
  };
  const navigate2 = useNavigate();

  const handleOpenEditModal2 = (record) => {
    navigate(`/adjust-service/${record.key}`);
  };
  const [selectedService, setSelectedService] = useState(null);
  const [isAddServiceModalVisible, setIsAddServiceModalVisible] = useState(false);

  const handleEditClick = (record) => {
    navigate(`/adjust-service/${record.key}`);
  };

  const columns = [
    {
      title: "Mã phiếu",
      dataIndex: "productCode",
      key: "productCode",
    },
    {
      title: "Ngày",
      dataIndex: "postedDate",
      key: "postedDate",
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Tổng tiền trả trước",
      dataIndex: "price-repay",
      key: "price-repay",
    },
    {
      title: "Tổng tiền",
      dataIndex: "price",
      key: "price",
    },
  ];

  const [selectedDeleteOrder, setSelectedDeleteOrder] = useState(null); // Lưu đơn hàng được chọn để xóa
  const handleDeleteClick = (order) => {
    setSelectedDeleteOrder(order); // Lưu đơn hàng được chọn để xóa
    handleChange("isModalVisible", true); // Hiển thị modal xác nhận
  };
  const handleOpenEditModal = (order) => {
    setModalMode("edit"); // Chế độ chỉnh sửa
    setSelectedOrder(order); // Lưu dữ liệu sản phẩm được chọn
    setIsModalVisible(true); // Mở modal
  };
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleViewDetails = (record) => {
    setSelectedOrder(record); // Lưu thông tin đơn hàng được chọn
    setIsModalVisible(true);  // Hiển thị modal
  };

  const handleCancel = () => {
    setIsModalVisible(false); // Đóng modal
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        orderType: tab
      }
    }));
  };

  const handleDateChange = (date, dateString, key) => {
    const updatedData = data.map((item) =>
      item.key === key ? { ...item, postedDate: dateString } : item
    );
    setData(updatedData);
  };
  const handleChange = (key, value) => {
    setState((prev) => {
      const updatedState = { ...prev };
      if (key in prev.filters) {
        updatedState.filters[key] = value;
      } else {
        updatedState[key] = value;
      }
      return updatedState;
    });
  };
  const filteredData = useMemo(() => {
    const lowerCaseSearch = searchValue.toLowerCase();
    return data.filter((item) =>
      item.productCode.toLowerCase().includes(lowerCaseSearch) ||
      item.postedDate.toLowerCase().includes(lowerCaseSearch) ||
      item.customer.toLowerCase().includes(lowerCaseSearch) ||
      item["price-repay"]?.toString().includes(searchValue) ||
      item.price?.toString().includes(searchValue)
    );
  }, [data, searchValue]);

  const handleDeleteConfirm = async () => {
    try {
      await serviceService.deleteServiceTicket(selectedDeleteOrder.key);
      const updatedData = data.filter((item) => item.key !== selectedDeleteOrder.key);
      setData(updatedData);
      handleChange("isModalVisible", false);
      setSelectedDeleteOrder(null);
      Modal.success({
        content: 'Xóa phiếu dịch vụ thành công'
      });
    } catch (error) {
      console.error('Failed to delete service ticket:', error);
      Modal.error({
        title: 'Lỗi',
        content: 'Không thể xóa phiếu dịch vụ'
      });
    }
  };
  const updateServiceStatus = (serviceDetail) => {
    const currentDate = new Date();
    const deliveryDate = serviceDetail.NgayGiao ? new Date(serviceDetail.NgayGiao) : null;
    
    return {
      ...serviceDetail,
      TinhTrang: deliveryDate && deliveryDate <= currentDate ? 'Đã giao' : 'Chưa giao'
    };
  };

  // Usage in component
  const handleStatusUpdate = () => {
    const updatedData = data.map(service => updateServiceStatus(service));
    setData(updatedData);
  };
  const handleConfirm = (selectedServices, totalPrepayment) => {
    const updatedData = [...data, ...selectedServices];
    setData(updatedData);
    setTotalPrepayment(totalPrepayment); // Update total prepayment state
    setIsModalVisible(false);
  };
  const tabs = ["Tất cả", "Hoàn thành", "Đang xử lý", "Chưa hoàn thành"];

  // Fix handleConfirmDelete implementation
  const handleConfirmDelete = async () => {
    if (!state.selectedOrders || state.selectedOrders.length === 0) {
      Modal.warning({
        title: 'Cảnh báo',
        content: 'Vui lòng chọn phiếu dịch vụ để xóa'
      });
      return;
    }

    try {
      await serviceService.deleteMultipleServiceTickets(state.selectedOrders);
      const remainingData = data.filter(
        (item) => !state.selectedOrders.includes(item.key)
      );
      setData(remainingData);
      setState((prev) => ({
        ...prev,
        selectedOrders: [],
        isModalVisible: false,
      }));
      Modal.success({
        content: 'Xóa các phiếu dịch vụ thành công'
      });
    } catch (error) {
      console.error('Failed to delete service tickets:', error);
      Modal.error({
        title: 'Lỗi',
        content: 'Không thể xóa các phiếu dịch vụ'
      });
    }
  };

    return (
    <div>
      <div style={{ marginLeft: "270px" }}>
        <Topbar title="Danh sách phiếu dịch vụ" />
      </div>

      <div className="order-table-container-sr">
        <header className="order-header">
          <div className="header-actions">
            <Input.Search
              placeholder="Tìm kiếm sản phẩm..."
                          onChange={(e) => setSearchValue(e.target.value)}
            />
            <Button
              type="primary"
              className="export-button"
              icon={<ExportOutlined />}
            >
              Xuất file
            </Button>
            <Button
              type="primary"
              className="add-product-button"
              icon={<PlusOutlined />}
              onClick={handleAddService}
            >
              Thêm dịch vụ
            </Button>
          </div>
        </header>

        <div className="filter-section">
          <div className="filter-button">
            {tabs.map((type) => (
              <Button
                key={type}
                onClick={() => handleTabClick(type)}
                className={`filter-btn ${activeTab === type ? "active" : ""}`}
              >
                {type}
              </Button>
            ))}
          </div>
          <DatePicker
            placeholder="Chọn ngày"
            onChange={handleDateChange}
            format="DD/MM/YYYY"
            className="date-picker"
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            disabled={state.selectedOrders.length === 0}
            onClick={() => handleChange("isModalVisible", true)}
            className="delete-all-button"
          >
            Xóa đã chọn
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="key"
          onRow={(record) => ({
            onClick: () => navigate(`/adjust-service/${record.key}`),
            style: { cursor: 'pointer' }
          })}
          rowSelection={{
            selectedRowKeys: state.selectedOrders,
            onChange: (selectedRowKeys) => handleChange("selectedOrders", selectedRowKeys),
          }}
          pagination={{ 
            pageSize: 5,
            position: ['bottomRight']
          }}
          scroll={{ x: 'max-content' }}
        />
        <Modal
          title="Xác nhận xóa"
          visible={state.isModalVisible} // Use 'visible' if you're using Ant Design v4.x
          // If using Ant Design v5.x, use 'open' instead:
          // open={state.isModalVisible}
          onOk={handleConfirmDelete}
          onCancel={() => handleChange("isModalVisible", false)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <p>Bạn có chắc chắn muốn xóa những phiếu dịch vụ đã chọn?</p>
        </Modal>
    </div>
  </div>
  );
}
export default App1;
