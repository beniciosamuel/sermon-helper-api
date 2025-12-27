import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import SettingsSection from '../components/Settings/SettingsSection';
import ThemeToggle from '../components/Settings/ThemeToggle';
import LanguageSwitcher from '../components/LanguageSwitcher';
import styles from '../styles/SettingsPage.module.css';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
  };

  const handlePasswordChange = () => {
    // Mock handler - no real backend
    alert(t('settings.account.passwordChangeAlert'));
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('settings.title')}</h1>
          <p className={styles.subtitle}>
            {t('settings.subtitle')}
          </p>
        </div>

        <SettingsSection
          title={t('settings.account.title')}
          description={t('settings.account.description')}
        >
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              {t('settings.account.email')}
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('settings.account.emailPlaceholder')}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              {t('settings.account.password')}
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('settings.account.passwordPlaceholder')}
            />
            <p className={styles.helperText}>
              {t('settings.account.passwordHelper')}
            </p>
          </div>

          <button
            className={styles.button}
            onClick={handlePasswordChange}
            type="button"
          >
            {t('settings.account.changePassword')}
          </button>
        </SettingsSection>

        <SettingsSection
          title={t('settings.appearance.title')}
          description={t('settings.appearance.description')}
        >
          <div className={styles.themeSection}>
            <div className={styles.themeInfo}>
              <h3 className={styles.themeTitle}>{t('settings.appearance.theme')}</h3>
              <p className={styles.themeDescription}>
                {t('settings.appearance.themeDescription')}
              </p>
            </div>
            <ThemeToggle value={theme} onChange={handleThemeChange} />
          </div>
        </SettingsSection>

        <SettingsSection
          title={t('settings.language.title')}
          description={t('settings.language.description')}
        >
          <LanguageSwitcher />
        </SettingsSection>
      </div>
    </div>
  );
};

export default SettingsPage;

