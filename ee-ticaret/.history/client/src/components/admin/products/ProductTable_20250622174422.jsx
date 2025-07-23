import React from 'react';
import { Table, Button, Image } from 'react-bootstrap';

const ProductTable = ({ filteredProducts, categories, handleEditClick, handleDeleteClick }) => {
  return (
    <Table bordered hover responsive>
      <thead className="table-dark">
        <tr>
          <th>Resim</th>
          <th>Ürün Adı (TR)</th>
          <th>Ürün Adı (EN)</th>
          <th>Kategori</th>
          <th>Fiyat ($)</th>
          <th>Puan</th>
          <th>İşlemler</th>
        </tr>
      </thead>
      <tbody>
        {filteredProducts.length === 0 ? (
          <tr><td colSpan="7" className="text-center">Arama kriterlerine uygun ürün bulunamadı.</td></tr>
        ) : (
          filteredProducts.map(product => (
            <tr key={product._id}>
              <td style={{ width: '100px' }}>
                <Image src={product.image} thumbnail alt={product.translations.en.name} />
              </td>
              <td>{product.translations.tr.name}</td>
              <td>{product.translations.en.name}</td>
              <td>{categories.find(c => c.key === product.category_key)?.label || product.category_key}</td>
              <td>{product.price.toFixed(2)}</td>
              <td>{product.rating.toFixed(1)}</td>
              <td>
                <Button size="sm" variant="warning" className="me-2" onClick={() => handleEditClick(product)}>Düzenle</Button>
                <Button size="sm" variant="danger" onClick={() => handleDeleteClick(product)}>Sil</Button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );
};

export default ProductTable;
