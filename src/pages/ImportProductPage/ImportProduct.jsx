import React, { useState, useMemo } from "react";
import { Table, Button, Input, DatePicker, Modal, Tag } from "antd";
import { ExportOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/TopbarComponent/TopbarComponent";
import "./ImportProduct.css";
import { width } from "@fortawesome/free-solid-svg-icons/fa0";

const initData = () => [
  {
    id: "1",
    products: {
      name: "Dầu gội trị viêm da cho thú cưng",
      otherProducts: [
        "Dầu dưỡng trị viêm da cho thú cưng",
        "Dầu gội trị viêm nấm cho thú cưng",
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
      name: "Vòng Tay Kim Cương",
      otherProducts: [
        "Dầu dưỡng trị viêm da cho thú cưng",
        "Dầu gội trị viêm nấm cho thú cưng",
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
      name: "Lắc Tay Bạc",
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
      name: "Lắc Tay Bạc",
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
      name: "Lắc Tay Bạc",
      otherProducts: [],
    },
    date: "12 Dec 2022",
    customer: "M Karim",
    total: "5,000,000",
    payment: "Mastercard",
    action: "Đã hủy",
  },
];

const ImportProduct = () => {
  const navigate = useNavigate();
  const [state, setState] = useState({
    filters: {
      orderType: "Tất cả phiếu mua hàng",
      date: null,
      dateString: "",
      searchQuery: "",
    },
    selectedOrders: [],
    data: initData(),
    isModalVisible: false,
    isAddModalVisible: false, // Thêm trạng thái cho modal "Thêm sản phẩm"
  });

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
    
    return state.data.filter((item) => {
      // Search filter
      const searchMatch = 
        searchQuery === "" || 
        item.products.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customer.toLowerCase().includes(searchQuery.toLowerCase());

      // Order type filter - use exact string comparison
      let orderTypeMatch = true;
      if (orderType !== "Tất cả phiếu mua hàng") {
        orderTypeMatch = item.action === orderType;
      }

      // Date filter
      const dateMatch = !dateString || item.date.includes(dateString);

      // For debugging
      console.log({
        item: item.id,
        orderType,
        itemAction: item.action,
        orderTypeMatch,
        searchMatch,
        dateMatch
      });

      return searchMatch && orderTypeMatch && dateMatch;
    });
  }, [state.data, state.filters]);

  // Add debugging for filter changes
  const handleFilterClick = (type) => {
    console.log("Previous filter:", state.filters.orderType);
    console.log("New filter:", type);
    
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        orderType: type
      }
    }));
  };

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
    alert("Đã xóa phiếu mua hàng đã chọn.");
  };

  const handleRowClick = (record) => {
    console.log("Navigating to import product detail with ID:", record.id);
    navigate(`/import-product-detail/${record.id}`);
  };


  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Sản phẩm",
      dataIndex: "products",
      key: "products",
      width: 300, 
      render: (products) => {
        const { name, otherProducts } = products;
        const remainingCount = otherProducts.length;

        return (
          <div>
            <span>{name}</span>
            {remainingCount > 0 && (
              <span style={{ color: "#888", marginLeft: 8 }}>
                +{remainingCount} sản phẩm khác
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Nhà cung cấp",
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
      title: "Xử lý",
      dataIndex: "action",
      key: "action",
      width: "12%",
      render: (status) => {
        let color = "";
        switch (status) {
          case "Đang xử lý":
            color = "orange";
            break;
          case "Đã giao":
            color = "green";
            break;
          case "Đã hủy":
            color = "red";
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
        <Topbar title="Quản lý phiếu mua hàng" />
      </div>

      <div className="order-table-container12">
        <header className="order-header">
          <div className="header-actions">
            <Input.Search
              placeholder="Tìm kiếm phiếu mua hàng..."
              onSearch={(value) => handleChange("searchQuery", value)}
              onChange={(e) => handleChange("searchQuery", e.target.value)}
              value={state.filters.searchQuery}
              
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
              onClick={() => navigate("/create-import-product")} // Điều hướng tới trang tạo phiếu
            >
              Thêm phiếu mua hàng
            </Button>
          </div>
        </header>

        {/* Filter */}
        <div className="filter-section">
          <div className="filter-button">
            {["Tất cả phiếu mua hàng", "Đang xử lý", "Đã giao", "Đã hủy"].map((type) => (
              <Button
                key={type}
                onClick={() => handleFilterClick(type)}
                className={`filter-btn ${state.filters.orderType === type ? "active" : ""}`}
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
          rowSelection={{
            selectedRowKeys: state.selectedOrders,
            onChange: (selectedRowKeys) =>
              handleChange("selectedOrders", selectedRowKeys),
          }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
          pagination={{ pageSize: 5 }}
        />

        {/* Delete Modal */}
        <Modal
          title="Xác nhận xóa"
          visible={state.isModalVisible}
          onOk={handleConfirmDelete}
          onCancel={() => handleChange("isModalVisible", false)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <p>Bạn có chắc chắn muốn xóa những phiếu mua hàng đã chọn?</p>
        </Modal>
      </div>
    </div>
  );
};

export default ImportProduct;