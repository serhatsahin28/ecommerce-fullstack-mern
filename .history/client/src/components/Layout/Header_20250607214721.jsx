import React, { useEffect, useState, useContext } from 'react';
import {
  Navbar, Nav, Container, Form, InputGroup, Button,
  Badge, Dropdown, Row, Col
} from 'react-bootstrap';
import {
  FaSearch, FaUser, FaShoppingCart, FaBoxOpen,
  FaTshirt, FaLaptop, FaHome, FaBook, FaBaby, FaTags
} from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LanguageSelector from '../common/LanguageSelector';
import { CartContext } from '../common/CartContext';
import { isAuthenticated } from '../../utils/auth';

const Header = () => {
  const { cartItems } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();
  const lng = location.pathname.split('/')[1] || 'en'; // varsayılan en

  const [searchQuery, setSearchQuery] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [categoryTitle, setCategoryTitle] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const lang = ['en', 'tr'].includes(lng) ? lng : 'en';
        const res = await fetch(`/http://localhost:5000/api/ecommerce-${lang}`);
        const data = await res.json();
     

        if (data?.categories?.items?.length) {
          setCategoryTitle(data.categories.title);
          setCategories(data.categories.items);
        } else {
          setCategoryTitle('Categories');
          setCategories([]);
        }
      } catch (err) {
        console.error('❌ Kategori verisi alınamadı:', err);
        setCategories([]);
      }
    };

    fetchCategories();
  }, [lng]);

  const categoryIcon = (iconName) => {
    const icons = {
      fashion: <FaTshirt className="text-primary category-icon-img" />,
      electronics: <FaLaptop className="text-success category-icon-img" />,
      home: <FaHome className="text-warning category-icon-img" />,
      books: <FaBook className="text-info category-icon-img" />,
      baby: <FaBaby className="text-danger category-icon-img" />,
      default: <FaTags className="text-secondary category-icon-img" />
    };
    return icons[iconName] || icons.default;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/${lng}/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleCategoryClick = () => {
    setShowCategories(false);
  };

  return (
    <Navbar expand="lg" sticky="top" bg="light" variant="light" className="header-navbar shadow-sm">
      <Container fluid="lg">
        <Navbar.Brand as={Link} to={`/${lng}`} className="fw-bold text-danger">
          <FaBoxOpen className="me-2" /> Shoppy
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto align-items-center">
            <Dropdown
              show={showCategories}
              onToggle={(isOpen, event, metadata) => {
                if (metadata.source === 'click' && !event.target.closest('.static-dropdown')) {
                  setShowCategories(isOpen);
                } else if (metadata.source === 'rootClose') {
                  setShowCategories(false);
                }
              }}
              className="position-static"
            >
              <Dropdown.Toggle
                as={Nav.Link}
                id="categories-dropdown-button"
                className="text-dark fw-medium d-flex align-items-center"
                onClick={(e) => {
                  e.preventDefault();
                  setShowCategories(!showCategories);
                }}
              >
                {categoryTitle || 'Categories'}
              </Dropdown.Toggle>

              <Dropdown.Menu className="category-dropdown w-100 p-3 border-0 shadow-lg mt-0">
                <Container fluid>
                  <h5 className="mb-3 text-danger border-bottom pb-2">{categoryTitle || 'Explore Categories'}</h5>
                  <Row className="g-3">
                    {categories.length > 0 ? categories.map((category) => (
                      <Col xs={12} sm={6} md={4} lg={3} xl={2} key={category.id}>
                        <Link
                          to={`/${lng}/${category.title.toLowerCase()}`}
                          className="text-decoration-none category-item d-block"
                          onClick={handleCategoryClick}
                        >
                          <div className="d-flex align-items-center p-2 rounded category-block-hover">
                            <div className="category-icon-wrapper me-2">
                              {categoryIcon(category.icon)}
                            </div>
                            <div className="category-text">
                              <h6 className="mb-0 fs-6 fw-medium text-dark">{category.title}</h6>
                              {category.subtitle && (
                                <small className="text-muted d-none d-md-block">{category.subtitle}</small>
                              )}
                            </div>
                          </div>
                        </Link>
                      </Col>
                    )) : (
                      <Col><p className="text-muted">No categories available.</p></Col>
                    )}
                  </Row>
                </Container>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>

          <Form className="d-flex my-2 my-lg-0 me-lg-3 flex-grow-1 search-form-header" onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="danger" type="submit" id="search-button">
                <FaSearch />
              </Button>
            </InputGroup>
          </Form>

          <Nav className="user-nav align-items-center">
            <Nav.Link
              as={Link}
              to={isAuthenticated() ? `/${lng}/account` : `/${lng}/login`}
              className="px-2 text-dark"
              aria-label="Account"
            >
              <FaUser size={20} />
            </Nav.Link>
            <Nav.Link as={Link} to={`/${lng}/cart`} className="px-2 position-relative text-dark" aria-label="Shopping Cart">
              <FaShoppingCart size={20} />
              {cartItems.length > 0 && (
                <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle-y badge-sm">
                  {cartItems.length}
                  <span className="visually-hidden">items in cart</span>
                </Badge>
              )}
            </Nav.Link>
            <div className="ms-2 language-selector-wrapper">
              <LanguageSelector variant="light" />
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
