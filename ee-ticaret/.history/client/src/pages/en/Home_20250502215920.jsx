import React from 'react';
import { useTranslation } from 'react-i18next';
import HomeBody from '../../components/HomeBody';

export default function Home() {
  const { t } = useTranslation('home');

  return (
    <>
      <h1 className="text-center mt-4">{t('welcome')}</h1>
      <p className="text-center">{t('description')}</p>
    </>
  );
}
