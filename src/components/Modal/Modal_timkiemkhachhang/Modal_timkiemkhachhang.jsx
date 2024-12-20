import React, { useState, useMemo, useEffect } from "react";
import { Modal, Button, Input, List, Avatar, Checkbox } from "antd";
import "./Modal_timkiemkhachhang.css";

const CustomerSearchModal = ({ isVisible, onCancel, onConfirm, customers = [], title }) => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState([]);

  // Thêm useEffect để reset selected customers khi đóng modal
  useEffect(() => {
    if (!isVisible) {
      setSelectedCustomers([]);
      setSearchValue("");
    }
  }, [isVisible]);

  // Lọc danh sách khách hàng theo từ khóa tìm kiếm
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [customers, searchValue]);

  // Hàm xử lý khi chọn/bỏ chọn khách hàng
  const handleSelectCustomer = (customer) => {
    setSelectedCustomers(prev => {
      const isSelected = prev.some(c => c.id === customer.id);
      if (isSelected) {
        return prev.filter(c => c.id !== customer.id);
      } else {
        return [...prev, customer];
      }
    });
  };

  // Hàm xử lý xác nhận khách hàng
  const handleOk = () => {
    if (selectedCustomers.length > 0) {
      onConfirm(selectedCustomers);
    }
  };

  return (
    <Modal
      title={title || "Tìm kiếm khách hàng"}
      visible={isVisible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="confirm"
          type="primary"
          onClick={handleOk}
          disabled={selectedCustomers.length === 0}
        >
          Hoàn tất chọn ({selectedCustomers.length})
        </Button>,
      ]}
      centered
      className="customer-search-modal"
    >
      <div className="search-container">
        <Input
          placeholder="Tìm kiếm khách hàng"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="search-input"
        />
      </div>
      <List
        itemLayout="horizontal"
        dataSource={filteredCustomers}
        renderItem={(item) => (
          <List.Item
            className={`list-item ${
              selectedCustomers.some(c => c.id === item.id) ? "selected" : ""
            }`}
          >
            <Checkbox
              checked={selectedCustomers.some(c => c.id === item.id)}
              onChange={() => handleSelectCustomer(item)}
            />
            <List.Item.Meta
              avatar={<Avatar>{item.name.charAt(0)}</Avatar>}
              title={item.name}
              description={`Số điện thoại: ${item.phone}`}
              style={{ marginLeft: "12px" }}
            />
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default CustomerSearchModal;
