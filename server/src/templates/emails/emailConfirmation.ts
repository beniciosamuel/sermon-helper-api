import { baseLayout, emailButton, heading, paragraph, spacer } from './baseLayout';
import { emailTheme } from './theme';

/**
 * Options for the email confirmation template
 */
export interface EmailConfirmationOptions {
	/** Recipient's name (optional, will use "there" if not provided) */
	userName?: string;
	/** The confirmation link URL */
	confirmationUrl: string;
	/** How long the link is valid (e.g., "24 hours") */
	expiresIn?: string;
	/** App name override */
	appName?: string;
}

/**
 * Generates an email confirmation template
 * Used when a user registers and needs to verify their email address
 * 
 * @param options - Configuration options for the email
 * @returns Complete HTML email string
 * 
 * @example
 * ```typescript
 * const html = emailConfirmation({
 *   userName: 'John',
 *   confirmationUrl: 'https://app.example.com/confirm?token=abc123',
 *   expiresIn: '24 hours',
 * });
 * ```
 */
export function emailConfirmation(options: EmailConfirmationOptions): string {
	const {
		userName,
		confirmationUrl,
		expiresIn = '24 hours',
		appName = 'Sermon Helper',
	} = options;

	const greeting = userName ? `Hi ${userName},` : 'Hi there,';
	const { colors, fonts, spacing } = emailTheme;

	const content = `
		${heading('Confirm Your Email Address', { align: 'center' })}
		
		${spacer('md')}
		
		${paragraph(greeting)}
		
		${paragraph(`Welcome to ${appName}! We're excited to have you on board.`)}
		
		${paragraph('To get started, please confirm your email address by clicking the button below:')}
		
		${spacer('sm')}
		
		${emailButton('Confirm Email Address', confirmationUrl)}
		
		${spacer('sm')}
		
		${paragraph(`This link will expire in <strong>${expiresIn}</strong>. If you didn't create an account with us, you can safely ignore this email.`)}
		
		${spacer('md')}
		
		<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${colors.panelAlt}; border-radius: 8px; margin-top: ${spacing.md};">
			<tr>
				<td style="padding: ${spacing.md};">
					<p style="margin: 0 0 ${spacing.xs} 0; font-family: ${fonts.primary}; font-size: 13px; color: ${colors.textSecondary};">
						<strong>Having trouble with the button?</strong>
					</p>
					<p style="margin: 0; font-family: ${fonts.primary}; font-size: 13px; color: ${colors.textSecondary}; word-break: break-all;">
						Copy and paste this URL into your browser:
						<br>
						<a href="${confirmationUrl}" style="color: ${colors.accent}; text-decoration: none;">${confirmationUrl}</a>
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
		previewText: `Confirm your email address to get started with ${appName}`,
		appName,
		footerLinks: [
			{ text: 'Help Center', url: '#' },
			{ text: 'Privacy Policy', url: '#' },
		],
	});
}
