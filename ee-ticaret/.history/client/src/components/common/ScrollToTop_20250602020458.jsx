// src/components/common/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, 0),[pathname];
    }); // Gecikme, lazy-load ile çakışmayı azaltır
  }, [pathname]);

  return null;
};

export default ScrollToTop;
