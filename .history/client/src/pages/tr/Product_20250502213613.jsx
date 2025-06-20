import React from 'react';
import { useTranslation } from 'react-i18next';
import ProductList from '../../components/product/ProductList';

export default function Products() {
  const { t } = useTranslation('common');

  const dummyProducts = [
    { id: 1, name: 'Telefon', price: 5000, category: 'electronics' },
    { id: 2, name: 'Tişört', price: 150, category: 'fashion' },
  ];

  return (
    <div className="container py-4">
      <h2>{t('products.title')}</h2>
      <ProductList products={dummyProducts} />
    </div>
  );
}
