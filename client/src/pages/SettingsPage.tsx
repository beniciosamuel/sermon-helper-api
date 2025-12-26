import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import SettingsSection from '../components/Settings/SettingsSection';
import ThemeToggle from '../components/Settings/ThemeToggle';
import styles from '../styles/SettingsPage.module.css';

const SettingsPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
  };

  const handlePasswordChange = () => {
    // Mock handler - no real backend
    alert('Funcionalidade de alteração de senha será implementada em breve.');
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Configurações</h1>
          <p className={styles.subtitle}>
            Gerencie sua conta e preferências de aparência
          </p>
        </div>

        <SettingsSection
          title="Conta de Acesso"
          description="Gerencie suas credenciais de acesso"
        >
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Senha
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <p className={styles.helperText}>
              Sua senha não é exibida por questões de segurança
            </p>
          </div>

          <button
            className={styles.button}
            onClick={handlePasswordChange}
            type="button"
          >
            Alterar senha
          </button>
        </SettingsSection>

        <SettingsSection
          title="Aparência"
          description="Personalize a aparência da aplicação"
        >
          <div className={styles.themeSection}>
            <div className={styles.themeInfo}>
              <h3 className={styles.themeTitle}>Tema</h3>
              <p className={styles.themeDescription}>
                Escolha entre modo escuro ou claro
              </p>
            </div>
            <ThemeToggle value={theme} onChange={handleThemeChange} />
          </div>
        </SettingsSection>
      </div>
    </div>
  );
};

export default SettingsPage;

