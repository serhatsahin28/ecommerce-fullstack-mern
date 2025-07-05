// src/components/ProductPagination.jsx

export default function ProductPagination({
  total,
  currentPage,
  itemsPerPage,
  onPageChange,
}) {
  const pageCount = Math.ceil(total / itemsPerPage);
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <nav>
      <ul className="pagination">
        {pages.map((page) => (
          <li
            key={page}
            className={`page-item ${page === currentPage ? "active" : ""}`}
          >
            <button className="page-link" onClick={() => onPageChange(page)}>
              {page}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
