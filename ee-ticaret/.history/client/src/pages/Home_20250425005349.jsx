import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import Home from './Home';
import Shop from './Shop';
// ... diğer sayfalar

function App() {
  return (
    <Routes>
      {/* Ana yönlendirme */}
      <Route path="/" element={<Navigate to="/tr/home" replace />} />

      {/* Dil parametreli ana layout */}
      <Route path="/:lng" element={<Layout />}>
        {/* Bu rotalar dinamik dil parametresi ile çalışacak */}
        <Route path="/shop" element={<Shop />} />
        {/* diğer sayfalar */}
      </Route>

      {/* Yıldızlı rota, tüm rotaları kapsar */}
      <Route path="*" element={<Navigate to="/tr/home" replace />} />
    </Routes>
  );
}

export default App;
