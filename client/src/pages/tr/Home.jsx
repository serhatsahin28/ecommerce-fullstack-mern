import React from 'react';
import { useTranslation } from 'react-i18next';
import HomeBody from '../../components/HomeBody';

export default function Home() {
  const { t } = useTranslation('home');

  return (
    <>
      <HomeBody />
    </>
  );
}
