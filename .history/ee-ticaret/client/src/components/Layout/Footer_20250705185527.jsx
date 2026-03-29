import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import {
  FaPhoneAlt, FaEnvelope, FaMapMarkerAlt,
  FaFacebookF, FaTwitter, FaInstagram
} from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

// JSON verileri import ediliyor
import trCommon from '../../locales/tr/common.json';
import enCommon from '../../locales/en/common.json';

const Footer = () => {
  const location = useLocation();
  const lng = location.pathname.split('/')[1] || 'en';

  const langData = lng === 'tr' ? trCommon : enCommon;
  const footerData = langData.footer;

  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-auto">
      <Container>
        <Row className="mb-4">
          <Col md={4} sm={12}>
            <h5 className="mb-3 text-white">{footerData.aboutTitle}</h5>
            <p className="text-white-50">{footerData.aboutText}</p>
          </Col>

          <Col md={4} sm={6}>
            <h5 className="mb-3 text-white">{footerData.categories.title}</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href={`/${lng}/electronics`} className="text-white text-decoration-none">
                  {footerData.categories.electronics}
                </a>
              </li>
              <li className="mb-2">
                <a href={`/${lng}/fashion`} className="text-white text-decoration-none">
                  {footerData.categories.fashion}
                </a>
              </li>
              <li className="mb-2">
                <a href={`/${lng}/home`} className="text-white text-decoration-none">
                  {footerData.categories.home}
                </a>
              </li>
            </ul>
          </Col>

          <Col md={4} sm={6}>
            <h5 className="mb-3 text-white">{footerData.contactTitle}</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <FaMapMarkerAlt className="me-2" />
                <span className="text-white-50">İstanbul, Türkiye</span>
              </li>
              <li className="mb-2">
                <FaPhoneAlt className="me-2" />
                <span className="text-white-50">+90 212 000 0000</span>
              </li>
              <li className="mb-2">
                <FaEnvelope className="me-2" />
                <span className="text-white-50">destek@ornek.com</span>
              </li>
            </ul>
          </Col>
        </Row>

        <hr className="border-secondary" />

        <Row className="align-items-center">
          <Col md={6} className="text-center text-md-start mb-2 mb-md-0">
            <small className="text-white-50">
              &copy; {new Date().getFullYear()} Shoppy. {footerData.rights}
            </small>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <a href="https://facebook.com" className="text-white me-3" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="https://twitter.com" className="text-white me-3" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" className="text-white" aria-label="Instagram">
              <FaInstagram />
            </a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
