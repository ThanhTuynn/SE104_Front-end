import React, { useState, useEffect, useMemo } from "react";
import { Modal, Button, Checkbox, Input, Table } from "antd";
import ServiceTypeService from '../../../services/ServiceTypeService';
import "./Modal_timkiemdichvu.css";

const ServiceModal = ({ isVisible, onCancel, onConfirm }) => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [quantities, setQuantities] = useState({});
  const [fetchedServices, setFetchedServices] = useState([]);

  // Add debugging logs
  useEffect(() => {
    console.log('Modal visibility:', isVisible);
    console.log('Available services:', fetchedServices);
  }, [isVisible, fetchedServices]);

  // Reset states when modal closes
  useEffect(() => {
    if (!isVisible) {
      setSelectedServices([]);
      setQuantities({});
      setSearchValue("");
    }
  }, [isVisible]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await ServiceTypeService.getAllServiceTypes();
        console.log('Fetched data:', data); // Debug log
        const mappedData = (Array.isArray(data) ? data : []).map(item => ({
          id: item.MaLoaiDV,
          name: item.TenLoaiDichVu,
          price: item.DonGiaDV,
          image: null
        }));
        setFetchedServices(mappedData);
      } catch (error) {
        console.error('Error fetching services:', error);
        // Optionally show error message to user
        // message.error('Không thể tải danh sách dịch vụ');
      }
    };

    if (isVisible) {
      fetchServices();
    }
  }, [isVisible]);

  // Filter services based on search
  const filteredServices = useMemo(() => {
    return fetchedServices.filter((service) =>
      service.name.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [fetchedServices, searchValue]);

  // Handle quantity updates
  const updateQuantity = (serviceId, change) => {
    setQuantities(prev => ({
      ...prev,
      [serviceId]: Math.max(1, (prev[serviceId] || 1) + change)
    }));
  };

  // Handle service selection
  const handleSelect = (record) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === record.id);
      if (isSelected) {
        return prev.filter(s => s.id !== record.id);
      } else {
        return [...prev, record];
      }
    });

    // Initialize quantity if not exists
    if (!quantities[record.id]) {
      setQuantities(prev => ({
        ...prev,
        [record.id]: 1
      }));
    }
  };

  // Thêm hàm định dạng tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount).replace('₫', 'VND');
  };

  const columns = [
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      width: "15%",
      render: (image) => (
        <img
          src={image || "https://via.placeholder.com/40"}
          alt="Dịch vụ"
          style={{
            width: "40px",
            height: "40px",
            objectFit: "cover",
            borderRadius: "4px",
          }}
        />
      ),
    },
    {
      title: "Dịch vụ",
      dataIndex: "name",
      key: "name",
      width: "30%",
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      width: "15%",
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              updateQuantity(record.id, -1);
            }}
            disabled={!selectedServices.some(s => s.id === record.id)}
          >
            -
          </Button>
          <span>{quantities[record.id] || 1}</span>
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              updateQuantity(record.id, 1);
            }}
            disabled={!selectedServices.some(s => s.id === record.id)}
          >
            +
          </Button>
        </div>
      ),
    },
    {
      title: "Giá (VND)",
      dataIndex: "price",
      key: "price",
      render: (price) => formatCurrency(price),
    },
    {
      title: "",
      key: "select",
      render: (_, record) => (
        <Checkbox
          checked={selectedServices.some(s => s.id === record.id)}
          onChange={() => handleSelect(record)}
        >
          Chọn
        </Checkbox>
      ),
    },
  ];

  const handleOk = () => {
    const servicesWithQuantities = selectedServices.map(service => ({
      ...service,
      quantity: quantities[service.id] || 1,
      total: formatCurrency(service.price * (quantities[service.id] || 1))
    }));
    onConfirm(servicesWithQuantities);
  };

  return (
    <Modal
      title="Tìm kiếm dịch vụ"
      visible={isVisible}
      onCancel={onCancel}
      footer={[
        <Button 
          key="cancel" 
          onClick={onCancel}
          style={{ borderRadius: '8px' }}
        >
          Hủy
        </Button>,
        <Button 
          key="confirm" 
          type="primary" 
          onClick={handleOk}
          style={{ borderRadius: '8px' }}
        >
          Hoàn tất chọn
        </Button>,
      ]}
      centered
      className="service-modal"
      width={800} // Điều chỉnh độ rộng modal
    >
      <Input
        placeholder="Tìm kiếm dịch vụ"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        style={{
          marginBottom: "16px",
          padding: "8px",
          borderRadius: "4px",
        }}
      />
      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
        <Table
          dataSource={filteredServices}
          columns={columns}
          rowKey="id"
          pagination={false}
          bordered
          scroll={{ y: 350 }} // Thêm cuộn dọc với chiều cao cố định
          style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
          }}
        />
      </div>
    </Modal>
  );
};

export default ServiceModal;