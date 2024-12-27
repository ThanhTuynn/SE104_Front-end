import React, { useState, useMemo, useEffect } from "react";
import { Input, Button, Table, Modal, Form, Select, message } from "antd";
import { ExportOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./TypeProductPage.css";
import Topbar from "../../components/TopbarComponent/TopbarComponent";
import typeProductService from "../../services/typeProductService"; // lowercase import
import unitService from "../../services/unitService"; // lowercase import
const TypeProductPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState([]);
  const [params, setParams] = useState({
    search: "",
    selectedRowKeys: [],
    isDeleteModalVisible: false,
  });

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addTypeForm] = Form.useForm();
  const [units, setUnits] = useState([]); // Add state for units

  useEffect(() => {
    fetchTypes();
  }, []);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await typeProductService.getAllUnits();
        setUnits(response.data || []);
      } catch (error) {
        message.error('Không thể tải danh sách đơn vị tính');
      }
    };
    fetchUnits();
  }, []);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const response = await typeProductService.getAllTypes();
      const typesData = response.data.map(type => ({
        key: type.MaLoaiSanPham,
        MaLoaiSanPham: type.MaLoaiSanPham,
        TenLoaiSanPham: type.TenLoaiSanPham,
        MaDVTinh: type.MaDVTinh,
        TenDVTinh: type.unit?.TenDVTinh || 'N/A',
        PhanTramLoiNhuan: parseInt(type.PhanTramLoiNhuan)
      }));
      setTypes(typesData);
    } catch (error) {
      message.error('Không thể tải danh sách loại sản phẩm');
      console.error('Fetch types error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setParams(prevParams => ({
      ...prevParams,
      [key]: value,
    }));
  };

  const filteredTypes = useMemo(() => {
    let filtered = types;

    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filtered = filtered.filter(
        (type) =>
          type.TenLoaiSanPham?.toLowerCase().includes(searchTerm) || 
          type.MaLoaiSanPham?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }, [types, params.search]);

  const handleDeleteSelected = async () => {
    try {
      for (const typeId of params.selectedRowKeys) {
        await typeProductService.deleteType(typeId);
      }
      message.success('Xóa loại sản phẩm thành công');
      handleChange("selectedRowKeys", []);
      handleChange("isDeleteModalVisible", false);
      await fetchTypes(); // Refresh the list
    } catch (error) {
      message.error('Không thể xóa loại sản phẩm');
      console.error('Delete types error:', error);
    }
  };

  const handleAddType = async (values) => {
    try {
      const typeData = {
        MaLoaiSanPham: values.code, // Match the form field name
        TenLoaiSanPham: values.name, // Match the form field name
        MaDVTinh: values.unitCode, // Match the form field name
        PhanTramLoiNhuan: parseInt(values.profitPercentage) // Convert to integer
      };

      await typeProductService.createType(typeData);
      message.success('Thêm loại sản phẩm thành công');
      setIsAddModalVisible(false);
      addTypeForm.resetFields();
      await fetchTypes(); // Refresh the list
    } catch (error) {
      message.error('Lỗi khi thêm loại sản phẩm');
      console.error('Add type error:', error);
    }
  };

  const columns = [
    {
      title: "Mã loại sản phẩm",
      dataIndex: "MaLoaiSanPham",
      key: "MaLoaiSanPham",
      width: "15%",
      align: "center"
    },
    {
      title: "Tên loại sản phẩm",
      dataIndex: "TenLoaiSanPham",
      key: "TenLoaiSanPham",
      width: "25%",
      align: "center"
    },
    {
      title: "Mã đơn vị tính",
      dataIndex: "MaDVTinh",
      key: "MaDVTinh",
      width: "15%",
      align: "center"
    },
    {
      title: "Đơn vị tính",
      dataIndex: "TenDVTinh",
      key: "TenDVTinh",
      width: "25%",
      align: "center"
    },
    {
      title: "Phần trăm lợi nhuận",
      dataIndex: "PhanTramLoiNhuan",
      key: "PhanTramLoiNhuan",
      width: "20%",
      align: "center",
      render: (value) => `${value}%`
    }
  ];

  return (
    <div>
      <div style={{ marginLeft: "270px" }}>
        <Topbar title="Danh sách loại sản phẩm" />
      </div>
      <div className="type-product-page">
        <header className="type-product-header">
          <div className="header-actions">
            <Input.Search
              placeholder="Tìm kiếm loại sản phẩm..."
              value={params.search}
              onChange={(e) => handleChange("search", e.target.value)}
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
              className="add-type-button"
              onClick={() => setIsAddModalVisible(true)}
            >
              Thêm loại sản phẩm
            </Button>
          </div>
        </header>

        <div className="filter-section">
          <div className="filter-button">
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              disabled={params.selectedRowKeys.length === 0}
              onClick={() => handleChange("isDeleteModalVisible", true)}
              className="delete-all-button"
            >
              Xóa đã chọn
            </Button>
          </div>
        </div>

        <Table
          loading={loading}
          rowSelection={{
            selectedRowKeys: params.selectedRowKeys,
            onChange: (selectedRowKeys) => handleChange("selectedRowKeys", selectedRowKeys),
          }}
          columns={columns}
          dataSource={filteredTypes}
          rowKey="MaLoaiSanPham"
          pagination={{ pageSize: 10 }}
          style={{ marginTop: 20 }}
        />

        <Modal
          title="Xác nhận xóa"
          visible={params.isDeleteModalVisible}
          onOk={handleDeleteSelected}
          onCancel={() => handleChange("isDeleteModalVisible", false)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <p>Bạn có chắc chắn muốn xóa loại sản phẩm đã chọn?</p>
        </Modal>

        <Modal
          title="Thêm loại sản phẩm mới"
          visible={isAddModalVisible}
          onCancel={() => setIsAddModalVisible(false)}
          footer={null}
        >
          <Form
            form={addTypeForm}
            layout="vertical"
            onFinish={handleAddType}
          >
            <Form.Item
              name="code"
              label="Mã loại sản phẩm"
              rules={[{ required: true, message: 'Vui lòng nhập mã loại sản phẩm' }]}
            >
              <Input placeholder="Nhập mã loại sản phẩm" />
            </Form.Item>

            <Form.Item
              name="name"
              label="Tên loại sản phẩm"
              rules={[{ required: true, message: 'Vui lòng nhập tên loại sản phẩm' }]}
            >
              <Input placeholder="Nhập tên loại sản phẩm" />
            </Form.Item>

            <Form.Item
              name="unitCode"
              label="Đơn vị tính"
              rules={[{ required: true, message: 'Vui lòng chọn đơn vị tính' }]}
            >
              <Select placeholder="Chọn đơn vị tính">
                {units.map(unit => (
                  <Select.Option key={unit.MaDVTinh} value={unit.MaDVTinh}>
                    {unit.TenDVTinh}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="profitPercentage"
              label="Phần trăm lợi nhuận"
              rules={[
                { required: true, message: 'Vui lòng nhập phần trăm lợi nhuận' },
                {
                  type: 'number',
                  transform: (value) => parseInt(value),
                  min: 0,
                  max: 100,
                  message: 'Phần trăm lợi nhuận phải là số nguyên từ 0-100'
                }
              ]}
            >
              <Input 
                type="number" 
                min={0}
                max={100}
                step={1} // Only allow integer steps
                placeholder="Nhập phần trăm lợi nhuận"
                suffix="%" 
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Tạo mới
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default TypeProductPage;
