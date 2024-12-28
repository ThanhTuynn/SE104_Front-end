import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { updateUnitType } from '../../../services/UnitTypeService';

const EditUnitTypeModal = ({ isVisible, onClose, initialData, unitTypes = [] }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Update form values when initialData changes
  useEffect(() => {
    if (isVisible && initialData) {
      console.log('Initial Data:', initialData); // Thêm log để debug
      form.setFieldsValue({
        MaDonVi: initialData.id, // Đổi từ id sang MaDonVi
        TenDonVi: initialData.name // Đổi từ name sang TenDonVi
      });
    }
  }, [isVisible, initialData, form]);

  useEffect(() => {
    // Log ra form values mỗi khi form thay đổi
    console.log('Form values:', form.getFieldsValue());
  }, [form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Kiểm tra tên đơn vị tính trùng, loại trừ chính nó
      const duplicateName = unitTypes.find(
        unit => unit.id !== values.MaDonVi && // Bỏ qua chính nó
          unit.TenDonVi.toLowerCase().trim() === values.TenDonVi.toLowerCase().trim()
      );
      if (duplicateName) {
        message.error('Tên đơn vị tính đã được sử dụng!');
        return;
      }

      await updateUnitType(initialData.MaDonVi, {
        MaDonVi: values.MaDonVi,
        TenDonVi: values.TenDonVi.trim()
      });

      message.success('Cập nhật đơn vị tính thành công');
      onClose(true);
    } catch (error) {
      if (error.message?.includes('duplicate')) {
        message.error('Tên đơn vị tính đã tồn tại!');
      } else {
        message.error('Mã hoặc tên đơn vị tính đã tồn tại!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Sửa đơn vị tính"
      visible={isVisible}     // Add this line
      open={isVisible}       // Keep this for compatibility
      destroyOnClose={true}
      maskClosable={false}
      keyboard={false}       // Add this to prevent Esc key closing
      centered={true}        // Add this for better positioning
      width={500}
      onOk={handleSubmit}
      onCancel={onClose}
      okText="Lưu"
      cancelText="Hủy"
      confirmLoading={loading}
      zIndex={1001}         // Add this to ensure modal appears on top
    >
      <Form 
        form={form}
        layout="vertical"
        initialValues={initialData}
        onValuesChange={(_, allValues) => {
          console.log('Form changed:', allValues); // Thêm log để debug
        }}
      >
        <Form.Item
          name="MaDonVi" // Đổi từ id sang MaDonVi
          label="Mã đơn vị tính"
          rules={[
            { required: true, message: 'Vui lòng nhập mã đơn vị tính' },
            { max: 50, message: 'Mã đơn vị tính không được vượt quá 50 ký tự' }
          ]}
        >
          <Input maxLength={100} placeholder="Nhập mã đơn vị tính" />
        </Form.Item>

        <Form.Item
          name="TenDonVi" // Đổi từ name sang TenDonVi
          label="Tên đơn vị tính"
          rules={[
            { required: true, message: 'Vui lòng nhập tên đơn vị tính' },
            { max: 100, message: 'Tên đơn vị tính không được vượt quá 100 ký tự' }
          ]}
        >
          <Input maxLength={100} placeholder="Nhập tên đơn vị tính" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditUnitTypeModal;
