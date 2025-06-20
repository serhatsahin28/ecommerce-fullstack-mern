import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, ButtonGroup, Button } from 'react-bootstrap';
import ProductList from './components/product/ProductList';

export default function Shop() {
  const { lng } = useParams();
  const { t } = useTranslation('shop');
  const [cat, setCat] = useState('all');

  const allProducts = [ /* dummy data... */ ];
  const filtered = cat==='all'? allProducts: allProducts.filter(p=>p.category===cat);

  return (
    <Container className="py-5">
      <h1>{t('title')}</h1>
      <ButtonGroup className="mb-4">
        {Object.keys(t('filter',{returnObjects:true})).map(k=>(
          <Button key={k} variant={cat===k?'primary':'outline-secondary'} onClick={()=>setCat(k)}>
            {t(`filter.${k}`)}
          </Button>
        ))}
      </ButtonGroup>
      <ProductList products={filtered}/>
    </Container>
  );
}
