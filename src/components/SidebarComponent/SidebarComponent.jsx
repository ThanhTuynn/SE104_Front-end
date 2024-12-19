import React, { useState } from "react";
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
import { Link } from "react-router-dom";
import logo from '../../assets/logo.png'
import "./SidebarComponent.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import { message } from 'antd';

const SidebarComponent = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    message.success('Đăng xuất thành công');
    navigate('/', { replace: true });
  };

  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <div onClick={() => handleNavigation('/dashboard')} className="header-logo" style={{ cursor: 'pointer' }}>
          <img src={logo} alt="BUTTH Luxury Jewery" />
        </div>
      </header>
      <nav className="sidebar-nav">
        <ul className="nav-list primary-nav">
          <li>
            <div onClick={() => handleNavigation('/dashboard')} className="nav-link" style={{ cursor: 'pointer' }}>
              <DashboardOutlined />
              <span>Dashboard</span>
            </div>
          </li>
          <li>
            <div onClick={() => handleNavigation('/list-product')} className="nav-link" style={{ cursor: 'pointer' }}>
              <AppstoreOutlined />
              <span>Quản lý kho</span>
            </div>
          </li>
          <li>
            <div onClick={() => handleNavigation('/list-order-product')} className="nav-link" style={{ cursor: 'pointer' }}>
              <FileAddOutlined />
              <span>Quản lý phiếu bán hàng</span>
            </div>
          </li>
          <li>
            <div onClick={() => handleNavigation('/list-import-product')} className="nav-link" style={{ cursor: 'pointer' }}>
              <ShoppingCartOutlined />
              <span>Quản lý phiếu mua hàng</span>
            </div>
          </li>
          <li>
            <div onClick={() => handleNavigation('/list-service')} className="nav-link" style={{ cursor: 'pointer' }}>
              <FileOutlined />
              <span>Quản lý phiếu dịch vụ</span>
            </div>
          </li>
          <li>
            <div onClick={() => handleNavigation('/list-customer')} className="nav-link" style={{ cursor: 'pointer' }}>
              <TeamOutlined />
              <span>Quản lý khách hàng</span>
            </div>
          </li>
          <li>
            <div onClick={() => handleNavigation('/list-employee')} className="nav-link" style={{ cursor: 'pointer' }}>
              <UserOutlined />
              <span>Quản lý nhân viên</span>
            </div>
          </li>
        </ul>
        <ul className="nav-list secondary-nav">
          <li>
            <div onClick={() => handleNavigation('/personalinfopage')} className="nav-link" style={{ cursor: 'pointer' }}>
              <UserOutlined />
              <span>Cá nhân</span>
            </div>
          </li>
          <li>
            <div onClick={handleLogout} className="nav-link" style={{ cursor: 'pointer' }}>
              <LogoutOutlined />
              <span>Đăng xuất</span>
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default SidebarComponent;
