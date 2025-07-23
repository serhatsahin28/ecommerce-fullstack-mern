// src/components/ProductTable.jsx

export default function ProductTable({ products, onEdit }) {
  return (
    <table className="table table-striped">
      <thead>
        <tr>
          <th>Ad</th>
          <th>Fiyat</th>
          <th>İşlem</th>
        </tr>
      </thead>
      <tbody>
        {products.map((p) => (
          <tr key={p.id}>
            <td>{p.name}</td>
            <td>{p.price} ₺</td>
            <td>
              <button
                className="btn btn-sm btn-warning"
                onClick={() => onEdit(p)}
              >
                Düzenle
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ProductTable;
