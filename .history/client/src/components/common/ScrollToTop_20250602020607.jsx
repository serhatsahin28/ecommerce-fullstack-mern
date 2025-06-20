import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
if (window.scrollY > 100) {
  window.scrollTo(0, 0);
}

  useEffect(() => {
    // Smooth değil, ani scroll
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
