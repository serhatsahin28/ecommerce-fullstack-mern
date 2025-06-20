import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Container, Form, Button, InputGroup, Spinner, Alert, Card } from 'react-bootstrap';
import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaListUl, FaExclamationCircle } from 'react-icons/fa';

const ProductList = React.lazy(() => import('../../components/product/ProductList'));

const fetchProductsFromI18n = (tFunction, lang) => {
  const items = tFunction('items', { ns: 'products', returnObjects: true, lng: lang });
  const categoriesMap = tFunction('categories', { ns: 'products', returnObjects: true, lng: lang });
  if (!Array.isArray(items) || typeof categoriesMap !== 'object' || categoriesMap === null) {
    return { error: tFunction('products:feedback_messages.error.data_format', "Product data is not in the expected format.") };
  }
  return items.map(item => ({
    ...item,
    name: item.name || tFunction('products:product_card.unnamed_product', 'Unnamed Product', { lng: lang }),
    image: item.image || tFunction('products:labels.default_image_path', '/images/placeholder.png', { lng: lang }),
    description: item.description || '',
    price: typeof item.price === 'number' ? item.price : 0,
    category_name: categoriesMap[item.category_key] || item.category_key || tFunction('products:labels.uncategorized', 'Uncategorized', { lng: lang }),
  }));
};

export default function Products() {
  const { t } = useTranslation(['common', 'products']);
  const { category } = useParams(); // URL'den kategori slug'ı çekilir
  const currentLang = 'tr';

  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    try {
      const productsData = fetchProductsFromI18n(t, currentLang);
      if (productsData.error) throw new Error(productsData.error);
      setAllProducts(productsData);
    } catch (err) {
      setError(err.message || t('products:feedback_messages.error.loading_failed'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  // 1️⃣ Kategoriye ve aramaya göre filtrele
  const filteredProducts = useMemo(() => {
    let products = [...allProducts];
    if (category) {
      products = products.filter(p => p.category_key === category);
    }
    const query = searchQuery.toLowerCase();
    if (query) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    // Sıralama örneği
    switch (sortBy) {
      case 'price_asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        products.sort((a, b) => a.name.localeCompare(b.name, currentLang));
        break;
      case 'name_desc':
        products.sort((a, b) => b.name.localeCompare(a.name, currentLang));
        break;
      case 'rating_desc':
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }
    return products;
  }, [allProducts, category, searchQuery, sortBy, currentLang]);

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="grow" variant="danger" style={{ width: '3rem', height: '3rem' }} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center shadow">
          <FaExclamationCircle size={30} className="mb-3 text-danger" />
          <h4>{t('common:error.title')}</h4>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <Container fluid="lg" className="py-5">
        <header className="text-center mb-4">
          <h1 className="display-5 fw-bold text-danger">
            {category
              ? t(`products:categories.${category}`)  // Örn. "Elektronik"
              : t('products:page_title')}
          </h1>
          <p className="text-muted">{t('products:page_subtitle')}</p>
        </header>

        {/* Arama ve sıralama */}
        <Form className="mb-4" onSubmit={e => e.preventDefault()}>
          <InputGroup>
            <Form.Control
              type="search"
              placeholder={t('products:filters_sort.search_placeholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Button variant="outline-danger"><FaSearch /></Button>
            <Form.Select
              className="ms-2"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ maxWidth: 180 }}
            >
              <option value="default">{t('products:filters_sort.sort_options.default')}</option>
              <option value="price_asc">{t('products:filters_sort.sort_options.price_asc')}</option>
              <option value="price_desc">{t('products:filters_sort.sort_options.price_desc')}</option>
              <option value="name_asc">{t('products:filters_sort.sort_options.name_asc')}</option>
              <option value="name_desc">{t('products:filters_sort.sort_options.name_desc')}</option>
              <option value="rating_desc">{t('products:filters_sort.sort_options.rating_desc')}</option>
            </Form.Select>
          </InputGroup>
        </Form>

        <Suspense fallback={<Spinner animation="border" variant="danger" />}>
          {filteredProducts.length > 0 ? (
            <ProductList products={filteredProducts} />
          ) : (
            <Card className="text-center p-5">
              <Card.Body>
                <FaListUl size={40} className="mb-3 text-danger opacity-50" />
                <Card.Title>{t('products:feedback_messages.no_results.title')}</Card.Title>
                <Card.Text>{t('products:feedback_messages.no_results.message')}</Card.Text>
              </Card.Body>
            </Card>
          )}
        </Suspense>
      </Container>
    </div>
  );
}
