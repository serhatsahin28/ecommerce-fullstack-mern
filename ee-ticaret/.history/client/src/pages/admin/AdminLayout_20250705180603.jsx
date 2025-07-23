import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  FaHome, FaBox, FaSignOutAlt, FaClipboardList, FaUser
} from 'react-icons/fa';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin');
  };

  const menuItems = [
    { icon: <FaHome />, label: 'Anasayfa', path: '/admin' },
    { icon: <FaClipboardList />, label: 'Siparişler', path: '/admin/orders' },
    { icon: <FaBox />, label: 'Tüm Ürünler', path: '/admin/products' },
    { icon: <FaUser />, label: 'Kullanıcılar', path: '/admin/users' },
  ];

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className="bg-dark text-white p-3" style={{ width: '220px' }}>
        <h4 className="text-center mb-4">Yönetici Panel</h4>
        <ul className="nav flex-column">
          {menuItems.map((item, index) => (
            <li key={index} className="nav-item mb-2">
              <button
                className="btn btn-dark w-100 text-start d-flex align-items-center gap-2"
                onClick={() => navigate(item.path)}
              >
                {item.icon} <span>{item.label}</span>
              </button> 
            </li>
          ))}
          <li className="nav-item mt-4">
            <button
              className="btn btn-outline-light w-100 d-flex align-items-center gap-2"
              onClick={handleLogout}
            >
              <FaSignOutAlt /> <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Content */}
      <div className="flex-grow-1 bg-light">
        <nav className="navbar navbar-light bg-white shadow-sm px-4">
          <span className="navbar-brand mb-0 h5">Admin Dashboard</span>
        </nav>
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
