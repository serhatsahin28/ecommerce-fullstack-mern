// pages/tr/Products.jsx
import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col, Form, Button, InputGroup, Spinner, Alert, Card } from 'react-bootstrap';
import { FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp, FaListUl, FaAngleRight, FaExclamationCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
const ProductList = React.lazy(() => import('../../components/product/ProductList'));

const fetchProductsFromI18n = (tFunction, lang) => {
  const items = tFunction('items', { ns: 'products', returnObjects: true, lng: lang });
  const categoriesMap = tFunction('categories', { ns: 'products', returnObjects: true, lng: lang });

  if (!Array.isArray(items) || typeof categoriesMap !== 'object' || categoriesMap === null) {
    console.error("Invalid data structure from i18n:", { items, categoriesMap });
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
  const currentLang = 'tr';

  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    try {
      const productsData = fetchProductsFromI18n(t, currentLang);
      if (productsData.error) throw new Error(productsData.error);
      setAllProducts(productsData);
    } catch (err) {
      console.error("Load error:", err);
      setError(err.message || t('products:feedback_messages.error.loading_failed'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const filterCategories = useMemo(() => {
    const uniqueCategories = {};
    allProducts.forEach(p => {
      if (p.category_key && p.category_name) {
        uniqueCategories[p.category_key] = p.category_name;
      }
    });
    return Object.entries(uniqueCategories).map(([key, name]) => ({ key, name }));
  }, [allProducts]);

  const groupedAndFilteredProducts = useMemo(() => {
    let filtered = [...allProducts];
    const query = searchQuery.toLowerCase();

    if (query) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    if (selectedCategoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category_key === selectedCategoryFilter);
    }

    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name, currentLang));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name, currentLang));
        break;
      case 'rating_desc':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    if (selectedCategoryFilter !== 'all') {
      const category = filterCategories.find(cat => cat.key === selectedCategoryFilter);
      return filtered.length ? [{ categoryKey: selectedCategoryFilter, categoryName: category?.name, products: filtered }] : [];
    }

    const grouped = {};
    filtered.forEach(p => {
      const key = p.category_key;
      if (!grouped[key]) grouped[key] = { categoryKey: key, categoryName: p.category_name, products: [] };
      grouped[key].products.push(p);
    });
    return Object.values(grouped);
  }, [searchQuery, selectedCategoryFilter, sortBy, allProducts, filterCategories, currentLang]);

  const sortOptions = useMemo(() => [
    { value: 'default', label: t('products:filters_sort.sort_options.default') },
    { value: 'price_asc', label: t('products:filters_sort.sort_options.price_asc') },
    { value: 'price_desc', label: t('products:filters_sort.sort_options.price_desc') },
    { value: 'name_asc', label: t('products:filters_sort.sort_options.name_asc') },
    { value: 'name_desc', label: t('products:filters_sort.sort_options.name_desc') },
    { value: 'rating_desc', label: t('products:filters_sort.sort_options.rating_desc') }
  ], [t]);

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
          <h1 className="display-5 fw-bold text-danger">{t('products:page_title')}</h1>
          <p className="text-muted">{t('products:page_subtitle')}</p>
        </header>

        <Card className="shadow-sm p-4 mb-5 sticky-top bg-white" style={{ top: '65px', zIndex: 1000 }}>
          <Row className="g-3">
            <Col lg={5}>
              <Form onSubmit={(e) => e.preventDefault()}>
                <InputGroup>
                  <Form.Control
                    type="search"
                    placeholder={t('products:filters_sort.search_placeholder')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  <Button variant="outline-danger"><FaSearch /></Button>
                </InputGroup>
              </Form>
            </Col>
            <Col lg={4}>
              <InputGroup>
                <InputGroup.Text><FaFilter /></InputGroup.Text>
                <Form.Select value={selectedCategoryFilter} onChange={e => setSelectedCategoryFilter(e.target.value)}>
                  <option value="all">{t('products:filters_sort.all_categories_option')}</option>
                  {filterCategories.map(cat => (
                    <option key={cat.key} value={cat.key}>{cat.name}</option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
            <Col lg={3}>
              <InputGroup>
                <InputGroup.Text>
                  {sortBy.includes('asc') ? <FaSortAmountDown /> : <FaSortAmountUp />}
                </InputGroup.Text>
                <Form.Select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>
        </Card>

        <Suspense fallback={<Spinner animation="border" variant="danger" />}>
          {groupedAndFilteredProducts.length > 0 ? (
            groupedAndFilteredProducts.map(group => (
              <section key={group.categoryKey} className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="h4 fw-bold text-capitalize">{group.categoryName}</h2>
                  <Link to={`/tr/products/category/${group.categoryKey}`} className="btn btn-outline-danger btn-sm">
                    {t('products:category_section.view_all_button_text')} <FaAngleRight />
                  </Link>
                </div>
                <ProductList products={group.products} />
              </section>
            ))
          ) : (
            <Card className="text-center p-5">
              <Card.Body>
                <FaListUl size={40} className="mb-3 text-danger opacity-50" />
                <Card.Title>{t('products:feedback_messages.no_results.title')}</Card.Title>
                <Card.Text>{t('products:feedback_messages.no_results.message')}</Card.Text>
                <Button variant="danger" onClick={() => {
                  setSearchQuery('');
                  setSelectedCategoryFilter('all');
                  setSortBy('default');
                }}>
                  {t('products:feedback_messages.no_results.show_all_button')}
                </Button>
              </Card.Body>
            </Card>
          )}
        </Suspense>
      </Container>
    </div>
  );
}
