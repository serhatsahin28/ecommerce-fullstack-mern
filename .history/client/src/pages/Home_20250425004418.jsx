import React from 'react';
import { Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { FaShoppingCart, FaHeart, FaStar, FaRegStar } from 'react-icons/fa';

/**
 * Temporary ProductList component.
 * Later you can replace this with dynamic data from your database.
 * @param {{ id: number, name: string, price: number, oldPrice?: number, rating: number, image: string, stock: number }[]} props.products
 */
const ProductList = ({ products }) => {
  return (
    <Row className="g-4">
      {products.map((product) => (
        <Col key={product.id} md={6} lg={4} xl={3}>
          <Card className="h-100 border-0 shadow-sm position-relative">
            <div className="position-absolute top-0 end-0 m-2">
              <Button variant="link" className="text-danger p-0">
                <FaHeart size={24} />
              </Button>
            </div>
            <Card.Img
              variant="top"
              src={`/images/${product.image}`} 
              alt={product.name}
              style={{ height: '200px', objectFit: 'contain' }}
              className="p-3"
            />
            <Card.Body>
              <div className="d-flex justify-content-between mb-3">
                <div>
                  {[...Array(5)].map((_, i) => (
                    i < product.rating ? (
                      <FaStar key={i} className="text-warning" />
                    ) : (
                      <FaRegStar key={i} className="text-muted" />
                    )
                  ))}
                </div>
                <Badge bg="success">
                  Stock: {product.stock}
                </Badge>
              </div>
              <Card.Title className="fw-semibold">{product.name}</Card.Title>
              <div className="d-flex align-items-baseline gap-2 mb-3">
                {product.oldPrice && (
                  <del className="text-muted fs-6">
                    {product.oldPrice.toFixed(2)} TL
                  </del>
                )}
                <h4 className="text-danger mb-0">
                  {product.price.toFixed(2)} TL
                </h4>
              </div>
              <Button variant="dark" className="w-100">
                <FaShoppingCart className="me-2" /> Add to Cart
              </Button>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ProductList;
