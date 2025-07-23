// components/admin/DeleteProductModal.jsx
import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';

const DeleteProductModal = ({ 
  show, 
  onHide, 
  productToDelete, 
  deleting, 
  onConfirmDelete 
}) => {
  return (
    <Modal show={show} onHide={onHide} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Ürünü Sil</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {productToDelete && (
          <p>
            "<strong>{productToDelete.translations.tr.name}</strong>" ürününü silmek istediğinizden emin misiniz?
          </p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={deleting}>
          İptal
        </Button>
        <Button variant="danger" onClick={onConfirmDelete} disabled={deleting}>
          {deleting ? <Spinner animation="border" size="sm" /> : 'Sil'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteProductModal;