import React, { useState } from "react";
import { Input, Button, DatePicker, Form, Table } from "antd";
import "./DetailImportProduct.css";
import { useNavigate } from "react-router-dom";


const { TextArea } = Input;

const DetailImportOrder = () => {
  const navigate = useNavigate(); // Khai báo useNavigate

  // Hàm xử lý khi nhấn nút Hủy
  const handleCancel = () => {
    navigate(-1); // Quay lại trang trước
  };

  // Initial predefined data
  const supplierData = { id: 1, name: "Vân Mây", phone: "0312456789", address: "123 Đường ABC, Quận 1, TP.HCM" };

  const initProductData = [
    { code: "SP001", name: "Sản phẩm A", quantity: 10, price: 100, category: "Loại 1" },
    { code: "SP002", name: "Sản phẩm B", quantity: 20, price: 200, category: "Loại 2" },
    { code: "SP003", name: "Sản phẩm C", quantity: 5, price: 150, category: "Loại 1" },
  ];

  const initEmployeeData = { name: "Nguyễn Văn B", id: 1, position: "Nhân viên kho", department: "Kho vận" };

  const [formState, setFormState] = useState({
    supplier: supplierData.name,
    supplierAddress: supplierData.address,
    products: initProductData,
    employeeName: initEmployeeData.name,
    employeePosition: initEmployeeData.position,
    employeeDepartment: initEmployeeData.department,
    expectedDate: null,
    referenceCode: "",
    notes: "",
    discount: 0,
    otherCosts: 0,
    totalQuantity: initProductData.reduce((acc, product) => acc + product.quantity, 0),
    totalAmount: initProductData.reduce((acc, product) => acc + product.quantity * product.price, 0),
  });

  const isFormComplete = () => {
    const { supplier, employeeName, referenceCode, expectedDate } = formState;
    return supplier && employeeName && referenceCode && expectedDate;
  };

  const handleSave = () => {
    if (!isFormComplete()) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }
    alert("Đơn hàng đã được lưu.");
    navigate("list-import-product");
  };

  const [initialFormState, setInitialFormState] = useState({
    ...formState,
  });

  // Check if there's any change in the costs section
  const isCostChanged = () => {
    const { discount, otherCosts, laborCosts } = formState;
    return (
      discount !== initialFormState.discount ||
      otherCosts !== initialFormState.otherCosts ||
      laborCosts !== initialFormState.laborCosts
    );
  };

  // Handle purchase button click
  const handlePurchase = () => {
    if (!isCostChanged()) {
      alert("Chưa có thay đổi nào về chi phí mua hàng.");
      return;
    }
    alert("Đơn hàng đã được tạo thành công.");
  };

  // Handle changes to input fields
  const handleChange = (key, value) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleFeeChange = (key, value) => {
    const newFormState = { ...formState, [key]: value };

    // Calculate the total cost whenever there's a change
    const totalCost =
      parseFloat(newFormState.totalAmount || 0) +
      parseFloat(newFormState.discount || 0) +
      parseFloat(newFormState.otherCosts || 0) +
      parseFloat(newFormState.laborCosts || 0) -
      parseFloat(newFormState.discount || 0);

    newFormState.totalCost = totalCost;

    setFormState(newFormState);
  };

  const columns = [
    { title: 'Mã sản phẩm', dataIndex: 'code', key: 'code' },
    { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Giá', dataIndex: 'price', key: 'price' },
    { title: 'Loại sản phẩm', dataIndex: 'category', key: 'category' },
  ];

  return (
    <div className="create-import-order-container">
      <header className="header">
        <h2>Chi tiết phiếu mua hàng</h2>
        <div className="header-actions">
          <Button danger onClick={handleCancel}>
            Thoát
          </Button>
        </div>
      </header>

      <div className="form-container">
        {/* Supplier Section */}
        <div className="form-section">
          <h3>Nhà cung cấp</h3>
          <p>Tên: {supplierData.name}</p>
          <p>Số điện thoại: {supplierData.phone}</p>
          <p>Địa chỉ: {supplierData.address}</p>
        </div>

        {/* Product Section */}
        <div className="form-section">
          <h3>Sản phẩm</h3>
          <Table dataSource={formState.products} columns={columns} rowKey="code" pagination={false} />
        </div>

      </div>
    </div>
  );
};

export default DetailImportOrder;