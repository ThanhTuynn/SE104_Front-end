import React, { useState, useEffect } from "react";  // Thêm useEffect
import axios from 'axios';  // Thêm import axios
import { message } from 'antd';  // Thêm import message
import productService from '../../services/productService';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // Add this import
import {
  Layout,
  Menu,
  Input,
  Select,
  Button,
  Checkbox,
  Row,
  Col,
  Tag,
  Breadcrumb, // Thêm import Breadcrumb
} from "antd";
import {
  DashboardOutlined,
  AppstoreOutlined,
  FileAddOutlined,
  ShoppingCartOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
  DollarOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import "./AdjustProductPage.css";

const { Sider, Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;

const App = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [attributes, setAttributes] = useState([
    { key: 1, property: "", detail: "" },
  ]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    productName: '',
    categoryId: '',
    productCode: '',
    price: ''
  });

  // Hàm thêm thuộc tính mới
  const addAttribute = () => {
    const newKey = attributes.length + 1;
    setAttributes([
      ...attributes,
      { key: newKey, property: "", detail: "" },
    ]);
  };

  // Thêm useEffect để lấy danh sách loại sản phẩm
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await productService.getCategories();
        console.log('Categories fetched:', categoriesData); // Debug log
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        message.error('Không thể tải danh sách phân loại');
      }
    };

    fetchCategories();
  }, []);

  // Add new useEffect to fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        if (location.state?.productData) {
          const product = location.state.productData;
          console.log("Setting product data:", product);
          setFormData({
            productName: product.productName,
            categoryId: product.categoryId,
            productCode: product.productCode,
            price: String(product.price).replace(/[^\d]/g, '') // Remove currency formatting
          });
        } else {
          // Fallback to API call if no state data
          const products = await productService.getAllProducts();
          const product = products.find(p => p.key === id);
          if (product) {
            setFormData({
              productName: product.productName,
              categoryId: product.categoryId,
              productCode: product.productCode,
              price: String(product.price).replace(/[^\d]/g, '')
            });
          }
        }
      } catch (error) {
        console.error('Error loading product:', error);
        message.error('Không thể tải thông tin sản phẩm');
      }
    };

    fetchProductDetails();
  }, [id, location]);

  console.log('Current categories:', categories); // Debug log

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProduct = async () => {
    try {
      const currentProduct = location.state?.productData;
      
      if (!currentProduct) {
        message.error('Không tìm thấy thông tin sản phẩm');
        return;
      }

      // Format dữ liệu theo đúng yêu cầu của API
      const updatedProduct = {
        TenSanPham: formData.productName,
        MaLoaiSanPham: formData.categoryId,
        MaSanPham: formData.productCode,
        DonGia: parseFloat(formData.price),
        SoLuong: currentProduct.stock // Thêm số lượng từ sản phẩm hiện tại
      };

      console.log('Updating product:', {
        id: currentProduct.key,
        data: updatedProduct
      });

      await productService.updateProduct(currentProduct.key, updatedProduct);
      message.success('Cập nhật sản phẩm thành công');
      navigate('/list-product');
    } catch (error) {
      console.error('Error updating product:', error);
      message.error('Không thể cập nhật sản phẩm: ' + error.message);
    }
  };

  return (
    <Layout className="app-layout-container-adjust">
      {/* Sidebar */}
      <div className="body_them">
        <Layout>
        <Content className="app-content">
            <div className="title-container">
                <h1 className="title">Sửa sản phẩm</h1>
                <img src="/bell.jpg" alt="Logo" className="logo-image111" />
                <img src="/girl.jpg" alt="Logo" className="logo-image211" />
            </div>
            <div className="header-actions">
            <Button 
              type="default" 
              className="action-btn"
              style={{ 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '30px'
              }}
            >
              Hủy
            </Button>
            <Button 
              type="primary" 
              className="action-btn"
              onClick={handleSaveProduct}
              style={{ 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '30px'
              }}
            >
              + Lưu thay đổi
            </Button>
          </div>
          {/* Phân loại */}
            {/* Thông tin chung */}
            <div className="section" style={{
              backgroundColor: "#f8f9ff",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.4)",
              border: "1px solid #e6e9f0",
              marginBottom: "20px"
            }}>
              <h2>Thông tin chung</h2>
              <Row gutter={16}>
                <Col span={24}>
                  <label>Tên sản phẩm</label>
                  <Input 
                    placeholder="Nhập tên sản phẩm" 
                    value={formData.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                  />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <label>Phân loại</label>
                  <Select
                    className="select1"
                    placeholder="Chọn loại sản phẩm"
                    value={formData.categoryId || undefined}
                    onChange={(value) => { // Sửa lại tham số và cách xử lý
                      console.log('Selected category:', value);
                      handleInputChange('categoryId', value);
                    }}
                  >
                    {categories.map(cat => (
                      <Option key={cat.MaLoaiSanPham} value={cat.MaLoaiSanPham}>
                        {cat.TenLoaiSanPham}
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <label>Mã sản phẩm</label>
                  <Input 
                    placeholder="Nhập mã sản phẩm"
                    value={formData.productCode}
                    disabled={true} // Disable input mã sản phẩm
                    style={{ 
                      backgroundColor: '#f5f5f5',
                      cursor: 'not-allowed'
                    }}
                  />
                </Col>
              </Row>
              <label>Giá sản phẩm</label>
              <Row gutter={16}>
                <Col span={24}>
                  <Input
                    placeholder="Nhập giá gốc"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    style={{ width: "100%" }}
                  />
                </Col>
              </Row>
            </div>
          </Content>
        </Layout>
      </div>
    </Layout>
  );
};

export default App;
