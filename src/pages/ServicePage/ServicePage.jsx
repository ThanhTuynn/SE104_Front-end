import React, { useState, useEffect, useMemo } from "react";
import { Table, Button, Input, DatePicker, Space, Tag, Menu, Modal, Row, Col, message } from "antd";
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
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await serviceService.getAllServiceTickets();
        console.log('Raw service data:', response); // Debug log

        const formattedData = (response || []).map(service => ({
          key: service.SoPhieuDV,
          SoPhieuDV: service.SoPhieuDV,
          NgayLap: service.NgayLap,
          customer: service.customer?.TenKhachHang || 'N/A',
          TongTien: service.TongTien || 0,
          TongTienTraTruoc: service.TongTienTraTruoc || 0,
          TinhTrang: service.TinhTrang || 'Chưa hoàn thành'
        }));

        setData(formattedData);
      } catch (error) {
        console.error('Error fetching services:', error);
        message.error('Không thể tải danh sách phiếu dịch vụ');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Remove the actions column and update handleRowClick
  const columns = [
    {
      title: "Số phiếu",
      dataIndex: "SoPhieuDV",
      key: "SoPhieuDV",
      width: "10%"
    },
    {
      title: "Ngày lập",
      dataIndex: "NgayLap",
      key: "NgayLap",
      width: "15%",
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: "Khách hàng", 
      dataIndex: "customer",
      key: "customer",
      width: "20%"
    },
    {
      title: "Tổng tiền",
      dataIndex: "TongTien",
      key: "TongTien", 
      width: "15%",
      render: (amount) => formatCurrency(amount)
    },
    {
      title: "Trả trước",
      dataIndex: "TongTienTraTruoc",
      key: "TongTienTraTruoc",
      width: "15%", 
      render: (amount) => formatCurrency(amount)
    },
    {
      title: "Còn lại",
      key: "ConLai",
      width: "15%",
      render: (_, record) => formatCurrency(record.TongTien - record.TongTienTraTruoc)
    },
    {
      title: "Tình trạng",
      dataIndex: "TinhTrang",
      key: "TinhTrang",
      width: "10%",
      render: (status) => (
        <Tag color={status === "Hoàn thành" ? "success" : "warning"}>
          {status}
        </Tag>
      )
    }
  ];

  // Add row click handler
  const handleRowClick = (record) => {
    navigate(`/view-service/${record.SoPhieuDV}`);
  };

  return (
    <div className="service-page-container">
      <Topbar title="Quản lý phiếu dịch vụ" />
      
      <div className="service-content">
        <div className="service-header">
          <div className="header-actions">
            <Search
              placeholder="Tìm kiếm phiếu dịch vụ..."
              onSearch={(value) => console.log(value)}
              style={{ width: 300 }}
            />
            <Button
              type="primary"
              icon={<ExportOutlined />}
              className="export-button"
            >
              Xuất file
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/add-service")}
            >
              Thêm phiếu dịch vụ
            </Button>
          </div>
        </div>

        <Table
          loading={loading}
          dataSource={data}
          columns={columns}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} phiếu dịch vụ`
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/adjust-service/${record.SoPhieuDV}`),
            style: { cursor: 'pointer' }
          })}
        />
      </div>
    </div>
  );
};

export default App1;
