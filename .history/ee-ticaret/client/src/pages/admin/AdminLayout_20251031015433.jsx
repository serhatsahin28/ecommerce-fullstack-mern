import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { FaHome, FaBox, FaSignOutAlt, FaClipboardList, FaUser, FaBars } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin');
  };

  const menuItems = [
    { icon: <FaHome />, label: 'Anasayfa', path: '/admin' },
    { icon: <FaClipboardList />, label: 'Siparişler', path: '/admin/ordersAdmin' },
    { icon: <FaBox />, label: 'Tüm Ürünler', path: '/admin/products' },
    { icon: <FaUser />, label: 'Kullanıcılar', path: '/admin/usersAll' },
  ];

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-light bg-white shadow-sm px-3 fixed-top d-flex justify-content-between">
        <span className="navbar-brand mb-0 h5">Admin Dashboard</span>
        <button className="btn btn-outline-dark d-md-none" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <FaBars />
        </button>
      </nav>

      {/* Sidebar */}
      <div
        className={`bg-dark text-white position-fixed top-0 start-0 h-100 p-3 ${sidebarOpen ? 'd-block' : 'd-none d-md-block'}`}
        style={{
          width: '220px',
          zIndex: 1050,
          transition: 'transform 0.3s',
          transform: sidebarOpen || window.innerWidth >= 768 ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        <h4 className="text-center mb-4 mt-5">Yönetici Paneli</h4>
        <ul className="nav flex-column">
          {menuItems.map((item, index) => (
            <li key={index} className="nav-item mb-2">
              <button
                className="btn btn-dark w-100 text-start d-flex align-items-center gap-2"
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
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

      {/* Overlay (mobilde) */}
      {sidebarOpen && window.innerWidth < 768 && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Content */}
      <div
        className="flex-grow-1 bg-light"
        style={{
          marginLeft: window.innerWidth >= 768 ? '220px' : '0',
          marginTop: '56px',
          minHeight: '100vh',
          transition: 'margin-left 0.3s',
        }}
      >
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
