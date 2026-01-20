import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './LanguageSwitcher.module.css';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className={styles.languageSwitcher}>
      <button
        className={`${styles.languageButton} ${
          i18n.language === 'pt' ? styles.languageButtonActive : ''
        }`}
        onClick={() => changeLanguage('pt')}
        title="Português"
      >
        PT
      </button>
      <button
        className={`${styles.languageButton} ${
          i18n.language === 'en' ? styles.languageButtonActive : ''
        }`}
        onClick={() => changeLanguage('en')}
        title="English"
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;
