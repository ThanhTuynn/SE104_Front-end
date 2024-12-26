import React, { useState, useEffect } from "react";
import { Table, Button, Input, Modal, message } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import Topbar from "../../components/TopbarComponent/TopbarComponent";
import AddUnitTypeModal from "../../components/Modal/Modal_unittype/AddUnitTypeModal";
import EditUnitTypeModal from "../../components/Modal/Modal_unittype/EditUnitTypeModal";
import "./Unittypeproduct.css";
import { getAllUnitTypes, deleteUnitType } from '../../services/UnitTypeService';

const Unittypeproduct = () => {
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState({
    selectedUnits: [],
    data: [
    ],
    isModalVisible: false,
  });
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const handleChange = (key, value) => {
    setState((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddModalClose = (shouldRefresh) => {
    setIsAddModalVisible(false);
    if (shouldRefresh) {
      fetchUnitTypes();
    }
  };

  const handleRowClick = (record) => {
    console.log('Row clicked:', record);
    const unitData = {
      id: record.id,
      name: record.name
    };
    setSelectedUnit(unitData);
    setIsEditModalVisible(true);
  };

  const handleEditModalClose = (shouldRefresh) => {
    setIsEditModalVisible(false);
    setSelectedUnit(null);
    if (shouldRefresh) {
      fetchUnitTypes();
    }
  };

  const fetchUnitTypes = async () => {
    try {
      setLoading(true);
      const response = await getAllUnitTypes();
      const formattedData = response.data.map(unit => ({
        id: unit.MaDVTinh,
        name: unit.TenDVTinh
      }));
      setState(prev => ({
        ...prev,
        data: formattedData
      }));
    } catch (error) {
      message.error('Không thể tải danh sách đơn vị tính');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnitTypes();
  }, []);

  const handleDelete = async () => {
    try {
      setLoading(true);
      for (const id of state.selectedUnits) {
        await deleteUnitType(id);
      }
      message.success('Xóa đơn vị tính thành công');
      setState(prev => ({
        ...prev,
        isModalVisible: false,
        selectedUnits: []
      }));
      fetchUnitTypes();
    } catch (error) {
      message.error('Không thể xóa đơn vị tính');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = state.data.filter(item =>
    item.id.toLowerCase().includes(searchText.toLowerCase()) ||
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Mã đơn vị tính",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Tên đơn vị tính",
      dataIndex: "name",
      key: "name",
    }
  ];

  return (
    <div>
      <div style={{ marginLeft: "270px" }}>
        <Topbar title="Quản lý đơn vị tính" />
      </div>

      <div className="unit" style={{ marginLeft: "270px", padding: "20px", position: "relative" }}>
        <header className="order-header">
          <div className="header-actions">
            <Input.Search
              placeholder="Tìm kiếm đơn vị tính..."
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="add-product-button"
              onClick={() => setIsAddModalVisible(true)}
            >
              Thêm đơn vị tính
            </Button>
          </div>
        </header>

        <div className="filter-section">
          <div className="filter-button">
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={state.selectedUnits.length === 0}
              onClick={() => handleChange("isModalVisible", true)}
              className="delete-all-button"
            >
              Xóa đã chọn
            </Button>
          </div>
        </div>

        <Table
          loading={loading}
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' }
          })}
          rowSelection={{
            selectedRowKeys: state.selectedUnits,
            onChange: (selectedRowKeys) =>
              handleChange("selectedUnits", selectedRowKeys),
          }}
          pagination={{ pageSize: 5 }}
        />

        <Modal
          title="Xác nhận xóa"
          visible={state.isModalVisible}
          onOk={handleDelete}
          onCancel={() => handleChange("isModalVisible", false)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <p>Bạn có chắc chắn muốn xóa những đơn vị tính đã chọn?</p>
        </Modal>

        <AddUnitTypeModal 
          isVisible={isAddModalVisible}
          onClose={handleAddModalClose}
        />

      </div>

      <EditUnitTypeModal 
        isVisible={isEditModalVisible}
        onClose={() => {
          setIsEditModalVisible(false);
          setSelectedUnit(null);
        }}
        initialData={selectedUnit}
      />

    </div>
  );
};

export default Unittypeproduct;
