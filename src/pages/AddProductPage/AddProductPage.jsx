import React, { useState, useEffect } from "react";  // Thêm useEffect
import { useNavigate } from 'react-router-dom'; // Thêm dòng này
import axios from 'axios';  // Thêm import axios
import { message } from 'antd';  // Thêm import message
import productService from '../../services/productService';
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
import "./AddProductPage.css";

const { Sider, Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;

const App = () => {
  const navigate = useNavigate(); // Thêm dòng này
  const [attributes, setAttributes] = useState([
    { key: 1, property: "", detail: "" },
  ]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    productName: '',
    categoryId: '',
    productCode: '',
    image:'',
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

  console.log('Current categories:', categories); // Debug log

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProduct = async () => {
    try {
      if (!formData.productName || !formData.categoryId || !formData.productCode) {
        message.error('Vui lòng điền đầy đủ thông tin sản phẩm');
        return;
      }

      // Đảm bảo gửi đúng format dữ liệu
      await productService.addProduct({
        TenSanPham: formData.productName,
        MaLoaiSanPham: formData.categoryId,
        MaSanPham: formData.productCode,
        SoLuong: 0, // Thêm mới với số lượng 0
        HinhAnh: formData.image,
      });

      message.success('Thêm sản phẩm thành công');
      navigate('/list-product'); // Giờ có thể sử dụng navigate
    } catch (error) {
      message.error('Không thể thêm sản phẩm: ' + error.message);
    }
  };

  return (
    <Layout className="app-layout_app">
      {/* Sidebar */}
      <div className="body_them">
        <Layout>
        <Content className="app-content">
            <div className="title-container">
                <h1 className="title">Thêm sản phẩm</h1>
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
              + Lưu sản phẩm
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
              <Row gutter={16}>
                <Col span={24}>
                  <label>Mã sản phẩm</label>
                  <Input 
                    placeholder="Nhập mã sản phẩm"
                    value={formData.productCode}
                    onChange={(e) => handleInputChange('productCode', e.target.value)}
                  />
                </Col>
              </Row>
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
                  <label>Thêm hình ảnh</label>
                  <Input 
                    placeholder="Nhập link ảnh sản phẩm" 
                    onChange={(e) => handleInputChange('image', e.target.value)}
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
