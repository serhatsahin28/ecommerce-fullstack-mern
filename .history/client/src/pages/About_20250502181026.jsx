import React from 'react';
import { useTranslation } from 'react-i18next';
export default function About() {
  const { t } = useTranslation('common');
  return <div className="p-5"><h1>{t('about')}</h1><p>{t('aboutText')}</p></div>;
}
