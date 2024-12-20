import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { Table, Tag, Space, Input, DatePicker, Dropdown, Menu, Button, Modal } from "antd";
import { EditOutlined, EyeOutlined, DeleteOutlined, DownOutlined, PlusOutlined, ExportOutlined } from "@ant-design/icons";
import Topbar from "../../components/TopbarComponent/TopbarComponent";
import FilterBar from "../../components/FilterBar/FilterBar";
import DeleteConfirmationModal from "../../components/Modal/Modal_xacnhanxoa/Modal_xacnhanxoa";
import dayjs from "dayjs";
import "./ProductPage.css";

const { Search } = Input;

const ProductPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [data, setData] = useState([
    {
      key: "1",
      productName: "Nhẫn Kim cương Vàng",
      productCode: "123876",
      category: "3 phân loại",
      classification: "Nhẫn",
      stock: 2,
      price: "13.000.000",
      status: "Tồn kho thấp",
      postedDate: "29 Dec 2022",
      checked: true,
      expanded: false,
      image: "/kc_v.png",
      details: [
        { type: "Size 6", stock: 1 },
        { type: "Size 7", stock: 1 },
      ],
    },
    {
      key: "2",
      productName: "Nhẫn Kim cương Vàng",
      productCode: "123877",
      category: "3 phân loại",
      classification: "Nhẫn",
      stock: 120,
      price: "13.000.000",
      status: "Đã đăng",
      postedDate: "24 Dec 2022",
      checked: false,
      expanded: false,
      image: "/kc_v.png",
      details: [
        { type: "Size 8", stock: 50 },
        { type: "Size 9", stock: 70 },
      ],
    },
    {
      key: "3",
      productName: "Nhẫn Kim cương Vàng",
      productCode: "123878",
      category: "3 phân loại",
      classification: "Nhẫn",
      stock: 43,
      price: "13.000.000",
      status: "Nháp",
      postedDate: "12 Dec 2022",
      checked: false,
      expanded: false,
      image: "/kc_v.png",
      details: [
        { type: "Size 6", stock: 20 },
        { type: "Size 7", stock: 23 },
      ],
    },
  ]);
  const [filteredData, setFilteredData] = useState([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedDeleteOrder, setSelectedDeleteOrder] = useState(null);
  const [searchText, setSearchText] = useState('');

  const [state, setState] = useState({
    filters: {
      orderType: "Tất cả",
      date: null,
      dateString: "",
      searchQuery: "",
    },
    selectedProducts: [],
    isModalVisible: false,
  });

  const handleCreateProduct = () => {
    navigate('/add-product');
  };

  const handleExpandRow = (record) => {
    console.log("Expanding row:", record);
    const isRowExpanded = expandedRowKeys.includes(record.key);
    setExpandedRowKeys(isRowExpanded 
      ? expandedRowKeys.filter((key) => key !== record.key) 
      : [...expandedRowKeys, record.key]);
  };
  const handleEditProduct = (key) => {
    navigate(`/adjust-product/${key}`);
  };

  const handleDeleteClick = (product) => {
    setSelectedDeleteOrder({
      name: product.productName,
      key: product.key,
      code: product.productCode
    });
    setIsDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    const updatedData = data.filter((item) => item.key !== selectedDeleteOrder.key);
    setData(updatedData);
    setIsDeleteModalVisible(false);
    setSelectedDeleteOrder(null);
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
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

  const handleConfirmDelete = () => {
    const remainingProducts = data.filter(
      (item) => !state.selectedProducts.includes(item.key)
    );
    setData(remainingProducts);
    setState((prev) => ({
      ...prev,
      selectedProducts: [],
      isModalVisible: false,
    }));
    alert("Đã xóa sản phẩm đã chọn thành công");
  };

  useEffect(() => {
    let filtered = data;

    if (activeTab !== "Tất cả") {
      filtered = filtered.filter((item) => item.status === activeTab);
    }

    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(lowerSearchText)
        )
      );
    }

    setFilteredData(filtered);
  }, [data, activeTab, searchText]);

  useEffect(() => {
    setFilteredData(data);
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
      <Menu.Item key="1">Tồn kho thấp</Menu.Item>
      <Menu.Item key="2">Đã đăng</Menu.Item>
      <Menu.Item key="3">Nháp</Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      render: (text, record) => (
        <div 
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
          onClick={(e) => {
            e.stopPropagation();
            handleExpandRow(record);
          }}
        >
          <img
            src={record.image}
            alt={record.productName}
            style={{ width: 40, height: 40, objectFit: "cover" }}
          />
          <div>
            <strong>{text}</strong>
            <br />
            <div style={{ color: "#888", cursor: 'pointer' }}>
              {record.category} {record.details.length > 0 && <DownOutlined style={{ fontSize: '12px' }} />}
            </div>
          </div>
        </div>
      ),
    },
    { 
      title: "Mã Sản phẩm",
      dataIndex: "productCode",
      key: "productCode",
    },
    {
      title: "Phân loại",
      dataIndex: "classification",
      key: "classification",
    },
    {
      title: "Lượng tồn",
      dataIndex: "stock",
      key: "stock",
    },
    {
      title: ("Giá"
      ),
      dataIndex: "price",
      key: "price",
    },
    {
      title: ("Trạng thái"
      ),
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "";
        switch (status) {
          case "Tồn kho thấp":
            color = "red";
            break;
          case "Đã đăng":
            color = "orange";
            break;
          case "Nháp":
            color = "gray";
            break;
          default:
            color = "blue";
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <div>
      <div style={{ marginLeft: "270px" }}>
        <Topbar title="Quản lý sản phẩm" />
      </div>

      <div className="order-table-container1">
        <header className="order-header">
          <div className="header-actions">
            <Input.Search
              placeholder="Tìm kiếm sản phẩm..."
              onChange={(e) => setSearchText(e.target.value)}
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
              icon={<PlusOutlined />}
              className="add-product-button"
              onClick={handleCreateProduct}
            >
              Thêm sản phẩm
            </Button>
          </div>
        </header>

        <div className="filter-section">
          <div className="filter-button">
            {["Tất cả", "Đã đăng", "Tồn kho thấp", "Nháp"].map((type) => (
              <Button
                key={type}
                onClick={() => handleTabClick(type)}
                className={`filter-btn ${activeTab === type ? "active" : ""}`}
              >
                {type}
              </Button>
            ))}
          </div>
          <Button
            danger
            icon={<DeleteOutlined />}
            disabled={state.selectedProducts.length === 0}
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
          expandable={{
            expandedRowKeys,
            onExpand: (expanded, record) => handleExpandRow(record),
            expandedRowRender: (record) => (
              <div style={{ 
                padding: '10px 20px',
                marginLeft: '50px', // Indent the details
                borderLeft: '2px solid #f0f0f0'
              }}>
                <h4>Chi tiết phân loại:</h4>
                {record.details.map((detail, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '5px 20px',
                    backgroundColor: index % 2 ? '#f8f8f8' : 'white'
                  }}>
                    <span>{detail.type}</span>
                    <span>Số lượng: {detail.stock}</span>
                  </div>
                ))}
              </div>
            ),
            rowExpandable: (record) => record.details.length > 0,
            showExpandColumn: false,
            expandIcon: () => null
          }}
          pagination={{ 
            pageSize: 10,
            position: ['bottomRight'],
          }}
          rowSelection={{
            selectedRowKeys: state.selectedProducts,
            onChange: (selectedRowKeys) =>
              handleChange("selectedProducts", selectedRowKeys),
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/adjust-product/${record.key}`),
            style: { cursor: 'pointer' }
          })}
        />

        <DeleteConfirmationModal
          isVisible={isDeleteModalVisible}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setIsDeleteModalVisible(false)}
          message={`Bạn có chắc chắn muốn xóa sản phẩm ${selectedDeleteOrder?.name} có mã sản phẩm là ${selectedDeleteOrder?.code} không?`}
        />

        <Modal
          title="Xác nhận xóa"
          visible={state.isModalVisible}
          onOk={handleConfirmDelete}
          onCancel={() => handleChange("isModalVisible", false)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <p>Bạn có chắc chắn muốn xóa những sản phẩm đã chọn?</p>
        </Modal>
      </div>
    </div>
  );
};

export default ProductPage;