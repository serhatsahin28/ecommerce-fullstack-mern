// components/admin/ProductsHeader.jsx
import React from 'react';
import { Form, Button } from 'react-bootstrap';

const ProductsHeader = ({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  categories
}) => {
  return (
    <>
      <h3 className="mb-4">Ürün Yönetimi</h3>
      <Form className="d-flex mb-3 gap-2 flex-wrap">
        <Form.Control
          type="text"
          placeholder="Ürün adı ara..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ maxWidth: '300px' }}
        />
        <Form.Select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          style={{ maxWidth: '200px' }}
        >
          <option value="">Tüm Kategoriler</option>
          {categories.map(cat => (
            <option key={cat.key} value={cat.key}>
              {cat.label}
            </option>
          ))}
        </Form.Select>
        <Link to="/urun-ekle" className="ms-auto">
          <Button variant="primary">
            + Yeni Ürün Ekle
          </Button>
        </Link>
      </Form>
    </>
  );
};

export default ProductsHeader;