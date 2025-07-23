// src/components/ProductModal.jsx

import { Modal } from "react-bootstrap";
import ProductForm from "./ProductForm";

export default function ProductModal({ show, onHide, product, onSave }) {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{product ? "Ürünü Düzenle" : "Yeni Ürün"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ProductForm
          product={product}
          onSave={onSave}
          onCancel={onHide}
        />
      </Modal.Body>
    </Modal>
  );
}
