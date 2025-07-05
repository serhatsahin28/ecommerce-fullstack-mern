// src/components/ProductFilter.jsx

export default function ProductFilter({ onFilter }) {
  return (
    <input
      type="text"
      className="form-control my-2"
      placeholder="Ürün adına göre filtrele"
      onChange={(e) => onFilter(e.target.value)}
    />
  );
}
