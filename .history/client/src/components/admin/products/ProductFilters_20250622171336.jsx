import React from 'react';

const ProductFilters = ({ searchTerm, setSearchTerm, categoryFilter, setCategoryFilter }) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <input
        type="text"
        placeholder="Ürün adı ara..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{ marginRight: '10px', padding: '5px' }}
      />

      <select
        value={categoryFilter}
        onChange={e => setCategoryFilter(e.target.value)}
        style={{ padding: '5px' }}
      >
        <option value="">Tüm Kategoriler</option>
        <option value="Elektronik">Elektronik</option>
        <option value="Kitap">Kitap</option>
        <option value="Giyim">Giyim</option>
        {/* Kategori seçeneklerini ihtiyacınıza göre genişletin */}
      </select>
    </div>
  );
};

export default ProductFilters;
