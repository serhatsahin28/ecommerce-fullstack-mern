import { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('tr'); // Varsayılan dil Türkçe

  const toggleLanguage = () => {
    setLanguage((prevLang) => (prevLang === 'tr' ? 'en' : 'tr'));
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
