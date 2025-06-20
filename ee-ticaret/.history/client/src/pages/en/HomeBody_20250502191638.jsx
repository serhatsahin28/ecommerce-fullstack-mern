import React from 'react';
import { Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

export default function HomeBody() {
  const { t } = useTranslation('home');

  return (
    <Container className="py-5">
      <h1>{t('welcomeMessage')}</h1>
      <p>{t('description')}</p>
    </Container>
  );
}
