import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Smooth değil, ani scroll
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
if (window.scrollY > 100) {
  window.scrollTo(0, 0);
}

export default ScrollToTop;
