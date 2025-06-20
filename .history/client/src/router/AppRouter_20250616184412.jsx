export default function AppRouter() {
  const location = useLocation();
  const pathLang = location.pathname.split('/')[1]; // örn: /en/xxx → en

  const validLanguages = ['tr', 'en'];

  // Geçersiz dil kodu varsa 404'e yönlendir
  if (pathLang && !validLanguages.includes(pathLang)) {
    return <Navigate to="/tr/404" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/tr" replace />} />

      {/* TR Routes */}
      <Route path="/tr" element={<Layout />}>
        <Route index element={<HomeTR />} />
        <Route path=":category" element={<ProductsTR />} />
        <Route path=":category/:id" element={<ProductDetailTR />} />
        <Route path="cart" element={<CartPageTR />} />
        <Route path="login" element={<LoginTR />} />
        <Route path="register" element={<RegisterTR />} />
        <Route path="404" element={<NotFoundTr />} />
      </Route>

      {/* EN Routes */}
      <Route path="/en" element={<Layout />}>
        <Route index element={<HomeEN />} />
        <Route path=":category" element={<ProductsEN />} />
        <Route path=":category/:id" element={<ProductDetailEN />} />
        <Route path="cart" element={<CartPageEN />} />
        <Route path="login" element={<LoginEN />} />
        <Route path="register" element={<RegisterEN />} />
        <Route path="404" element={<NotFoundEn />} />
        <Route path="*" element={<NotFoundEn />} />
      </Route>

      {/* Geçerli dil olsa da alt path yoksa fallback */}
      <Route path="*" element={<Navigate to={`/${pathLang}`} replace />} />
    </Routes>
  );
}
