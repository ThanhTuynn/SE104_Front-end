import React, { useState, useEffect} from "react";
import {
  Input,
  Button,
  Form,
  Modal,
  Select,
  Upload,
  message,
  Table,
  Checkbox,
} from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import "./CreateImportProduct.css";
import { useNavigate } from "react-router-dom";
import createImportProduct from "../../services/createImportProduct";

const CreateImportOrder = () => {
  const navigate = useNavigate(); // Khai báo useNavigate

  // Hàm xử lý khi nhấn nút Hủy
  const handleCancel = () => {
    navigate(-1); // Quay lại trang trước
  };

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
    quantity: "",
    unitPrice: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);

  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [supplierData, setSupplierData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productCategories, setProductCategories] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const data = await createImportProduct.getAllProvider();
      const formattedProviders = data.map((provider) => ({
        id: provider.MaNCC,
        name: provider.TenNCC,
        phone: provider.SoDienThoai,
        address: provider.DiaChi,
      }));
      setSupplierData(formattedProviders);
    } catch (error) {
      message.error("Không thể tải danh sách nhà cung cấp");
      console.error("Fetch providers error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await createImportProduct.getAllProducts();
      const formattedProducts = data.map((product) => ({
        code: product.MaSanPham,
        image: product.HinhAnh,
        name: product.TenSanPham,
        category: product.category.TenLoaiSanPham,
      }));
      setProductData(formattedProducts);

      // Extract unique categories from the fetched products
      const categories = [...new Set(data.map(product => product.category.TenLoaiSanPham))];
      setProductCategories(categories);
    } catch (error) {
      message.error("Không thể tải danh sách sản phẩm");
      console.error("Fetch products error:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateOrderId = () => {
    return `ORD-${Date.now()}`;
  };

  const handleSave = async () => {
    if (!isFormComplete()) {
      message.error("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    // Kiểm tra thông tin sản phẩm
    const invalidProducts = selectedProducts.filter(
      product => !product.quantity || !product.unitPrice
    );
    
    if (invalidProducts.length > 0) {
      message.error("Vui lòng nhập đầy đủ số lượng và đơn giá cho tất cả sản phẩm");
      return;
    }

    // Format mã phiếu mua hàng theo yêu cầu (PMH + số)
    const orderId = `PMH${Date.now().toString().slice(-6)}`;
    const currentDate = new Date().toISOString().split('T')[0];

    const orderData = {
      orderId, // soPhieu
      date: currentDate, // ngayLap
      supplierId: selectedSuppliers[0].id, // nhaCungCap
      products: selectedProducts.map(product => ({
        code: product.code, // maSanPham
        quantity: parseInt(product.quantity), // soLuong
        unitPrice: parseFloat(product.unitPrice), // donGia
      }))
    };

    try {
      await createImportProduct.createOrder(orderData);
      message.success("Phiếu mua hàng đã được lưu thành công");
      
      // Cập nhật số lượng sản phẩm trong kho
      for (const product of selectedProducts) {
        try {
          const formData = new FormData();
          formData.append('MaSanPham', product.code);
          formData.append('TenSanPham', product.name);
          formData.append('MaLoaiSanPham', product.category);
          formData.append('DonGia', product.unitPrice);
          formData.append('SoLuong', parseInt(product.quantity));
          formData.append('HinhAnh', product.image);

          await createImportProduct.updateProduct(product.code, formData);
        } catch (error) {
          console.error(`Error updating product ${product.code}:`, error);
        }
      }

      navigate("/list-import-product");
    } catch (error) {
      message.error("Lỗi khi lưu phiếu mua hàng: " + (error.response?.data?.message || error.message));
      console.error("Save order error:", error);
    }
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

  const filteredSuppliers = supplierData.filter(
    (supplier) =>
      (supplier.id &&
        supplier.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (supplier.name &&
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleNewSupplierChange = (key, value) => {
    setNewSupplier((prev) => ({ ...prev, [key]: value }));
  };

  const handleNewProductChange = (key, value) => {
    setNewProduct((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      // Use the provided API for image upload
      const response = await fetch('http://localhost:3000/api/product/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload image');
      }

      const data = await response.json();
      const imageUrl = data.url; // Get the URL from the response

      setNewProduct((prev) => ({ ...prev, HinhAnh: imageUrl }));
      message.success(`${file.name} đã được tải lên.`);
    } catch (error) {
      message.error(`Lỗi khi tải ảnh lên: ${error.message}`);
      console.error("Image upload error:", error);
    }
    return false; // Prevent default upload behavior
  };

  const openNewSupplierModal = () => {
    setShowNewSupplierModal(true);
  };

  const closeNewSupplierModal = () => {
    setShowNewSupplierModal(false);
  };

  const handleAddProvider = async () => {
    try {
      const providerData = {
        MaNCC: newSupplier.id,
        TenNCC: newSupplier.name,
        SoDienThoai: newSupplier.phone,
        DiaChi: newSupplier.address,
      };

      console.log('Adding provider with data:', providerData);
      const response = await createImportProduct.createProvider(providerData);
      console.log('Provider added successfully:', response);
      message.success("Thêm nhà cung cấp thành công");
      setShowNewSupplierModal(false);
      setNewSupplier({ id: "", name: "", address: "", phone: "" });
      fetchProviders();
    } catch (error) {
      message.error("Lỗi khi thêm nhà cung cấp");
      console.error("Add provider error:", error.response ? error.response.data : error.message);
    }
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

    handleAddProvider();
  };

  const openNewProductModal = async () => {
    setShowNewProductModal(true);
  };

  const closeNewProductModal = () => {
    setShowNewProductModal(false);
    setNewProduct({ code: "", name: "", category: "", image: null, quantity: "", unitPrice: "" });
  };

  const handleAddProduct = async () => {
    try {
      const productData = {
        MaSanPham: newProduct.code,
        TenSanPham: newProduct.name,
        MaLoaiSanPham: newProduct.category,
        DonGia: newProduct.unitPrice,
        SoLuong: newProduct.quantity,
        HinhAnh: newProduct.HinhAnh,
      };

      console.log('Adding product with data:', productData);
      const response = await createImportProduct.createProduct(productData);
      console.log('Product added successfully:', response);
      message.success("Thêm sản phẩm thành công");
      setShowNewProductModal(false);
      setNewProduct({ code: "", name: "", category: "", HinhAnh: null, quantity: "", unitPrice: "" });
      fetchProducts();
    } catch (error) {
      message.error("Lỗi khi thêm sản phẩm");
      console.error("Add product error:", error.response ? error.response.data : error.message);
    }
  };

  const saveNewProduct = () => {
    if (!newProduct.code || !newProduct.name || !newProduct.category || !newProduct.quantity || !newProduct.unitPrice) {
      alert("Vui lòng điền đầy đủ thông tin sản phẩm.");
      return;
    }

    handleAddProduct();
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

  const filteredProducts = productData.filter(
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
            selectedSuppliers.length < supplierData.length
          }
          checked={selectedSuppliers.length === supplierData.length}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedSuppliers(supplierData);
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
            selectedProducts.length < productData.length
          }
          checked={selectedProducts.length === productData.length}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedProducts(productData);
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
        <a
          href={
            text || "https://cf.shopee.vn/file/ee4a29902c4a53dd211e6563a1b66d8d"
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={
              text ||
              "https://cf.shopee.vn/file/ee4a29902c4a53dd211e6563a1b66d8d"
            }
            alt="Product"
            style={{ width: 50, height: 50 }}
          />
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
        <a
          href={
            text
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={
              text
            }
            alt="Product"
            style={{ width: 50, height: 50 }}
          />
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
    if (selectedSuppliers.length === 0) {
      return false;
    }

    if (selectedProducts.length === 0) {
      return false;
    }

    // Kiểm tra xem tất cả sản phẩm đã có số lượng và đơn giá chưa
    const allProductsComplete = selectedProducts.every(
      product => product.quantity && product.unitPrice
    );

    return allProductsComplete;
  };

  const calculateTotalPrice = () => {
    return selectedProducts.reduce((total, product) => {
      const quantity = product.quantity || 0;
      const unitPrice = product.unitPrice || 0;
      return total + (quantity * unitPrice);
    }, 0);
  };

  return (
    <div className="create-import-order-container1">
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
              loading={loading}
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
          <div style={{ marginTop: "16px", textAlign: "right" }}>
            <h4>Tổng đơn giá: {calculateTotalPrice().toLocaleString()} VND</h4>
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
                onChange={(e) => handleNewProductChange("code", e.target.value)}
                placeholder="Nhập mã sản phẩm"
              />
            </Form.Item>
            <Form.Item label="Tên sản phẩm" required>
              <Input
                value={newProduct.name}
                onChange={(e) => handleNewProductChange("name", e.target.value)}
                placeholder="Nhập tên sản phẩm"
              />
            </Form.Item>
            <Form.Item label="Loại sản phẩm" required>
              <Select
                onChange={(value) => handleNewProductChange("category", value)}
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

        <div
          className="form-actions"
          style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
        >
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
    </div>
  );
};

export default CreateImportOrder;

