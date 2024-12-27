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

        <div className="flex-container">
          {/* Container: Nhân viên xử lý */}
          <div className="form-section half-width">
            <h3>Nhân viên xử lý</h3>
            <Form layout="vertical">
              <Form.Item label="Họ và tên" required>
                <Input
                  placeholder="Nhập họ và tên"
                  onChange={(e) => handleChange("employeeName", e.target.value)}
                  value={formState.employeeName}
                />
              </Form.Item>

              <Form.Item label="Chức vụ" required>
                <Input
                  placeholder="Nhập chức vụ"
                  onChange={(e) => handleChange("employeePosition", e.target.value)}
                  value={formState.employeePosition}
                />
              </Form.Item>

              <Form.Item label="Phòng ban" required>
                <Input
                  placeholder="Nhập phòng ban"
                  onChange={(e) => handleChange("employeeDepartment", e.target.value)}
                  value={formState.employeeDepartment}
                />
              </Form.Item>

              <Form.Item label="Ngày nhận hàng dự kiến" required>
                <DatePicker
                  placeholder="Chọn ngày nhận hàng dự kiến"
                  onChange={(date) => handleChange("expectedDate", date)}
                  value={formState.expectedDate}
                />
              </Form.Item>

              <Form.Item label="Mã tham chiếu" required>
                <Input
                  placeholder="Nhập mã tham chiếu"
                  onChange={(e) =>
                    handleChange("referenceCode", e.target.value)
                  }
                  value={formState.referenceCode}
                />
              </Form.Item>

              <Form.Item label="Ghi chú">
                <TextArea
                  placeholder="Nhập ghi chú"
                  rows={4}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  value={formState.notes}
                />
              </Form.Item>
            </Form>
          </div>

          {/* Container: Chi phí mua hàng */}
          <div className="form-section half-width">
            <h3>Chi phí mua hàng</h3>
            <Form.Item label="Tổng số lượng đặt">
              <Input
                type="number"
                value={formState.totalQuantity}
                onChange={(e) =>
                  handleFeeChange("totalQuantity", e.target.value)
                }
              />
            </Form.Item>

            <Form.Item label="Tổng tiền hàng">
              <Input
                type="number"
                value={formState.totalAmount}
                onChange={(e) => handleFeeChange("totalAmount", e.target.value)}
              />
            </Form.Item>

            <Form.Item label="Chiết khấu">
              <Input
                type="number"
                value={formState.discount}
                onChange={(e) => handleFeeChange("discount", e.target.value)}
              />
            </Form.Item>

            <Form.Item label="Chi phí khác">
              <Input
                type="number"
                value={formState.otherCosts}
                onChange={(e) => handleFeeChange("otherCosts", e.target.value)}
              />
            </Form.Item>

            <Form.Item label="Cần trả nhà cung cấp">
              <Input
                type="number"
                value={formState.amountToPay}
                onChange={(e) => handleFeeChange("amountToPay", e.target.value)}
              />
            </Form.Item>

            <Form.Item label="Nhân công">
              <Input
                type="number"
                value={formState.laborCosts}
                onChange={(e) => handleFeeChange("laborCosts", e.target.value)}
              />
            </Form.Item>

            <Form.Item label="Tổng tiền mua hàng">
              <Input type="number" value={formState.totalCost} disabled />
            </Form.Item>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailImportOrder;