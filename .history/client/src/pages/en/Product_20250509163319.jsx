import React from 'react';
import { useTranslation } from 'react-i18next';
import ProductList from '../../components/product/ProductList';

export default function Products() {
  const { t } = useTranslation('common');

  const dummyProducts = [
    { id: 1, name: 'Phone', price: 500, category: 'electronics' },
    { id: 2, name: 'T-Shirt', price: 25, category: 'fashion' },
  ];

  return (
    <div className="container py-4">
      <h2>{t('products.title')}</h2>
      <ProductList products={dummyProducts} />
    </div>
  );
}
