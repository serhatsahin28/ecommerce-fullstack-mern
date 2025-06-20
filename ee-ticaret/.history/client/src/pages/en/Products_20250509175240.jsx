import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProductList from '../../components/product/ProductList'; // Ürün listeleme bileşeni
import { Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

export default function Products() {
  const { t } = useTranslation('common');

  // Dummy ürün verileri
  const dummyProducts = [
    { id: 1, name: 'Phone', price: 500, category: 'electronics' },
    { id: 2, name: 'T-Shirt', price: 25, category: 'fashion' },
    { id: 3, name: 'Laptop', price: 1000, category: 'electronics' },
    { id: 4, name: 'Coffee Mug', price: 15, category: 'home' },
    { id: 5, name: 'Book', price: 20, category: 'books' },
  ];

  // State: Arama ve filtreleme için
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(dummyProducts);

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

  return (
    <div className="container py-4">
      <h2>{t('products.title')}</h2>

      {/* Arama ve Kategori Filtreleme */}
      <Row className="mb-4">
        <Col md={8} className="d-flex">
          <InputGroup className="flex-grow-1">
            <Form.Control
              type="text"
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="danger" onClick={handleSearch}>
              <FaSearch />
            </Button>
          </InputGroup>
        </Col>

        <Col md={4}>
          <div className="d-flex justify-content-between">
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

      {/* Ürün Listeleme */}
      <ProductList products={filteredProducts} />
    </div>
  );
}
