import React, { useState } from "react";
import { Input, Button, Form, Modal, Select, Upload, message, Table, Checkbox } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import "./CreateImportProduct.css";
import { useNavigate } from "react-router-dom";

const CreateImportOrder = () => {
  const navigate = useNavigate(); // Khai báo useNavigate

  // Hàm xử lý khi nhấn nút Hủy
  const handleCancel = () => {
    navigate(-1); // Quay lại trang trước
  };

  // Initial predefined data
  const initSupplierData = [
    { id: "NCC001", name: "Vân Mây", address: "123 Đường A", phone: "0312456789" },
    { id: "NCC002", name: "Nguyễn Văn A", address: "456 Đường B", phone: "0918273845" },
    { id: "NCC003", name: "Trần Thị Ngọc B", address: "789 Đường C", phone: "091726354" },
    { id: "NCC004", name: "Lê Văn C", address: "101 Đường D", phone: "0328435671" },
    { id: "NCC005", name: "Nguyễn Văn D", address: "102 Đường E", phone: "0321654879"},
  ];

  const initProductData = [
    { code: "SP001", name: "Sản phẩm A", category: "Loại 1" },
    { code: "SP002", name: "Sản phẩm B", category: "Loại 2" },
    { code: "SP003", name: "Sản phẩm C", category: "Loại 1" },
  ];

  const productCategories = [
    "Vàng 24k", "Bạc cao cấp", "Kim cương", "Đá quý", "Vàng 18k", "Nhẫn vàng", "Nhẫn bạc", "Vòng tay", "Dây chuyền", "Lắc chân",
  ];

  const [setFormState] = useState({
    supplier: "",
    products: [],
  });

  const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    id: "",
    name: "",
    address: "",
    phone: "",
  });

  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    code: "",
    name: "",
    category: "",
    image: null,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);

  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);


  const handleSave = () => {
    if (!isFormComplete()) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }
    alert("Phiếu mua hàng đã được lưu.");
    navigate("/list-import-product"); // Navigate to the list-import-product page
  };

  const handleSelectSupplier = (supplier) => {
    setSelectedSuppliers((prev) => {
      if (prev.some((item) => item.id === supplier.id)) {
        return prev.filter((item) => item.id !== supplier.id);
      } else {
        return [...prev, supplier];
      }
    });
  };

  const handleRemoveSupplier = (supplierId) => {
    setSelectedSuppliers((prev) =>
      prev.filter((supplier) => supplier.id !== supplierId)
    );
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredSuppliers = initSupplierData.filter(
    (supplier) =>
      supplier.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewSupplierChange = (key, value) => {
    setNewSupplier((prev) => ({ ...prev, [key]: value }));
  };

  const handleNewProductChange = (key, value) => {
    setNewProduct((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (file) => {
    setNewProduct((prev) => ({ ...prev, image: file }));
    message.success(`${file.name} đã được tải lên.`);
    return false; // Prevent default upload behavior
  };

  const openNewSupplierModal = () => {
    setShowNewSupplierModal(true);
  };

  const closeNewSupplierModal = () => {
    setShowNewSupplierModal(false);
  };

  const saveNewSupplier = () => {
    if (
      !newSupplier.id ||
      !newSupplier.name ||
      !newSupplier.address ||
      !newSupplier.phone
    ) {
      alert("Vui lòng điền đầy đủ thông tin nhà cung cấp.");
      return;
    }

    initSupplierData.push({
      id: newSupplier.id,
      name: newSupplier.name,
      address: newSupplier.address,
      phone: newSupplier.phone,
    });

    setFormState((prev) => ({ ...prev, supplier: newSupplier.name }));
    closeNewSupplierModal();
    alert("Nhà cung cấp đã được thêm thành công.");
  };

  const openNewProductModal = () => {
    setShowNewProductModal(true);
  };

  const closeNewProductModal = () => {
    setShowNewProductModal(false);
    setNewProduct({ code: "", name: "", category: "", image: null });
  };

  const saveNewProduct = () => {
    if (!newProduct.code || !newProduct.name || !newProduct.category) {
      alert("Vui lòng điền đầy đủ thông tin sản phẩm.");
      return;
    }
    const newProductWithImage = {
      ...newProduct,
      image: newProduct.image?.name,
    };
    initProductData.push(newProductWithImage);

    setFormState((prev) => ({
      ...prev,
      products: [...prev.products, newProductWithImage],
    }));

    closeNewProductModal();
    alert("Sản phẩm đã được thêm thành công.");
  };

  const handleProductSearch = (e) => {
    setProductSearchTerm(e.target.value);
  };

  const handleSelectProduct = (product) => {
    setSelectedProducts((prev) => {
      if (prev.some((item) => item.code === product.code)) {
        return prev.filter((item) => item.code !== product.code);
      } else {
        return [...prev, product];
      }
    });
  };

  const handleRemoveProduct = (productCode) => {
    setSelectedProducts((prev) =>
      prev.filter((product) => product.code !== productCode)
    );
  };

  const handleProductInfoChange = (productCode, key, value) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.code === productCode ? { ...product, [key]: value } : product
      )
    );
  };

  const filteredProducts = initProductData.filter(
    (product) =>
      product.code.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.name.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  const supplierColumns = [
    {
      title: (
        <Checkbox
          indeterminate={
            selectedSuppliers.length > 0 &&
            selectedSuppliers.length < initSupplierData.length
          }
          checked={selectedSuppliers.length === initSupplierData.length}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedSuppliers(initSupplierData);
            } else {
              setSelectedSuppliers([]);
            }
          }}
        />
      ),
      key: "select",
      render: (text, supplier) => (
        <Checkbox
          checked={selectedSuppliers.some((item) => item.id === supplier.id)}
          onChange={() => handleSelectSupplier(supplier)}
        />
      ),
    },
    { title: "Mã nhà cung cấp", dataIndex: "id", key: "id" },
    { title: "Tên nhà cung cấp", dataIndex: "name", key: "name" },
    { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
    { title: "Địa chỉ", dataIndex: "address", key: "address" },
  ];

  const selectedSupplierColumns = [
    {
      title: (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => setSelectedSuppliers([])}
        />
      ),
      key: "action",
      render: (text, supplier) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveSupplier(supplier.id)}
        />
      ),
    },
    { title: "Mã nhà cung cấp", dataIndex: "id", key: "id" },
    { title: "Tên nhà cung cấp", dataIndex: "name", key: "name" },
    { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
    { title: "Địa chỉ", dataIndex: "address", key: "address" },
  ];

  const productColumns = [
    {
      title: (
        <Checkbox
          indeterminate={
            selectedProducts.length > 0 &&
            selectedProducts.length < initProductData.length
          }
          checked={selectedProducts.length === initProductData.length}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedProducts(initProductData);
            } else {
              setSelectedProducts([]);
            }
          }}
        />
      ),
      key: "select",
      render: (text, product) => (
        <Checkbox
          checked={selectedProducts.some((item) => item.code === product.code)}
          onChange={() => handleSelectProduct(product)}
        />
      ),
    },
    { title: "Mã sản phẩm", dataIndex: "code", key: "code" },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      render: (text) => (
        <a href={text || "https://cf.shopee.vn/file/ee4a29902c4a53dd211e6563a1b66d8d"} target="_blank" rel="noopener noreferrer">
          <img src={text || "https://cf.shopee.vn/file/ee4a29902c4a53dd211e6563a1b66d8d"} alt="Product" style={{ width: 50, height: 50 }} />
        </a>
      ),
    },
    { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
    { title: "Loại sản phẩm", dataIndex: "category", key: "category" },
  ];

  const selectedProductColumns = [
    {
      title: (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => setSelectedProducts([])}
        />
      ),
      key: "action",
      render: (text, product) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveProduct(product.code)}
        />
      ),
    },
    { title: "Mã sản phẩm", dataIndex: "code", key: "code" },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      render: (text) => (
        <a href={text || "https://cf.shopee.vn/file/ee4a29902c4a53dd211e6563a1b66d8d"} target="_blank" rel="noopener noreferrer">
          <img src={text || "https://cf.shopee.vn/file/ee4a29902c4a53dd211e6563a1b66d8d"} alt="Product" style={{ width: 50, height: 50 }} />
        </a>
      ),
    },
    { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
    { title: "Loại sản phẩm", dataIndex: "category", key: "category" },
    {
      title: "Số lượng",
      key: "quantity",
      render: (text, product) => (
        <Input
          type="number"
          min="1"
          value={product.quantity || ""}
          onChange={(e) =>
            handleProductInfoChange(product.code, "quantity", e.target.value)
          }
          placeholder="Nhập số lượng"
        />
      ),
    },
    {
      title: "Đơn giá",
      key: "unitPrice",
      render: (text, product) => (
        <Input
          type="number"
          min="0"
          value={product.unitPrice || ""}
          onChange={(e) =>
            handleProductInfoChange(product.code, "unitPrice", e.target.value)
          }
          placeholder="Nhập đơn giá"
        />
      ),
    },
  ];

  const isFormComplete = () => {
    return selectedSuppliers.length > 0 && selectedProducts.length > 0;
  };

  return (
    <div className="create-import-order-container">
      <header className="header">
        <h2>Tạo phiếu mua hàng</h2>
      </header>

      <div className="form-container">
        {/* Supplier Section */}
        <div className="form-section">
          <h3>Nhà cung cấp</h3>
          <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            placeholder="Tìm kiếm nhà cung cấp theo mã hoặc tên"
            value={searchTerm}
            onChange={handleSearch}
          />
            <Button type="link" onClick={openNewSupplierModal}>
              Thêm nhà cung cấp mới
            </Button>
            </div>
          {searchTerm && (
            <Table
              bordered
              dataSource={filteredSuppliers}
              columns={supplierColumns}
              rowKey="id"
              style={{ marginTop: "16px" }}
            />
          )}
          <div style={{ marginTop: "16px" }}>
            <h4>Nhà cung cấp đã chọn:</h4>
            <Table
              bordered
              dataSource={selectedSuppliers}
              columns={selectedSupplierColumns}
              rowKey="id"
            />
          </div>
        </div>

        {/* Modal for adding new supplier */}
        <Modal
          title="Thêm nhà cung cấp mới"
          visible={showNewSupplierModal}
          onCancel={closeNewSupplierModal}
          onOk={saveNewSupplier}
          cancelText="Hủy"
          okText="Tạo mới"
        >
          <Form layout="vertical">
            <Form.Item label="Mã nhà cung cấp" required>
              <Input
                value={newSupplier.id}
                onChange={(e) => handleNewSupplierChange("id", e.target.value)}
                placeholder="Nhập mã nhà cung cấp"
              />
            </Form.Item>
            <Form.Item label="Tên nhà cung cấp" required>
              <Input
                value={newSupplier.name}
                onChange={(e) =>
                  handleNewSupplierChange("name", e.target.value)
                }
                placeholder="Nhập tên nhà cung cấp"
              />
            </Form.Item>
            <Form.Item label="Địa chỉ" required>
              <Input
                value={newSupplier.address}
                onChange={(e) =>
                  handleNewSupplierChange("address", e.target.value)
                }
                placeholder="Nhập địa chỉ nhà cung cấp"
              />
            </Form.Item>
            <Form.Item label="Số điện thoại" required>
              <Input
                value={newSupplier.phone}
                onChange={(e) =>
                  handleNewSupplierChange("phone", e.target.value)
                }
                placeholder="Nhập số điện thoại"
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Product Section */}
        <div className="form-section">
          <h3>Sản phẩm</h3>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Input
              placeholder="Tìm kiếm sản phẩm theo mã hoặc tên"
              value={productSearchTerm}
              onChange={handleProductSearch}
            />
            <Button type="link" onClick={openNewProductModal}>
              Thêm sản phẩm mới
            </Button>
          </div>
          {productSearchTerm && (
            <Table
              bordered
              dataSource={filteredProducts}
              columns={productColumns}
              rowKey="code"
            />
          )}
          <div style={{ marginTop: "16px" }}>
            <h4>Sản phẩm đã chọn:</h4>
            <Table
              bordered
              dataSource={selectedProducts}
              columns={selectedProductColumns}
              rowKey="code"
            />
          </div>
        </div>

        {/* Modal for adding new product */}
        <Modal
          title="Thêm sản phẩm mới"
          visible={showNewProductModal}
          onCancel={closeNewProductModal}
          onOk={saveNewProduct}
          cancelText="Hủy"
          okText="Tạo mới"
        >
          <Form layout="vertical">
            <Form.Item label="Mã sản phẩm" required>
              <Input
                value={newProduct.code}
                onChange={(e) =>
                  handleNewProductChange("code", e.target.value)
                }
                placeholder="Nhập mã sản phẩm"
              />
            </Form.Item>
            <Form.Item label="Tên sản phẩm" required>
              <Input
                value={newProduct.name}
                onChange={(e) =>
                  handleNewProductChange("name", e.target.value)
                }
                placeholder="Nhập tên sản phẩm"
              />
            </Form.Item>
            <Form.Item label="Loại sản phẩm" required>
              <Select
                value={newProduct.category}
                onChange={(value) =>
                  handleNewProductChange("category", value)
                }
                placeholder="Chọn loại sản phẩm"
              >
                {productCategories.map((category) => (
                  <Select.Option key={category} value={category}>
                    {category}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Tải hình ảnh">
              <Upload
                beforeUpload={handleImageUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>

        <div className="form-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <Button danger onClick={handleCancel}>
            Hủy
          </Button>
          <Button
            type="primary"
            disabled={!isFormComplete()}
            onClick={handleSave}
            style={{
              backgroundColor: isFormComplete() ? "#1890ff" : "#d9d9d9",
            }}
          >
            Lưu tạo mới
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateImportOrder;
