import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Table, Tag, Space, Input, DatePicker, Dropdown, Menu, Button, Modal, message } from "antd";
import { EditOutlined, EyeOutlined, DeleteOutlined, DownOutlined, PlusOutlined, ExportOutlined } from "@ant-design/icons";
import Topbar from "../../components/TopbarComponent/TopbarComponent";
import FilterBar from "../../components/FilterBar/FilterBar";
import DeleteConfirmationModal from "../../components/Modal/Modal_xacnhanxoa/Modal_xacnhanxoa";
import dayjs from "dayjs";
import "./ProductPage.css";
import { width } from "@fortawesome/free-solid-svg-icons/fa0";
import productService from '../../services/productService';
import axios from 'axios';

const { Search } = Input;

const ProductPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedDeleteOrder, setSelectedDeleteOrder] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleDeleteConfirm = async () => {
    try {
      await productService.deleteProduct(selectedDeleteOrder.key);
      message.success('Xóa sản phẩm thành công');
      fetchProducts(); // Refresh the list
      setIsDeleteModalVisible(false);
      setSelectedDeleteOrder(null);
    } catch (error) {
      message.error('Không thể xóa sản phẩm');
      console.error('Error deleting product:', error);
    }
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

  const handleConfirmDelete = async () => {
    try {
      await productService.deleteMultipleProducts(state.selectedProducts);
      message.success('Đã xóa các sản phẩm đã chọn');
      fetchProducts(); // Refresh the list
      setState(prev => ({
        ...prev,
        selectedProducts: [],
        isModalVisible: false
      }));
    } catch (error) {
      message.error('Không thể xóa các sản phẩm đã chọn');
      console.error('Error deleting products:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Update URL to match backend
      const response = await axios.get('http://localhost:3001/api/product/get-all');
      console.log('Raw API response:', response.data);
      
      if (!response.data) {
        throw new Error('No data received');
      }

      const formattedData = response.data.map(product => ({
        key: product.MaSanPham,
        productName: product.TenSanPham,
        productCode: product.MaSanPham,
        category: product.TenLoaiSanPham || 'Chưa phân loại',
        stock: product.SoLuong || 0,
        price: new Intl.NumberFormat('vi-VN', { 
          style: 'currency', 
          currency: 'VND' 
        }).format(product.DonGia || 0)
      }));
      
      setData(formattedData);
      setFilteredData(formattedData);
    } catch (error) {
      console.error('Fetch error details:', {
        message: error.message,
        status: error?.response?.status,
        url: error?.config?.url
      });
      message.error('Không thể tải dữ liệu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(); // Remove test connection and fetch directly
  }, []);

  const getProductStatus = (stock) => {
    if (stock <= 5) return "Tồn kho thấp";
    if (stock > 5) return "Đã đăng";
    return "Nháp";
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
      width: 150,
    },
    {
      title: "Lượng tồn",
      dataIndex: "stock",
      key: "stock",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
    }
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
          loading={loading}
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
            pageSize: 5,
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