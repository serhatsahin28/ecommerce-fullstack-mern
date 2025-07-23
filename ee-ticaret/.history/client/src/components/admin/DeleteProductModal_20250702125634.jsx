import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DeleteProductModal from './DeleteProductModal';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Ürünler alınamadı:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setDeleting(true);
    try {
      const response = await axios.delete(`/api/products/${productToDelete._id}`);

      console.log("Silinen ürün:", response.data.product);

      // Frontend state'ten ürünü çıkar
      setProducts(prev =>
        prev.filter(p => p._id !== productToDelete._id)
      );

      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (err) {
      console.error("Ürün silinemedi:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <h2>Ürün Listesi</h2>
      <ul>
        {products.map(product => (
          <li key={product._id}>
            {product.translations.tr.name}
            <button onClick={() => handleDeleteClick(product)}>Sil</button>
          </li>
        ))}
      </ul>

      <DeleteProductModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        productToDelete={productToDelete}
        deleting={deleting}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default AdminProducts;
