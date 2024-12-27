import React, { useState, useEffect } from "react";
import { Input, Button, DatePicker, Form, Table, message, Spin } from "antd";
import "./DetailImportProduct.css";
import { useNavigate, useParams } from "react-router-dom";
import importProduct from "../../services/importProduct";

const DetailImportOrder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [purchaseData, setPurchaseData] = useState(null);

  useEffect(() => {
    const fetchPurchaseDetail = async () => {
      try {
        setLoading(true);
        const data = await importProduct.getPurchaseById(id);
        console.log('Raw API response:', data); // Debug log

        // Validate data before processing
        if (!data) {
          throw new Error('Không có dữ liệu phiếu mua hàng');
        }

        setPurchaseData({
          id: data.SoPhieu,
          date: new Date(data.NgayLap).toLocaleDateString('vi-VN'),
          provider: {
            id: data.NhaCungCap?.MaNCC || 'N/A',
            name: data.NhaCungCap?.TenNCC || 'N/A',
            phone: data.NhaCungCap?.SoDienThoai || 'N/A',
            address: data.NhaCungCap?.DiaChi || 'N/A'
          },
          products: data.ChiTietPhieuMua?.map(item => ({
            code: item.MaChiTietMH,        // Từ CHITIETPHIEUMUAHANG
            productCode: item.MaSanPham,    // Mã sản phẩm từ bảng SANPHAM
            name: item.SanPham?.TenSanPham, // Tên sản phẩm từ bảng SANPHAM
            quantity: item.SoLuong,         // Số lượng từ CHITIETPHIEUMUAHANG
            price: item.DonGia,            // Đơn giá từ CHITIETPHIEUMUAHANG
            total: item.ThanhTien          // Thành tiền từ CHITIETPHIEUMUAHANG
          })) || [],
          totalAmount: data.TongTien
        });
      } catch (error) {
        message.error("Không thể tải thông tin phiếu mua hàng");
        console.error("Fetch purchase detail error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseDetail();
  }, [id]);

  const handleCancel = () => {
    navigate(-1);
  };

  const columns = [
    { 
      title: 'Mã sản phẩm',
      dataIndex: 'productCode',
      key: 'productCode',
    },
    { 
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name'
    },
    { 
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right'
    },
    { 
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (price) => new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price)
    },
    { 
      title: 'Thành tiền',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      render: (total) => new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(total)
    }
  ];

  if (loading) {
    return <div className="loading-container"><Spin size="large" /></div>;
  }

  return (
    <div className="product-detail">
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Chi tiết phiếu mua hàng - Mã đơn: {purchaseData?.id}</h2>
        <Button danger onClick={handleCancel}>
          Thoát
        </Button>
      </header>

      <div className="form-container">
        <div className="form-section">
          <h3>Nhà cung cấp</h3>
          <p>Tên: {purchaseData?.provider.name}</p>
          <p>Số điện thoại: {purchaseData?.provider.phone}</p>
          <p>Địa chỉ: {purchaseData?.provider.address}</p>
        </div>

        <div className="form-section">
          <h3>Sản phẩm</h3>
          <Table 
            dataSource={purchaseData?.products} 
            columns={columns} 
            rowKey="code" 
            pagination={false}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={4} index={0}>Tổng cộng</Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                      .format(purchaseData?.totalAmount)}
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default DetailImportOrder;