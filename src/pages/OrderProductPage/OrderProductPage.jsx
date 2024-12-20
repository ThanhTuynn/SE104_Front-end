import React, { useState, useMemo } from "react";
import { Table, Button, Input, DatePicker, Space, Tag, Modal } from "antd";
import { ExportOutlined, DeleteOutlined, PlusOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/TopbarComponent/TopbarComponent";
import AddOrderModal from "../../components/Modal/Modal_phieubanhang/AddOrderModal";
import "./OrderProductPage.css";
import { width } from "@fortawesome/free-solid-svg-icons/fa0";

const initData = () => [
  {
    id: "1",
    products: {
      name: "Nhẫn Kim cương Vàng",
      otherProducts: [
        "Nhẫn Kim cương Bạc",
        "Nhẫn Kim cương Bạch Kim",
      ],
    },
    date: "29 Dec 2022",
    customer: "John Bushmill",
    total: "13,000,000",
    payment: "Mastercard",
    action: "Đang xử lý",
  },
  {
    id: "2",
    products: {
      name: "Nhẫn Kim cương Vàng",
      otherProducts: [
        "Nhẫn Kim cương Bạc",
        "Nhẫn Kim cương Bạch Kim",
      ],
    },
    date: "24 Dec 2022",
    customer: "Linda Blair",
    total: "10,000,000",
    payment: "Visa",
    action: "Đã hủy",
  },
  {
    id: "3",
    products: {
      name: "Nhẫn Kim cương Vàng",
      otherProducts: [],
    },
    date: "12 Dec 2022",
    customer: "M Karim",
    total: "5,000,000",
    payment: "Mastercard",
    action: "Đã giao",
  },
  {
    id: "4",
    products: {
      name: "Nhẫn Kim cương Vàng",
      otherProducts: [],
    },
    date: "12 Dec 2022",
    customer: "M Karim",
    total: "5,000,000",
    payment: "Mastercard",
    action: "Đã giao",
  },
  {
    id: "5",
    products: {
      name: "Nhẫn Kim cương Vàng",
      otherProducts: [],
    },
    date: "12 Dec 2022",
    customer: "M Karim",
    total: "5,000,000",
    payment: "Mastercard",
    action: "Đã hủy",
  },
];

const OrderProductPage = () => {
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();
  const [state, setState] = useState({
    filters: {
      orderType: "Tất cả đơn hàng",
      date: null,
      dateString: "",
      searchQuery: "",
    },
    selectedOrders: [],
    data: initData(),
    isModalVisible: false,
    isAddModalVisible: false,
  });
  const [isAddOrderModalVisible, setIsAddOrderModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [activeTab, setActiveTab] = useState("Tất cả đơn hàng");

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

  const handleTabClick = (tabName) => {
    console.log("Tab clicked:", tabName); // Debug log
    setActiveTab(tabName);
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        orderType: tabName
      }
    }));
  };

  const getAllValues = (obj) => {
    let allValues = [];
    const recursive = (obj) => {
      if (obj && typeof obj === 'object') {
        for (let key in obj) {
          recursive(obj[key]);
        }
      } else {
        allValues.push(String(obj).toLowerCase());
      }
    };
    recursive(obj);
    return allValues;
  };

  const filteredData = useMemo(() => {
    const { orderType, dateString } = state.filters;
    let dataToFilter = state.data;

    if (orderType !== "Tất cả đơn hàng" && orderType !== "Tất cả") {
      dataToFilter = dataToFilter.filter((item) => item.action === orderType);
    }

    if (dateString) {
      dataToFilter = dataToFilter.filter((item) => item.date.includes(dateString));
    }

    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
        dataToFilter = dataToFilter.filter((item) => {
        const allValues = getAllValues(item);
        return allValues.some((value) => value.includes(lowerSearchText));
      });
    }

    return dataToFilter;
  }, [state.data, state.filters, searchText]);

  const handleConfirmDelete = () => {
    const remainingOrders = state.data.filter(
      (order) => !state.selectedOrders.includes(order.id)
    );
    setState((prev) => ({
      ...prev,
      data: remainingOrders,
      selectedOrders: [],
      isModalVisible: false,
    }));
    alert("Đã xóa các đơn hàng đã chọn thành công");
  };

  const handleRowClick = (record) => {
    console.log("Navigating to order product detail with ID:", record.id);
    navigate(`/order-product-detail/${record.id}`);
  };

  const handleExpandRow = (record) => {
    console.log("Expanding row:", record);
    const isRowExpanded = expandedRowKeys.includes(record.id);
    setExpandedRowKeys(isRowExpanded 
      ? expandedRowKeys.filter((key) => key !== record.id) 
      : [...expandedRowKeys, record.id]);
  };

  const handleEditClick = (record) => {
    setSelectedProduct(record);
    setIsAddOrderModalVisible(true);
  };

  const handleMultiDelete = () => {
    handleChange("isModalVisible", true);
  };

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Hình thức",
      dataIndex: "payment",
      key: "payment",
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
    },
    {
      title: "Trạng thái",
      dataIndex: "action",
      key: "action",
      render: (status) => {
        
        let color = "";
        switch (status) {
          case "Đang xử lý":
            color = "red";
            break;
          case "Đã giao":
            color = "orange";
            break;
          case "Đã hủy":
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
        <Topbar title="Quản lý đơn hàng" />
      </div>

      <div className="orderproduct">
        <header className="order-header">
          <div className="header-actions">
            <Input.Search
              placeholder="Tìm kiếm đơn hàng..."
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
              onClick={() => setIsAddOrderModalVisible(true)}
            >
              Thêm đơn hàng
            </Button>
          </div>
        </header>

        <div className="filter-section">
          <div className="filter-button">
            {["Tất cả đơn hàng", "Đang xử lý", "Đã giao", "Đã hủy"].map((type) => (
              <Button
                key={type}
                onClick={() => handleTabClick(type)}
                className={`filter-btn ${
                  activeTab === type || 
                  (type === "Tất cả đơn hàng" && activeTab === "Tất cả") 
                    ? "active" 
                    : ""
                }`}
              >
                {type}
              </Button>
            ))}
          </div>
          <div className="filter-button">
            <DatePicker
              placeholder="Chọn ngày"
              onChange={(date, dateString) => {
                handleChange("date", date);
                handleChange("dateString", dateString);
              }}
              format="DD/MM/YYYY"
              value={state.filters.date}
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
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => handleEditClick(record),
            style: { cursor: 'pointer' }
          })}
          rowSelection={{
            selectedRowKeys: state.selectedOrders,
            onChange: (selectedRowKeys) =>
              handleChange("selectedOrders", selectedRowKeys),
          }}
          expandable={{
            expandedRowKeys,
            onExpand: (expanded, record) => handleExpandRow(record),
            expandedRowRender: (record) => (
              <div className="detail">
                {record.products.otherProducts.map((product, index) => (
                  <p key={index}>
                    {product}
                  </p>
                ))}
              </div>
            ),
            rowExpandable: (record) => record.products.otherProducts.length > 0,
            showExpandColumn: false,
            expandIcon: () => null
          }}
          pagination={{ pageSize: 5 }}
        />

        <Modal
          title="Xác nhận xóa"
          visible={state.isModalVisible}
          onOk={handleConfirmDelete}
          onCancel={() => handleChange("isModalVisible", false)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <p>Bạn có chắc chắn muốn xóa những đơn hàng đã chọn?</p>
        </Modal>

        <AddOrderModal
          isVisible={isAddOrderModalVisible}
          onClose={() => {
            setIsAddOrderModalVisible(false);
            setSelectedProduct(null);
          }}
          title={selectedProduct ? "Sửa đơn hàng" : "Thêm đơn hàng"}
          save={selectedProduct ? "Lưu thay đổi" : "Lưu"}
          product={selectedProduct}
        />
      </div>
    </div>
  );
};

export default OrderProductPage;
