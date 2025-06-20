import React from 'react';
import { useTranslation } from 'react-i18next';
import ProductList from '../../components/product/ProductList';
import { useParams } from 'react-router-dom';

export default function Products() {
  const { t } = useTranslation('products');
  const { lng } = useParams(); // URL'den dili al (örn. /tr/products)

  const dummyProducts = [
    { id: 1, name: lng === 'tr' ? 'Telefon' : 'Phone', price: 500, category: 'electronics' },
    { id: 2, name: lng === 'tr' ? 'Tişört' : 'T-Shirt', price: 25, category: 'fashion' },
  ];

  return (
  console.log("sadd");
  );
}
