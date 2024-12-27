import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { updateUnitType } from '../../../services/UnitTypeService';

const EditUnitTypeModal = ({ isVisible, onClose, initialData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Update form values when initialData changes
  useEffect(() => {
    if (isVisible && initialData) {
      form.setFieldsValue({
        id: initialData.id,
        name: initialData.name
      });
    }
  }, [isVisible, initialData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      await updateUnitType(initialData.id, {
        id: values.id,
        name: values.name
      });

      message.success('Cập nhật đơn vị tính thành công');
      onClose(true); // Pass true to trigger data refresh
    } catch (error) {
      console.error('Error updating unit:', error);
      message.error(error.message || 'Có lỗi xảy ra khi cập nhật đơn vị tính');
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
      >
        <Form.Item
          name="id"
          label="Mã đơn vị tính"
          rules={[
            { required: true, message: 'Vui lòng nhập mã đơn vị tính' },
            { max: 50, message: 'Mã đơn vị tính không được vượt quá 50 ký tự' }
          ]}
        >
          <Input disabled style={{ background: '#f5f5f5' }} /> {/* Add disabled prop and gray background */}
        </Form.Item>

        <Form.Item
          name="name"
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
