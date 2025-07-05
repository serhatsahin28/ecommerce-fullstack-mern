import React from 'react';

const ProductList = ({ products }) => {
  if (products.length === 0) {
    return <div>Arama kriterlerine uygun ürün bulunamadı.</div>;
  }

  return (
    <table border="1" cellPadding="10" style={{width: '100%', borderCollapse: 'collapse'}}>
      <thead>
        <tr>
          <th>Ürün Adı (TR)</th>
          <th>Ürün Adı (EN)</th>
          <th>Kategori</th>
          <th>Fiyat ($)</th>
        </tr>
      </thead>
      <tbody>
        {products.map(p => (
          <tr key={p._id}>
            <td>{p.translations?.tr?.name}</td>
            <td>{p.translations?.en?.name}</td>
            <td>{p.category_key}</td>
            <td>{p.price.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ProductList;
