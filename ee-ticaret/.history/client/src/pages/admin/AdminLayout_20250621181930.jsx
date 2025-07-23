    import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { FaHome, FaBox, FaSignOutAlt, FaClipboardList, FaUser } from 'react-icons/fa';
import './AdminLayout.css'; // Tasarım için stil dosyası

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin'); // Giriş ekranı yapılacaksa burası değişebilir
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h4>Admin Panel</h4>
        </div>
        <ul className="sidebar-menu">
          <li onClick={() => navigate('/admin')}>
            <FaHome /> <span>Dashboard</span>
          </li>
          <li onClick={() => navigate('/admin/orders')}>
            <FaClipboardList /> <span>Orders</span>
          </li>
          <li onClick={() => navigate('/admin/products')}>
            <FaBox /> <span>Products</span>
          </li>
          <li onClick={() => navigate('/admin/users')}>
            <FaUser /> <span>Users</span>
          </li>
          <li onClick={handleLogout}>
            <FaSignOutAlt /> <span>Logout</span>
          </li>
        </ul>
      </aside>

      <div className="admin-content">
        <header className="admin-header">
          <h5 className="m-0">Admin Dashboard</h5>
        </header>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
