import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ProductList from '../../components/product/ProductList';
import { Container, Row, Col, Form, Button, InputGroup, Spinner, Alert, DropdownButton, Dropdown } from 'react-bootstrap';
import { FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

// Dummy veri yükleme fonksiyonu (Gerçek uygulamada API çağrısı olur)
// i18next namespace'den ürünleri çek
const fetchProductsFromI18n = (tFunction, lang) => {
  // 'products' namespace'inden 'items' array'ini ve 'categories' objesini al
  const items = tFunction('items', { ns: 'products', returnObjects: true, lng: lang });
  const categoriesMap = tFunction('categories', { ns: 'products', returnObjects: true, lng: lang });
  
  // Kategorileri items'a ekleyelim (translated name)
  return items.map(item => ({
    ...item,
    category_name: categoriesMap[item.category_key] || item.category_key // Çevrilmiş kategori adı
  }));
};


export default function Products() {
  const { t, i18n } = useTranslation(['common', 'products']); // 'common' ve 'products' namespace'leri

  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' veya kategori_key
  const [sortBy, setSortBy] = useState('default'); // 'default', 'price_asc', 'price_desc', 'name_asc', 'name_desc'

  // Ürünleri ve kategorileri yükle
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    try {
      // Simüle edilmiş yükleme veya doğrudan i18next'ten veri çekme
      const productsData = fetchProductsFromI18n(t, i18n.language);
      if (!Array.isArray(productsData)) {
        throw new Error("Product data is not in expected format.");
      }
      setAllProducts(productsData);
      setFilteredProducts(productsData); // Başlangıçta tüm ürünleri göster
    } catch (err) {
      console.error("Failed to load products:", err);
      setError(err.message || t('products:error_loading_products', 'Error loading products. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }, [i18n.language, t]); // Dil değiştiğinde yeniden yükle


  // Kategorileri dinamik olarak al (filtrelenmemiş ürünlerden)
  const categories = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    const uniqueCategories = {};
    allProducts.forEach(p => {
      if (p.category_key && p.category_name) {
        uniqueCategories[p.category_key] = p.category_name;
      }
    });
    return Object.entries(uniqueCategories).map(([key, name]) => ({ key, name }));
  }, [allProducts]);

  // Filtreleme ve sıralama mantığı
  useEffect(() => {
    let result = [...allProducts];

    // Arama filtresi (isim veya açıklama)
    if (searchQuery.trim() !== '') {
      const lowerSearchQuery = searchQuery.toLowerCase();
      result = result.filter(product =>
        product.name.toLowerCase().includes(lowerSearchQuery) ||
        product.description.toLowerCase().includes(lowerSearchQuery)
      );
    }

    // Kategori filtresi
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category_key === selectedCategory);
    }

    // Sıralama
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name, i18n.language));
        break;
      case 'name_desc':
        result.sort((a, b) => b.name.localeCompare(a.name, i18n.language));
        break;
      default:
        // Varsayılan sıralama (ID'ye göre veya olduğu gibi bırak)
        break;
    }
    setFilteredProducts(result);
  }, [searchQuery, selectedCategory, sortBy, allProducts, i18n.language]);


  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Arama zaten useEffect ile anlık yapılıyor, ama isterseniz burada da tetikleyebilirsiniz.
    // Bu fonksiyon, arama butonu için gerekli, yoksa sadece input onChange yeterli.
  };

  const sortOptions = [
    { value: 'default', label: t('products:sort_options.default') },
    { value: 'price_asc', label: t('products:sort_options.price_asc') },
    { value: 'price_desc', label: t('products:sort_options.price_desc') },
    { value: 'name_asc', label: t('products:sort_options.name_asc') },
    { value: 'name_desc', label: t('products:sort_options.name_desc') },
  ];

  if (isLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="danger" role="status">
          <span className="visually-hidden">{t('products:loading_products')}</span>
        </Spinner>
        <p className="mt-2">{t('products:loading_products')}</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h4>{t('common:error.title', 'An Error Occurred')}</h4>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 px-md-5">
      <h1 className="mb-4 text-center text-danger">{t('common:products.title')}</h1>

      {/* Filtreleme ve Sıralama Bölümü */}
      <Row className="mb-4 p-3 bg-light border rounded shadow-sm align-items-center">
        <Col md={5} className="mb-3 mb-md-0">
          <Form onSubmit={handleSearchSubmit}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder={t('common:search_placeholder', 'Search products...')}
                value={searchQuery}
                onChange={handleSearchChange}
                aria-label={t('common:search_placeholder')}
              />
              <Button variant="outline-secondary" type="submit">
                <FaSearch />
              </Button>
            </InputGroup>
          </Form>
        </Col>

        <Col md={4} sm={6} className="mb-3 mb-md-0">
          <InputGroup>
            <InputGroup.Text id="category-filter-label"><FaFilter /></InputGroup.Text>
            <Form.Select
              aria-labelledby="category-filter-label"
              aria-label={t('products:filter_by_category')}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">{t('products:all_categories')}</option>
              {categories.map(category => (
                <option key={category.key} value={category.key}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </InputGroup>
        </Col>

        <Col md={3} sm={6}>
           <InputGroup>
             <InputGroup.Text id="sort-by-label">
                {sortBy.includes('asc') ? <FaSortAmountDown/> : <FaSortAmountUp/>}
             </InputGroup.Text>
            <Form.Select
              aria-labelledby="sort-by-label"
              aria-label={t('products:sort_by')}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Form.Select>
          </InputGroup>
        </Col>
      </Row>

      {/* Ürün Listeleme */}
      {filteredProducts.length > 0 ? (
        <ProductList products={filteredProducts} />
      ) : (
        !isLoading && <Alert variant="info">{t('products:no_products_found')}</Alert>
      )}
    </Container>
  );
}