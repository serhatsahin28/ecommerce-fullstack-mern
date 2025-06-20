// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import '../i18n/config';
import Layout from './components/Layout/Layout';
import Shop from './pages/Shop';
// ... diğer sayfalar

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/tr/home" replace />} />
        <Route path="/:lng" element={<Layout />}>
          <Route path="home" element={<Home />} />
          <Route path="shop" element={<Shop />} />
          {/* diğer sayfalar */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
