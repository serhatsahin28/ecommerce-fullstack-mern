import React from 'react';

const categories = [
  { key: 'electronics', label: 'Elektronik' },
  { key: 'fashion', label: 'Giyim' },
  { key: 'books', label: 'Kitap' },
  { key: 'home_office', label: 'Ev & Ofis' },
];

const ProductFilters = ({ searchTerm, setSearchTerm, categoryFilter, setCategoryFilter }) => {
  return (
    <div style={{ marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <input
        type="text"
        placeholder="Ürün adı ara..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{ flex: 1, minWidth: 200, padding: '6px 10px' }}
      />
      <select
        value={categoryFilter}
        onChange={e => setCategoryFilter(e.target.value)}
        style={{ minWidth: 150, padding: '6px 10px' }}
      >
        <option value="">Tüm Kategoriler</option>
        {categories.map(cat => (
          <option key={cat.key} value={cat.key}>
            {cat.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProductFilters;
