import { baseLayout, codeBox, heading, paragraph, spacer, divider } from './baseLayout';
import { emailTheme } from './theme';

/**
 * Options for the forgot password email template
 */
export interface ForgotPasswordOptions {
  /** Recipient's name (optional, will use "there" if not provided) */
  userName?: string;
  /** The 6-character alphanumeric recovery code */
  recoveryCode: string;
  /** How long the code is valid (e.g., "15 minutes") */
  expiresIn?: string;
  /** App name override */
  appName?: string;
}

/**
 * Generates a 6-character alphanumeric code for password recovery
 * Uses uppercase letters and numbers for better readability
 * Excludes ambiguous characters: 0, O, I, 1, L
 *
 * @returns A 6-character alphanumeric string
 *
 * @example
 * ```typescript
 * const code = generateRecoveryCode();
 * // Returns something like: "A3B7K9"
 * ```
 */
export function generateRecoveryCode(): string {
  // Exclude ambiguous characters: 0, O, I, 1, L
  const characters = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
}

/**
 * Generates a forgot password email template
 * Includes a 6-character alphanumeric code for account recovery
 *
 * @param options - Configuration options for the email
 * @returns Complete HTML email string
 *
 * @example
 * ```typescript
 * const code = generateRecoveryCode();
 * const html = forgotPassword({
 *   userName: 'John',
 *   recoveryCode: code,
 *   expiresIn: '15 minutes',
 * });
 * ```
 */
export function forgotPassword(options: ForgotPasswordOptions): string {
  const { userName, recoveryCode, expiresIn = '15 minutes', appName = 'Sermon Helper' } = options;

  const greeting = userName ? `Hi ${userName},` : 'Hi there,';
  const { colors, fonts, spacing } = emailTheme;

  const content = `
		${heading('Reset Your Password', { align: 'center' })}
		
		${spacer('md')}
		
		${paragraph(greeting)}
		
		${paragraph(`We received a request to reset the password for your ${appName} account.`)}
		
		${paragraph('Use the code below to log into your account:')}
		
		${codeBox(recoveryCode)}
		
		${paragraph(`This code will expire in <strong>${expiresIn}</strong>.`, { align: 'center', muted: true })}
		
		${spacer('md')}
		
		${divider()}
		
		${spacer('md')}
		
		<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${colors.panelAlt}; border-radius: 8px;">
			<tr>
				<td style="padding: ${spacing.md};">
					<p style="margin: 0 0 ${spacing.xs} 0; font-family: ${fonts.primary}; font-size: 13px; color: ${colors.textSecondary};">
						<strong>Didn't request this?</strong>
					</p>
					<p style="margin: 0; font-family: ${fonts.primary}; font-size: 13px; color: ${colors.textSecondary};">
						If you didn't request a password reset, you can safely ignore this email. 
						Your password will remain unchanged.
					</p>
				</td>
			</tr>
		</table>
		
		${spacer('md')}
		
		<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFF3E0; border-radius: 8px; border-left: 4px solid ${colors.warning};">
			<tr>
				<td style="padding: ${spacing.md};">
					<p style="margin: 0; font-family: ${fonts.primary}; font-size: 13px; color: #E65100;">
						<strong>Security tip:</strong> Never share this code with anyone. Our team will never ask you for this code.
					</p>
				</td>
			</tr>
		</table>
		
		${spacer('lg')}
		
		${paragraph('Best regards,', { muted: true })}
		${paragraph(`The ${appName} Team`, { muted: true })}
	`;

  return baseLayout({
    content,
    previewText: `Your ${appName} password reset code is ${recoveryCode}`,
    appName,
    footerLinks: [
      { text: 'Help Center', url: '#' },
      { text: 'Privacy Policy', url: '#' },
    ],
  });
}
