import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Form,
  Modal,
  Select,
  Upload,
  message,
  Table,
  Alert,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import "./AdjustImportProduct.css";
import { useNavigate, useParams } from "react-router-dom";
import createImportProduct from "../../services/createImportProduct";

const AdjustImportOrder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  // States giống như CreateImportProduct
  const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [supplierData, setSupplierData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [isOverTwoDays, setIsOverTwoDays] = useState(false);

  // States cho form nhập liệu
  const [newSupplier, setNewSupplier] = useState({
    id: "",
    name: "",
    address: "",
    phone: "",
  });

  const [newProduct, setNewProduct] = useState({
    code: "",
    name: "",
    category: "",
    image: null,
    quantity: "",
    unitPrice: "",
  });

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        const data = await createImportProduct.getPurchaseById(id);
        const providerData = await createImportProduct.getProviderById(data.purchaseOrder.MaNCC);
        
        // Kiểm tra thời gian
        const orderDate = new Date(data.purchaseOrder.NgayLap);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate - orderDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        setIsOverTwoDays(diffDays > 2);

        const productsWithDetails = await Promise.all(
          data.purchaseDetails.map(async (item) => {
            const productData = await createImportProduct.getProductById(item.MaSanPham);
            return {
              code: item.MaSanPham,
              name: productData?.TenSanPham || 'N/A',
              quantity: item.SoLuong,
              unitPrice: parseFloat(item.DonGia),
              category: item.TenLoaiSanPham || 'N/A',
              total: parseFloat(item.ThanhTien)
            };
          })
        );

        setSelectedSuppliers([{
          id: providerData.MaNCC,
          name: providerData.TenNCC,
          phone: providerData.SoDienThoai,
          address: providerData.DiaChi
        }]);

        setSelectedProducts(productsWithDetails);

      } catch (error) {
        message.error("Không thể tải thông tin phiếu mua hàng");
        console.error("Fetch order data error:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchInitialData = async () => {
      try {
        const [providers, products] = await Promise.all([
          createImportProduct.getAllProvider(),
          createImportProduct.getAllProducts()
        ]);

        setSupplierData(providers.map(provider => ({
          id: provider.MaNCC,
          name: provider.TenNCC,
          phone: provider.SoDienThoai,
          address: provider.DiaChi
        })));

        setProductData(products.map(product => ({
          code: product.MaSanPham,
          name: product.TenSanPham,
          category: product.category?.TenLoaiSanPham || 'N/A'
        })));

        const categories = [...new Set(products.map(product => 
          product.category?.TenLoaiSanPham
        ))].filter(Boolean);
        setProductCategories(categories);
      } catch (error) {
        message.error("Không thể tải dữ liệu");
        console.error("Fetch initial data error:", error);
      }
    };

    fetchOrderData();
    fetchInitialData();
  }, [id]);

  // Các hàm xử lý
  const handleCancel = () => {
    navigate(-1);
  };

  const handleSupplierSearch = (value) => {
    setSearchTerm(value);
  };

  const handleProductSearch = (value) => {
    setProductSearchTerm(value);
  };

  const handleNewSupplierChange = (field, value) => {
    setNewSupplier((prev) => ({ ...prev, [field]: value }));
  };

  const handleNewProductChange = (field, value) => {
    setNewProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (file) => {
    setNewProduct((prev) => ({ ...prev, image: file }));
    return false;
  };

  const calculateTotalPrice = () => {
    return selectedProducts.reduce(
      (sum, product) => sum + product.quantity * product.unitPrice,
      0
    );
  };

  const handleSave = async () => {
    try {
      // Lấy danh sách sản phẩm ban đầu
      const originalData = await createImportProduct.getPurchaseById(id);
      const originalProducts = originalData.purchaseDetails;

      // Chuẩn bị updateDetails cho thông tin chung của phiếu
      const updateDetails = [{
        NgayLap: originalData.purchaseOrder.NgayLap,
        MaNCC: selectedSuppliers[0]?.id || originalData.purchaseOrder.MaNCC
      }];

      // Tìm các sản phẩm mới được thêm vào
      const addDetails = selectedProducts
        .filter(product => !originalProducts.some(p => p.MaSanPham === product.code))
        .map(product => ({
          MaSanPham: product.code,
          SoLuong: product.quantity,
          DonGia: product.unitPrice.toFixed(2),
          ThanhTien: (product.quantity * product.unitPrice).toFixed(2)
        }));

      // Tìm các sản phẩm bị xóa
      const deleteDetails = originalProducts
        .filter(original => !selectedProducts.some(p => p.code === original.MaSanPham))
        .map(p => p.MaChiTietMH);

      const updateData = {
        updateDetails,
        addDetails,
        deleteDetails
      };

      // In ra console theo format yêu cầu
      console.log(JSON.stringify({
        updateDetails: [{
          NgayLap: originalData.purchaseOrder.NgayLap,
          MaNCC: selectedSuppliers[0]?.id || originalData.purchaseOrder.MaNCC
        }],
        addDetails: selectedProducts
          .filter(product => !originalProducts.some(p => p.MaSanPham === product.code))
          .map(product => ({
            MaSanPham: product.code,
            SoLuong: product.quantity,
            DonGia: product.unitPrice.toFixed(2),
            ThanhTien: (product.quantity * product.unitPrice).toFixed(2)
          })),
        deleteDetails: originalProducts
          .filter(original => !selectedProducts.some(p => p.code === original.MaSanPham))
          .map(p => p.MaChiTietMH)
      }, null, 4));

      await createImportProduct.updatePurchase(id, updateData);
      message.success("Cập nhật phiếu mua hàng thành công");
      navigate("/list-import-product");
    } catch (error) {
      message.error("Lỗi khi cập nhật phiếu mua hàng");
      console.error("Update error:", error);
    }
  };

  // Columns cho các bảng
  const supplierColumns = [
    {
      title: 'Mã NCC',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên nhà cung cấp',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type={selectedSuppliers.some(supplier => supplier.id === record.id) ? 'default' : 'primary'}
          onClick={() => {
            setSelectedSuppliers([record]);
            setSearchTerm('');
          }}
        >
          Chọn
        </Button>
      ),
    },
  ];

  const productColumns = [
    {
      title: 'Mã SP',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Loại sản phẩm',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => {
            if (selectedProducts.some(product => product.code === record.code)) {
              message.warning('Sản phẩm này đã được chọn!');
            } else {
              setSelectedProducts(prev => [...prev, { ...record, quantity: 1, unitPrice: 0 }]);
            }
            setProductSearchTerm(''); // Reset thanh tìm kiếm sau khi chọn
          }}
        >
          Chọn
        </Button>
      ),
    },
  ];

  const selectedProductColumns = [
    {
      title: 'Mã SP',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Loại sản phẩm',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (_, record) => (
        <Input
          type="number"
          min={1}
          value={record.quantity}
          onChange={(e) => {
            const newQuantity = parseInt(e.target.value) || 0;
            setSelectedProducts(prev =>
              prev.map(p =>
                p.code === record.code ? { ...p, quantity: newQuantity } : p
              )
            );
          }}
        />
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (_, record) => (
        <Input
          type="number"
          min={0}
          value={record.unitPrice}
          onChange={(e) => {
            const newPrice = parseFloat(e.target.value) || 0;
            setSelectedProducts(prev =>
              prev.map(p =>
                p.code === record.code ? { ...p, unitPrice: newPrice } : p
              )
            );
          }}
        />
      ),
    },
    {
      title: 'Thành tiền',
      key: 'total',
      render: (_, record) => (record.quantity * record.unitPrice).toLocaleString(),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          danger
          onClick={() => {
            setSelectedProducts(prev =>
              prev.filter(product => product.code !== record.code)
            );
          }}
        >
          Xóa
        </Button>
      ),
    },
  ];

  return (
    <div className="create-import-order-container2">
      <header className="header">
        <h2>Chỉnh sửa phiếu mua hàng - Mã phiếu: {id}</h2>
      </header>
      <div className="form-container">
        <div className="form-section">
          <h3>Nhà cung cấp</h3>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Input
              placeholder="Tìm kiếm nhà cung cấp theo mã hoặc tên"
              value={searchTerm}
              onChange={(e) => handleSupplierSearch(e.target.value)}
            />
            <Button type="link" onClick={() => setShowNewSupplierModal(true)}>
              Thêm nhà cung cấp mới
            </Button>
          </div>
          {searchTerm && (
            <Table
              bordered
              dataSource={supplierData.filter(
                (supplier) =>
                  supplier.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
              )}
              columns={supplierColumns}
              rowKey="id"
            />
          )}
          <div style={{ marginTop: "16px" }}>
            <h4>Nhà cung cấp đã chọn:</h4>
            <Table
              bordered
              dataSource={selectedSuppliers}
              columns={[
                ...supplierColumns.filter(col => col.key !== 'action'),
                {
                  title: 'Thao tác',
                  key: 'action',
                  render: () => (
                    <Button
                      danger
                      onClick={() => setSelectedSuppliers([])}
                    >
                      Xóa
                    </Button>
                  ),
                },
              ]}
              rowKey="id"
              pagination={false}
            />
          </div>
        </div>

        {isOverTwoDays ? (
          <div className="form-section">
            <h3>Sản phẩm</h3>
            <Alert
              message="Không thể chỉnh sửa danh sách sản phẩm"
              description="Phiếu mua hàng đã quá 2 ngày kể từ ngày tạo. Bạn không thể thêm hoặc xóa sản phẩm."
              type="warning"
              showIcon
            />
            <div style={{ marginTop: "16px" }}>
              <h4>Sản phẩm đã chọn:</h4>
              <Table
                bordered
                dataSource={selectedProducts}
                columns={selectedProductColumns.filter(col => col.key !== 'action')}
                rowKey="code"
              />
            </div>
            <div style={{ marginTop: "16px", textAlign: "right" }}>
              <h4>Tổng đơn giá: {calculateTotalPrice().toLocaleString()} VND</h4>
            </div>
          </div>
        ) : (
          <div className="form-section">
            <h3>Sản phẩm</h3>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Input
                placeholder="Tìm kiếm sản phẩm theo mã hoặc tên"
                value={productSearchTerm}
                onChange={(e) => handleProductSearch(e.target.value)}
              />
              <Button type="link" onClick={() => setShowNewProductModal(true)}>
                Thêm sản phẩm mới
              </Button>
            </div>
            {productSearchTerm && (
              <Table
                bordered
                dataSource={productData.filter(
                  (product) =>
                    product.code.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                    product.name.toLowerCase().includes(productSearchTerm.toLowerCase())
                )}
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
        )}

        {/* Modal thêm nhà cung cấp mới */}
        <Modal
          title="Thêm nhà cung cấp mới"
          visible={showNewSupplierModal}
          onCancel={() => setShowNewSupplierModal(false)}
          onOk={async () => {
            try {
              await createImportProduct.createProvider(newSupplier);
              message.success('Thêm nhà cung cấp thành công');
              setShowNewSupplierModal(false);
              // Refresh supplier data
              const providers = await createImportProduct.getAllProvider();
              setSupplierData(providers.map(provider => ({
                id: provider.MaNCC,
                name: provider.TenNCC,
                phone: provider.SoDienThoai,
                address: provider.DiaChi
              })));
            } catch (error) {
              message.error('Lỗi khi thêm nhà cung cấp');
            }
          }}
        >
          <Form layout="vertical">
            <Form.Item label="Mã nhà cung cấp">
              <Input
                value={newSupplier.id}
                onChange={(e) => handleNewSupplierChange('id', e.target.value)}
              />
            </Form.Item>
            <Form.Item label="Tên nhà cung cấp">
              <Input
                value={newSupplier.name}
                onChange={(e) => handleNewSupplierChange('name', e.target.value)}
              />
            </Form.Item>
            <Form.Item label="Số điện thoại">
              <Input
                value={newSupplier.phone}
                onChange={(e) => handleNewSupplierChange('phone', e.target.value)}
              />
            </Form.Item>
            <Form.Item label="Địa chỉ">
              <Input
                value={newSupplier.address}
                onChange={(e) => handleNewSupplierChange('address', e.target.value)}
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal thêm sản phẩm mới */}
        <Modal
          title="Thêm sản phẩm mới"
          visible={showNewProductModal}
          onCancel={() => setShowNewProductModal(false)}
          onOk={async () => {
            try {
              await createImportProduct.createProduct(newProduct);
              message.success('Thêm sản phẩm thành công');
              setShowNewProductModal(false);
              // Refresh product data
              const products = await createImportProduct.getAllProducts();
              setProductData(products.map(product => ({
                code: product.MaSanPham,
                name: product.TenSanPham,
                category: product.category?.TenLoaiSanPham || 'N/A'
              })));
            } catch (error) {
              message.error('Lỗi khi thêm sản phẩm');
            }
          }}
        >
          <Form layout="vertical">
            <Form.Item label="Mã sản phẩm">
              <Input
                value={newProduct.code}
                onChange={(e) => handleNewProductChange('code', e.target.value)}
              />
            </Form.Item>
            <Form.Item label="Tên sản phẩm">
              <Input
                value={newProduct.name}
                onChange={(e) => handleNewProductChange('name', e.target.value)}
              />
            </Form.Item>
            <Form.Item label="Loại sản phẩm">
              <Select
                value={newProduct.category}
                onChange={(value) => handleNewProductChange('category', value)}
              >
                {productCategories.map((category) => (
                  <Select.Option key={category} value={category}>
                    {category}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Hình ảnh">
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
          <Button type="primary" onClick={handleSave}>
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdjustImportOrder; 