import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Dil destekleri
const supportedLanguages = ['tr', 'en'];

i18n
  .use(HttpApi)                          // JSON dosyalarından çeviriyi al
  .use(LanguageDetector)                // Dili otomatik algıla (URL, cookie, vs.)
  .use(initReactI18next)                // React ile entegrasyon
  .init({
    fallbackLng: 'tr',                  // Dil bulunamazsa Türkçe'ye düş
    supportedLngs: supportedLanguages,  // Desteklenen diller
    detection: {
      order: ['path', 'cookie', 'htmlTag'],   // Öncelik: URL > cookie > <html lang="">
      lookupFromPathIndex: 0,                // URL: /en/home => "en" kısmını al
      caches: ['cookie']                     // Kullanıcının seçimini cookie’ye kaydet
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json'  // JSON çeviri dosyalarının yolu
    },
    react: {
      useSuspense: false  // SSR'de sorun çıkmasın diye
    }
  });

export default i18n;
