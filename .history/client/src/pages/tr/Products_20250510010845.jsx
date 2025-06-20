import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProductList from '../../components/product/ProductList';
import { Row, Col, Form, Button, InputGroup, Dropdown } from 'react-bootstrap';
import { FaSearch, FaUndo, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

export default function Products() {
  const { t } = useTranslation('product');

  const dummyProducts = [
    { id: 1, name: 'Phone', price: 500, category: 'electronics' },
    { id: 2, name: 'T-Shirt', price: 25, category: 'fashion' },
    { id: 3, name: 'Laptop', price: 1000, category: 'electronics' },
    { id: 4, name: 'Coffee Mug', price: 15, category: 'home' },
    { id: 5, name: 'Book', price: 20, category: 'books' },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(dummyProducts);
  const [sortOrder, setSortOrder] = useState(null);

  const handleSearch = () => {
    const result = dummyProducts.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(result);
  };

  const handleCategoryFilter = (category) => {
    const result = dummyProducts.filter(product => product.category === category);
    setFilteredProducts(result);
  };

  const handleSort = (order) => {
    const sorted = [...filteredProducts].sort((a, b) =>
      order === 'asc' ? a.price - b.price : b.price - a.price
    );
    setFilteredProducts(sorted);
    setSortOrder(order);
  };

  const handleReset = () => {
    setFilteredProducts(dummyProducts);
    setSearchQuery('');
    setSortOrder(null);
  };

  return (
    <div className="container py-4">
      <h2>{t('title')}</h2>

      {/* Arama, Kategori, Sıralama ve Reset */}
      <Row className="mb-4">
        <Col md={6} className="mb-2">
          <InputGroup>
            <Form.Control
              type="text"
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="primary" onClick={handleSearch}>
              <FaSearch />
            </Button>
          </InputGroup>
        </Col>

        <Col md={6} className="d-flex justify-content-end align-items-start gap-2">
          <Dropdown>
            <Dropdown.Toggle variant="secondary">
              {t('sort')}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleSort('asc')}>
                <FaSortAmountUp className="me-2" /> {t('priceLowToHigh')}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleSort('desc')}>
                <FaSortAmountDown className="me-2" /> {t('priceHighToLow')}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button variant="warning" onClick={handleReset}>
            <FaUndo className="me-2" /> {t('reset')}
          </Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <div className="d-flex gap-2 flex-wrap">
            <Button variant="outline-dark" onClick={() => handleCategoryFilter('electronics')}>
              {t('categories.electronics')}
            </Button>
            <Button variant="outline-dark" onClick={() => handleCategoryFilter('fashion')}>
              {t('categories.fashion')}
            </Button>
            <Button variant="outline-dark" onClick={() => handleCategoryFilter('home')}>
              {t('categories.home')}
            </Button>
            <Button variant="outline-dark" onClick={() => handleCategoryFilter('books')}>
              {t('categories.books')}
            </Button>
          </div>
        </Col>
      </Row>

      <ProductList products={filteredProducts} />
    </div>
  );
}
