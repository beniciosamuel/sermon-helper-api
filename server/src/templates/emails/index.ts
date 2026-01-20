/**
 * Email Templates
 *
 * This module provides reusable email templates for transactional emails.
 * All templates follow the app's design system for consistent branding.
 *
 * @example
 * ```typescript
 * import {
 *   emailConfirmation,
 *   forgotPassword,
 *   generateRecoveryCode
 * } from './templates/emails';
 *
 * // Email confirmation
 * const confirmHtml = emailConfirmation({
 *   userName: 'John',
 *   confirmationUrl: 'https://app.example.com/confirm?token=abc',
 * });
 *
 * // Forgot password with generated code
 * const code = generateRecoveryCode();
 * const resetHtml = forgotPassword({
 *   userName: 'John',
 *   recoveryCode: code,
 * });
 * ```
 */

// Theme configuration
export { emailTheme, type EmailTheme } from './theme';

// Base layout and components
export {
  baseLayout,
  emailButton,
  codeBox,
  paragraph,
  heading,
  divider,
  spacer,
  type BaseLayoutOptions,
} from './baseLayout';

// Email templates
export { emailConfirmation, type EmailConfirmationOptions } from './emailConfirmation';

export { forgotPassword, generateRecoveryCode, type ForgotPasswordOptions } from './forgotPassword';
