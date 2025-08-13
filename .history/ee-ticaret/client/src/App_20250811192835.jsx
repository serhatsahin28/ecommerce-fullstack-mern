import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <CartProvider>
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <ToastContainer position="top-start" />
            <AppRouter />
          </Router>
        </AuthProvider>
      </CartProvider>
    </I18nextProvider>
  );
}
