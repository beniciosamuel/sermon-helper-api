import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { authService, LoginCredentials, SignUpData } from '../services/AuthService';
import styles from '../styles/LoginPage.module.css';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [loginForm, setLoginForm] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const [signUpForm, setSignUpForm] = useState<SignUpData>({
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Validation errors
  const [loginErrors, setLoginErrors] = useState<Partial<LoginCredentials>>({});
  const [signUpErrors, setSignUpErrors] = useState<Partial<SignUpData>>({});

  const validateLogin = (): boolean => {
    const errors: Partial<LoginCredentials> = {};
    
    if (!loginForm.email.trim()) {
      errors.email = t('auth.login.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
      errors.email = t('auth.login.emailInvalid');
    }

    if (!loginForm.password) {
      errors.password = t('auth.login.passwordRequired');
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignUp = (): boolean => {
    const errors: Partial<SignUpData> = {};
    
    if (!signUpForm.email.trim()) {
      errors.email = t('auth.signup.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(signUpForm.email)) {
      errors.email = t('auth.signup.emailInvalid');
    }

    if (!signUpForm.password) {
      errors.password = t('auth.signup.passwordRequired');
    } else if (signUpForm.password.length < 6) {
      errors.password = t('auth.signup.passwordMinLength');
    }

    if (!signUpForm.confirmPassword) {
      errors.confirmPassword = t('auth.signup.confirmPasswordRequired');
    } else if (signUpForm.password !== signUpForm.confirmPassword) {
      errors.confirmPassword = t('auth.signup.passwordMismatch');
    }

    setSignUpErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateLogin()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.login(loginForm);
      if (response.success && response.token) {
        authService.setToken(response.token);
        // Navigate to home page after successful login
        navigate('/bible');
      } else {
        setError(response.message || t('auth.login.failed'));
      }
    } catch (err) {
      setError(t('auth.login.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateSignUp()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.signUp(signUpForm);
      if (response.success && response.token) {
        authService.setToken(response.token);
        // Navigate to home page after successful sign up
        navigate('/bible');
      } else {
        setError(response.message || t('auth.signup.failed'));
      }
    } catch (err) {
      setError(t('auth.signup.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginInputChange = (field: keyof LoginCredentials, value: string) => {
    setLoginForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (loginErrors[field]) {
      setLoginErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSignUpInputChange = (field: keyof SignUpData, value: string) => {
    setSignUpForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (signUpErrors[field]) {
      setSignUpErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <h1 className={styles.loginTitle}>{t('auth.title')}</h1>
            <p className={styles.loginSubtitle}>{t('auth.subtitle')}</p>
          </div>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'login' ? styles.tabActive : ''}`}
              onClick={() => {
                setActiveTab('login');
                setError(null);
                setLoginErrors({});
              }}
            >
              {t('auth.login.title')}
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'signup' ? styles.tabActive : ''}`}
              onClick={() => {
                setActiveTab('signup');
                setError(null);
                setSignUpErrors({});
              }}
            >
              {t('auth.signup.title')}
            </button>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="login-email" className={styles.label}>
                  {t('auth.login.email')}
                </label>
                <input
                  id="login-email"
                  type="email"
                  className={`${styles.input} ${loginErrors.email ? styles.inputError : ''}`}
                  value={loginForm.email}
                  onChange={(e) => handleLoginInputChange('email', e.target.value)}
                  placeholder={t('auth.login.emailPlaceholder')}
                  disabled={isSubmitting}
                />
                {loginErrors.email && (
                  <span className={styles.errorText}>{loginErrors.email}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="login-password" className={styles.label}>
                  {t('auth.login.password')}
                </label>
                <input
                  id="login-password"
                  type="password"
                  className={`${styles.input} ${loginErrors.password ? styles.inputError : ''}`}
                  value={loginForm.password}
                  onChange={(e) => handleLoginInputChange('password', e.target.value)}
                  placeholder={t('auth.login.passwordPlaceholder')}
                  disabled={isSubmitting}
                />
                {loginErrors.password && (
                  <span className={styles.errorText}>{loginErrors.password}</span>
                )}
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? t('auth.login.submitting') : t('auth.login.submit')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="signup-email" className={styles.label}>
                  {t('auth.signup.email')}
                </label>
                <input
                  id="signup-email"
                  type="email"
                  className={`${styles.input} ${signUpErrors.email ? styles.inputError : ''}`}
                  value={signUpForm.email}
                  onChange={(e) => handleSignUpInputChange('email', e.target.value)}
                  placeholder={t('auth.signup.emailPlaceholder')}
                  disabled={isSubmitting}
                />
                {signUpErrors.email && (
                  <span className={styles.errorText}>{signUpErrors.email}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="signup-password" className={styles.label}>
                  {t('auth.signup.password')}
                </label>
                <input
                  id="signup-password"
                  type="password"
                  className={`${styles.input} ${signUpErrors.password ? styles.inputError : ''}`}
                  value={signUpForm.password}
                  onChange={(e) => handleSignUpInputChange('password', e.target.value)}
                  placeholder={t('auth.signup.passwordPlaceholder')}
                  disabled={isSubmitting}
                />
                {signUpErrors.password && (
                  <span className={styles.errorText}>{signUpErrors.password}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="signup-confirm-password" className={styles.label}>
                  {t('auth.signup.confirmPassword')}
                </label>
                <input
                  id="signup-confirm-password"
                  type="password"
                  className={`${styles.input} ${signUpErrors.confirmPassword ? styles.inputError : ''}`}
                  value={signUpForm.confirmPassword}
                  onChange={(e) => handleSignUpInputChange('confirmPassword', e.target.value)}
                  placeholder={t('auth.signup.confirmPasswordPlaceholder')}
                  disabled={isSubmitting}
                />
                {signUpErrors.confirmPassword && (
                  <span className={styles.errorText}>{signUpErrors.confirmPassword}</span>
                )}
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? t('auth.signup.submitting') : t('auth.signup.submit')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

