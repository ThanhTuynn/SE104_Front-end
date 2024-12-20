import React, { useState, useEffect, useMemo } from "react";
import { Table, Button, Input, DatePicker, Space, Tag, Menu, Modal } from "antd";
import { ExportOutlined, DeleteOutlined, PlusOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import Topbar from "../../components/TopbarComponent/TopbarComponent";
import DeleteConfirmationModal from "../../components/Modal/Modal_xacnhanxoa/Modal_xacnhanxoa";
import Header from "../../components/Header/Header";
import FilterBar from "../../components/FilterBar/FilterBar";
import {
  DownOutlined,
} from "@ant-design/icons";
import "./ServicePage.css";
const { Search } = Input;
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

  const [data, setData] = useState([
    {
      key: "1",
      productCode: "123876",
      serviceName: "Sửa chữa điện thoại",
      postedDate: "29 Dec 2022",
      price: "13.000.000",
      customer: "bao",
      statuss: "Chưa giao hàng",
      checked: true,
    },
    {
      key: "2",
      productCode: "123878",
      serviceName: "Thay pin laptop",
      postedDate: "30 Dec 2022",
      price: "12.000.000", 
      customer: "minh",
      statuss: "Đã hủy",
      checked: true,
    },
    {
      key: "3",
      productCode: "1238769",
      serviceName: "Vệ sinh máy tính",
      postedDate: "22 Dec 2022",
      price: "1.000.000.000.000 VNĐ",
      customer: "Nguyễn Phương Hằng",
      statuss: "Đã hoàn tất",
      checked: true,
    },
  ]);
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
      title: "Dịch vụ",
      dataIndex: "serviceName",
      key: "serviceName",
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
      title: "Thành tiền",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Trạng thái",
      dataIndex: "statuss",
      key: "statuss",
      render: (statuss) => {
        let color;
        switch (statuss) {
          case "Chưa giao hàng":
            color = "orange";
            break;
          case "Đã hoàn tất":
            color = "green";
            break;
          case "Đã hủy":
            color = "red";
            break;
          default:
            color = "blue";
        }
        return <Tag color={color}>{statuss}</Tag>;
      },
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
  const onSearch = (value) => {
    console.log("Tìm kiếm:", value);
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
    const { orderType, dateString, searchQuery } = state.filters;

    return data.filter((item) => {
      const matchesSearchQuery = 
        searchQuery === "" || 
        item.productCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customer.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesOrderType = 
        orderType === "Tất cả" || 
        item.statuss === orderType;

      const matchesDate = !dateString || item.postedDate.includes(dateString);

      return matchesSearchQuery && matchesOrderType && matchesDate;
    });
  }, [data, state.filters]);

  const handleDeleteConfirm = () => {
    const updatedData = data.filter((item) => item.key !== selectedDeleteOrder.key); // Lọc bỏ đơn hàng được chọn
    setData(updatedData); // Cập nhật danh sách
    handleChange("isModalVisible", false); // Đóng modal
    setSelectedDeleteOrder(null); // Xóa thông tin đơn hàng đã chọn
  };
  const handleMultiDelete = () => {
    handleChange("isModalVisible", true);
  };
  const handleConfirmDelete = () => {
    const remainingData = data.filter(
      (item) => !state.selectedOrders.includes(item.key)
    );
    setData(remainingData);
    setState((prev) => ({
      ...prev,
      selectedOrders: [],
      isModalVisible: false,
    }));
  };
  const tabs = ["Tất cả", "Đã hủy", "Chưa giao hàng", "Đã hoàn tất"];
    return (
    <div>
      <div style={{ marginLeft: "270px" }}>
        <Topbar title="Danh sách phiếu dịch vụ" />
      </div>

      <div className="order-table-container-sr">
        <header className="order-header">
          <div className="header-actions">
            <Input.Search
              placeholder="Tìm kiếm phiếu dịch vụ..."
              onSearch={onSearch}
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
            pageSize: 10,
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
