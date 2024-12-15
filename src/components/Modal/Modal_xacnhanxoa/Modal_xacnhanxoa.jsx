import React from "react";
import { Modal } from "antd";
import "./Modal_xacnhanxoa.css"; // Import CSS

const DeleteConfirmationModal = ({ isVisible, onConfirm, onCancel, order }) => {
  return (
    <Modal
      className="ttcc"
      title="Xác nhận xóa"
      visible={isVisible}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Xóa"
      cancelText="Hủy"
      okButtonProps={{ danger: true }}
    >
      <p className="delete-modal-message">
        Bạn có chắc chắn muốn xóa đơn hàng <strong>{order?.products.name}</strong> có mã đơn hàng là <strong>{order?.id}</strong> không?
      </p>
    </Modal>
  );
};

export default DeleteConfirmationModal;
