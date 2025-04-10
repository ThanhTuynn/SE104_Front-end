
# 💎 Jewelry Store Management System

## 📘 Project Overview

Đây là đồ án cuối kỳ của môn học **SE104 – Nhập môn Công nghệ phần mềm** tại **Trường Đại học Công nghệ Thông tin – ĐHQG TP.HCM**.  
Đề tài hướng tới việc xây dựng một **hệ thống quản lý cửa hàng vàng bạc đá quý**, giúp tối ưu hóa các quy trình kinh doanh như: bán hàng, nhập hàng, quản lý dịch vụ, kho, khách hàng và báo cáo.

## 👨‍🏫 Instructor

- TS. Đỗ Thị Thanh Tuyền

## 👥 Team Members – Nhóm 12

| Họ và tên                  | MSSV       |
|---------------------------|------------|
| Trần Quốc Trung           | 22521569   |
| Nguyễn Lê Thanh Huyền     | 22520590   |
| Nguyễn Ngọc Thanh Tuyền   | 22521631   |
| Võ Thị Phương Uyên        | 22521645   |
| Nguyễn Minh Bảo           | 23520123   |

## 🧩 Key Features

- 🧾 Quản lý phiếu bán hàng, mua hàng, và dịch vụ
- 📦 Theo dõi tồn kho, xuất nhập hàng hóa
- 🧑‍🤝‍🧑 Quản lý thông tin khách hàng
- 📊 Xuất báo cáo kinh doanh và tồn kho
- 🔐 Phân quyền người dùng (Admin, nhân viên, thủ kho)
- 📁 Nhập/xuất dữ liệu bằng file Excel
- ❌ Không cho phép xóa/sửa phiếu sau khi lập
- ♻️ Hỗ trợ khôi phục dữ liệu đã xoá

## 🛠️ Technologies Used

- Ngôn ngữ lập trình: JavaScript / HTML / CSS
- Backend: Node.js + Express
- Database: MySQL
- Kiến trúc: 3 lớp (Client - Web Server - Database Server)
- Mô hình phát triển: Waterfall
- Kỹ thuật: Lập trình hướng đối tượng (OOP)

## ⚙️ System Architecture

```
Client (Browser: Chrome/Firefox)
   ↕️ (HTTP)
Web Server (Node.js + Express)
   ↕️ (SQL)
Database Server (MySQL)
```

## 💽 Installation Guide

### 💻 Yêu cầu hệ thống
- Node.js >= v16
- MySQL >= 8.0
- Trình duyệt web hiện đại (Chrome/Edge)
- Bộ công cụ văn phòng hỗ trợ Excel

### 🔧 Cách cài đặt

1. Clone repo về máy:
```bash
git clone https://github.com/<your-username>/jewelry-store-management.git
cd jewelry-store-management
```

2. Cài đặt dependencies (nếu dùng Node.js)
```bash
npm install
```

3. Tạo database và import file `schema.sql` trong thư mục `/database`

4. Cập nhật file `.env` cấu hình thông tin DB

5. Chạy server:
```bash
npm start
```

6. Mở trình duyệt và truy cập `http://localhost:3000`

## 🧪 Testing

- Kiểm thử đơn vị (unit test): các hàm xử lý dữ liệu
- Kiểm thử tích hợp: quy trình bán hàng – tồn kho – báo cáo
- Kiểm thử hệ thống: kiểm tra toàn bộ chức năng qua giao diện người dùng
- Dữ liệu demo có sẵn để test: `data/demo_data.xlsx`

## 🧠 Achievements

- Giao diện trực quan, dễ sử dụng
- Hoàn thành đầy đủ các chức năng quản lý nghiệp vụ
- Tích hợp bảo mật và phân quyền chi tiết
- Hỗ trợ xuất nhập dữ liệu linh hoạt

## 🌱 Future Development

- Tích hợp quét mã vạch
- Thêm chức năng thanh toán điện tử
- Giao diện tương thích thiết bị di động
- Phân tích dữ liệu và gợi ý nhập hàng thông minh
- Kết nối chuỗi cửa hàng nhiều chi nhánh

## 📚 References

- Giáo trình môn Nhập môn Công nghệ phần mềm – UIT
- Hướng dẫn sử dụng MySQL và Node.js
- Tài liệu kỹ thuật thiết kế hệ thống 3 lớp
- [W3Schools](https://www.w3schools.com/) – HTML, CSS, JS basics

## 📄 License

This project is licensed for academic and educational use only.
