import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
// İsteğe bağlı: LanguageDetector gibi eklentiler ekleyebilirsiniz

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    fallbackLng: 'tr',
    supportedLngs: ['en', 'tr'],
    ns: ['header', 'footer', 'home'], // Kullanacağınız namespace'ler
    defaultNS: 'header',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;
