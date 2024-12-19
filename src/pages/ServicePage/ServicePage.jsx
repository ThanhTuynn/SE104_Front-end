import React, { useState, useEffect, useMemo } from "react";
import { Table, Button, Input, DatePicker, Space, Tag, Menu } from "antd";
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
  });

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
      width: "15%",
    },
    {
      title: "Ngày",
      dataIndex: "postedDate",
      key: "postedDate",
      width: "13%",
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      width: "18%",
    },
    {
      title: "Thành tiền",
      dataIndex: "price",
      key: "price",
      width: "18%",
    },
    {
      title: "Trạng thái",
      dataIndex: "statuss",
      key: "statuss",
      width: "12%",
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
    {
      title: "Hành động",
      key: "action",
      width: "10%",
      render: (_, record) => (
        <Space size="middle">
          <EditOutlined
            style={{ color: "#1890ff", cursor: "pointer" }}
            onClick={() => handleOpenEditModal2(record)} // Mở modal chỉnh sửa
          />
          <DeleteOutlined
            style={{ color: "#ff4d4f", cursor: "pointer" }}
            onClick={() => handleDeleteClick(record)}
          />
        </Space>
      ),
    },
  ];
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false); // Hiển thị modal xóa
  const [selectedDeleteOrder, setSelectedDeleteOrder] = useState(null); // Lưu đơn hàng được chọn để xóa
  const handleDeleteClick = (order) => {
    setSelectedDeleteOrder(order); // Lưu đơn hàng được chọn để xóa
    setIsDeleteModalVisible(true); // Hiển thị modal xác nhận
  };
  const handleOpenEditModal = (order) => {
    setModalMode("edit"); // Chế độ chỉnh sửa
    setSelectedOrder(order); // Lưu dữ liệu sản phẩm được chọn
    setIsModalVisible(true); // Mở modal
  };
  const [isModalVisible, setIsModalVisible] = useState(false);
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
    setIsDeleteModalVisible(false); // Đóng modal
    setSelectedDeleteOrder(null); // Xóa thông tin đơn hàng đã chọn
  };
  const tabs = ["Tất cả", "Đã hủy", "Chưa giao hàng", "Đã hoàn tất"];
    return (
      <div className="sr">
      <div className="servicee">
        <div style={{ marginLeft: "270px" }}>
          <Topbar title="Danh sách phiếu dịch vụ" />
        </div>

        <div className="order-table-container1111">
          <header className="order-header">
            <div className="header-actions">
              <Input.Search
                placeholder="Tìm kiếm phiếu dịch vụ..."
                onSearch={onSearch}
                style={{ width: 800 }}
              />
              <Button
                className="export-button"
                icon={<ExportOutlined />}
              >
                Xuất file
              </Button>
              <Button
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
            <div className="filter-button">
              <DatePicker
                placeholder="Chọn ngày"
                onChange={handleDateChange}
                format="DD/MM/YYYY"
              />
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={!data.some(item => item.checked)}
                onClick={() => handleDeleteClick(data.find(item => item.checked))}
              >
                Xóa đã chọn
              </Button>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="key"
            expandable={{
              showExpandColumn: false,
              expandIcon: () => null
            }}
            rowSelection={{
              type: 'checkbox',
              onChange: (selectedRowKeys) => {
                const updatedData = data.map(item => ({
                  ...item,
                  checked: selectedRowKeys.includes(item.key)
                }));
                setData(updatedData);
              }
            }}
            pagination={{ 
              pageSize: 10,
              position: ['bottomRight']
            }}
            scroll={{ x: 'max-content' }}
          />

          <DeleteConfirmationModal
            isVisible={isDeleteModalVisible}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setIsDeleteModalVisible(false)}
            order={selectedDeleteOrder}
          />
        </div>
      </div>
    </div>
    );
}
export default App1;
