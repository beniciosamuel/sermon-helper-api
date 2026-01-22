import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { authService, LoginCredentials, SignUpData } from '../services/AuthService';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/LoginPage.module.css';

type LoginMethod = 'email' | 'phone';
type MessageType = 'error' | 'success';
interface Message {
  type: MessageType;
  text: string;
}

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, checkAuth, login: setAuthUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  // Redirect to /bible if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/bible', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Form state
  const [loginForm, setLoginForm] = useState<LoginCredentials>({
    email: '',
    phone: '',
    password: '',
  });

  const [signUpForm, setSignUpForm] = useState<SignUpData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // Validation errors
  const [loginErrors, setLoginErrors] = useState<Partial<LoginCredentials>>({});
  const [signUpErrors, setSignUpErrors] = useState<Partial<SignUpData>>({});

  const validateLogin = (): boolean => {
    const errors: Partial<LoginCredentials> = {};

    if (loginMethod === 'email') {
      if (!loginForm.email?.trim()) {
        errors.email = t('auth.login.emailRequired');
      } else if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
        errors.email = t('auth.login.emailInvalid');
      }
    } else {
      if (!loginForm.phone?.trim()) {
        errors.phone = t('auth.login.phoneRequired');
      }
    }

    if (!loginForm.password) {
      errors.password = t('auth.login.passwordRequired');
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignUp = (): boolean => {
    const errors: Partial<SignUpData> = {};

    if (!signUpForm.name.trim()) {
      errors.name = t('auth.signup.nameRequired');
    }

    if (!signUpForm.email.trim()) {
      errors.email = t('auth.signup.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(signUpForm.email)) {
      errors.email = t('auth.signup.emailInvalid');
    }

    if (!signUpForm.phone.trim()) {
      errors.phone = t('auth.signup.phoneRequired');
    }

    if (!signUpForm.password) {
      errors.password = t('auth.signup.passwordRequired');
    } else if (signUpForm.password.length < 8) {
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
    setMessage(null);

    if (!validateLogin()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Only send the relevant field based on login method
      const credentials: LoginCredentials =
        loginMethod === 'email'
          ? { email: loginForm.email, password: loginForm.password }
          : { phone: loginForm.phone, password: loginForm.password };

      const response = await authService.login(credentials);
      if (response.success) {
        // Token is already stored by AuthService in cookie
        // Small delay to ensure cookie is set and tRPC client is ready
        await new Promise((resolve) => setTimeout(resolve, 100));
        // Get full user data from server to update context
        try {
          const trpc = await import('../services/trpc/client').then((m) => m.getTrpcClient());
          const userData = await trpc.user.getCurrentUser.query();
          setAuthUser(userData);
          // Navigate to home page after successful login
          navigate('/bible');
        } catch (error) {
          // If getCurrentUser fails, still try to navigate (token might not be ready yet)
          // The AuthContext will verify on next check
          console.error('Failed to get user data after login:', error);
          navigate('/bible');
        }
      } else {
        setMessage({ type: 'error', text: response.message || t('auth.login.failed') });
      }
    } catch {
      setMessage({ type: 'error', text: t('auth.login.error') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validateSignUp()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.signUp(signUpForm);
      if (response.success) {
        // Token is already stored by AuthService in cookie
        // Small delay to ensure cookie is set and tRPC client is ready
        await new Promise((resolve) => setTimeout(resolve, 100));
        // Get full user data from server to update context
        try {
          const trpc = await import('../services/trpc/client').then((m) => m.getTrpcClient());
          const userData = await trpc.user.getCurrentUser.query();
          setAuthUser(userData);
          // Navigate to home page after successful sign up
          navigate('/bible');
        } catch (error) {
          // If getCurrentUser fails, still try to navigate (token might not be ready yet)
          // The AuthContext will verify on next check
          console.error('Failed to get user data after signup:', error);
          navigate('/bible');
        }
      } else {
        setMessage({ type: 'error', text: response.message || t('auth.signup.failed') });
      }
    } catch {
      setMessage({ type: 'error', text: t('auth.signup.error') });
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

  const handleLoginMethodChange = (method: LoginMethod) => {
    setLoginMethod(method);
    setLoginErrors({});
    setMessage(null);
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
                setMessage(null);
                setLoginErrors({});
              }}
            >
              {t('auth.login.title')}
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'signup' ? styles.tabActive : ''}`}
              onClick={() => {
                setActiveTab('signup');
                setMessage(null);
                setSignUpErrors({});
              }}
            >
              {t('auth.signup.title')}
            </button>
          </div>

          {message && (
            <div
              className={
                message.type === 'success' ? styles.successMessage : styles.errorMessage
              }
            >
              {message.text}
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className={styles.form}>
              {/* Login method tabs */}
              <div className={styles.loginMethodTabs}>
                <button
                  type="button"
                  className={`${styles.loginMethodTab} ${loginMethod === 'email' ? styles.loginMethodTabActive : ''}`}
                  onClick={() => handleLoginMethodChange('email')}
                >
                  {t('auth.login.withEmail')}
                </button>
                <button
                  type="button"
                  className={`${styles.loginMethodTab} ${loginMethod === 'phone' ? styles.loginMethodTabActive : ''}`}
                  onClick={() => handleLoginMethodChange('phone')}
                >
                  {t('auth.login.withPhone')}
                </button>
              </div>

              {loginMethod === 'email' ? (
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
              ) : (
                <div className={styles.formGroup}>
                  <label htmlFor="login-phone" className={styles.label}>
                    {t('auth.login.phone')}
                  </label>
                  <input
                    id="login-phone"
                    type="tel"
                    className={`${styles.input} ${loginErrors.phone ? styles.inputError : ''}`}
                    value={loginForm.phone}
                    onChange={(e) => handleLoginInputChange('phone', e.target.value)}
                    placeholder={t('auth.login.phonePlaceholder')}
                    disabled={isSubmitting}
                  />
                  {loginErrors.phone && (
                    <span className={styles.errorText}>{loginErrors.phone}</span>
                  )}
                </div>
              )}

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

              <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                {isSubmitting ? t('auth.login.submitting') : t('auth.login.submit')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="signup-name" className={styles.label}>
                  {t('auth.signup.name')}
                </label>
                <input
                  id="signup-name"
                  type="text"
                  className={`${styles.input} ${signUpErrors.name ? styles.inputError : ''}`}
                  value={signUpForm.name}
                  onChange={(e) => handleSignUpInputChange('name', e.target.value)}
                  placeholder={t('auth.signup.namePlaceholder')}
                  disabled={isSubmitting}
                />
                {signUpErrors.name && <span className={styles.errorText}>{signUpErrors.name}</span>}
              </div>

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
                <label htmlFor="signup-phone" className={styles.label}>
                  {t('auth.signup.phone')}
                </label>
                <input
                  id="signup-phone"
                  type="tel"
                  className={`${styles.input} ${signUpErrors.phone ? styles.inputError : ''}`}
                  value={signUpForm.phone}
                  onChange={(e) => handleSignUpInputChange('phone', e.target.value)}
                  placeholder={t('auth.signup.phonePlaceholder')}
                  disabled={isSubmitting}
                />
                {signUpErrors.phone && (
                  <span className={styles.errorText}>{signUpErrors.phone}</span>
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

              <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
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
