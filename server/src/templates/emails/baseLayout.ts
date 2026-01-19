import { emailTheme } from './theme';

/**
 * Options for the base email layout
 */
export interface BaseLayoutOptions {
	/** The main content of the email */
	content: string;
	/** Optional preview text shown in email clients */
	previewText?: string;
	/** Year for copyright notice (defaults to current year) */
	copyrightYear?: number;
	/** Company/app name */
	appName?: string;
	/** Optional footer links */
	footerLinks?: Array<{ text: string; url: string }>;
}

/**
 * Generates the base email layout with header, footer, and consistent styling
 * This layout is responsive and compatible with major email clients
 */
export function baseLayout(options: BaseLayoutOptions): string {
	const {
		content,
		previewText = '',
		copyrightYear = new Date().getFullYear(),
		appName = 'Sermon Helper',
		footerLinks = [],
	} = options;

	const { colors, fonts, spacing, borderRadius } = emailTheme;

	// Generate footer links HTML
	const footerLinksHtml = footerLinks.length > 0
		? footerLinks
			.map(link => `<a href="${link.url}" style="color: ${colors.accent}; text-decoration: none;">${link.text}</a>`)
			.join(' &middot; ')
		: '';

	return `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
	<meta charset="utf-8">
	<meta name="x-apple-disable-message-reformatting">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
	<!--[if mso]>
	<noscript>
		<xml>
			<o:OfficeDocumentSettings>
				<o:PixelsPerInch>96</o:PixelsPerInch>
			</o:OfficeDocumentSettings>
		</xml>
	</noscript>
	<style>
		td, th, div, p, a, h1, h2, h3, h4, h5, h6 {
			font-family: "Segoe UI", sans-serif;
			mso-line-height-rule: exactly;
		}
	</style>
	<![endif]-->
	<title>${appName}</title>
	<style>
		/* Reset styles */
		body, table, td, a {
			-webkit-text-size-adjust: 100%;
			-ms-text-size-adjust: 100%;
		}
		table, td {
			mso-table-lspace: 0pt;
			mso-table-rspace: 0pt;
		}
		img {
			-ms-interpolation-mode: bicubic;
			border: 0;
			height: auto;
			line-height: 100%;
			outline: none;
			text-decoration: none;
		}
		table {
			border-collapse: collapse !important;
		}
		body {
			height: 100% !important;
			margin: 0 !important;
			padding: 0 !important;
			width: 100% !important;
		}
		
		/* iOS BLUE LINKS */
		a[x-apple-data-detectors] {
			color: inherit !important;
			text-decoration: none !important;
			font-size: inherit !important;
			font-family: inherit !important;
			font-weight: inherit !important;
			line-height: inherit !important;
		}
		
		/* Responsive styles */
		@media only screen and (max-width: 600px) {
			.container {
				width: 100% !important;
				max-width: 100% !important;
			}
			.content-padding {
				padding-left: 16px !important;
				padding-right: 16px !important;
			}
			.mobile-stack {
				display: block !important;
				width: 100% !important;
			}
		}
	</style>
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.background}; font-family: ${fonts.primary};">
	<!-- Preview text -->
	${previewText ? `
	<div style="display: none; max-height: 0; overflow: hidden;">
		${previewText}
		${'&zwnj;&nbsp;'.repeat(90)}
	</div>
	` : ''}
	
	<!-- Email wrapper -->
	<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${colors.background};">
		<tr>
			<td align="center" style="padding: ${spacing.xl} ${spacing.md};">
				<!-- Email container -->
				<table role="presentation" class="container" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%;">
					
					<!-- Header -->
					<tr>
						<td align="center" style="padding-bottom: ${spacing.lg};">
							<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
								<tr>
									<td align="center" style="padding: ${spacing.md} 0;">
										<!-- Logo/Brand -->
										<h1 style="margin: 0; font-size: 28px; font-weight: 700; color: ${colors.accent}; font-family: ${fonts.primary};">
											${appName}
										</h1>
									</td>
								</tr>
							</table>
						</td>
					</tr>
					
					<!-- Main content card -->
					<tr>
						<td>
							<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${colors.panel}; border-radius: ${borderRadius.lg}; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);">
								<tr>
									<td class="content-padding" style="padding: ${spacing.xl};">
										${content}
									</td>
								</tr>
							</table>
						</td>
					</tr>
					
					<!-- Footer -->
					<tr>
						<td align="center" style="padding-top: ${spacing.xl};">
							<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
								${footerLinksHtml ? `
								<tr>
									<td align="center" style="padding-bottom: ${spacing.md};">
										<p style="margin: 0; font-size: 14px; line-height: 1.5; color: ${colors.textSecondary}; font-family: ${fonts.primary};">
											${footerLinksHtml}
										</p>
									</td>
								</tr>
								` : ''}
								<tr>
									<td align="center">
										<p style="margin: 0; font-size: 12px; line-height: 1.5; color: ${colors.textMuted}; font-family: ${fonts.primary};">
											&copy; ${copyrightYear} ${appName}. All rights reserved.
										</p>
									</td>
								</tr>
								<tr>
									<td align="center" style="padding-top: ${spacing.sm};">
										<p style="margin: 0; font-size: 12px; line-height: 1.5; color: ${colors.textMuted}; font-family: ${fonts.primary};">
											This is an automated message. Please do not reply directly to this email.
										</p>
									</td>
								</tr>
							</table>
						</td>
					</tr>
					
				</table>
			</td>
		</tr>
	</table>
</body>
</html>
`.trim();
}

/**
 * Creates a styled button for use in email templates
 */
export function emailButton(text: string, url: string, options?: {
	variant?: 'primary' | 'secondary';
	fullWidth?: boolean;
}): string {
	const { variant = 'primary', fullWidth = false } = options ?? {};
	const { colors, spacing, borderRadius, fonts } = emailTheme;

	const backgroundColor = variant === 'primary' ? colors.accent : 'transparent';
	const textColor = variant === 'primary' ? '#FFFFFF' : colors.accent;
	const border = variant === 'secondary' ? `2px solid ${colors.accent}` : 'none';
	const width = fullWidth ? 'width: 100%;' : '';

	return `
<table role="presentation" cellpadding="0" cellspacing="0" ${fullWidth ? 'width="100%"' : ''} style="margin: ${spacing.md} 0;">
	<tr>
		<td align="center">
			<!--[if mso]>
			<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" 
				href="${url}" style="height: 48px; v-text-anchor: middle; ${width}" 
				arcsize="17%" strokecolor="${colors.accent}" ${variant === 'primary' ? `fillcolor="${backgroundColor}"` : 'filled="false"'}>
			<w:anchorlock/>
			<center style="color: ${textColor}; font-family: ${fonts.primary}; font-size: 16px; font-weight: 600;">
				${text}
			</center>
			</v:roundrect>
			<![endif]-->
			<!--[if !mso]><!-->
			<a href="${url}" target="_blank" style="
				display: inline-block;
				${width}
				background-color: ${backgroundColor};
				color: ${textColor};
				font-family: ${fonts.primary};
				font-size: 16px;
				font-weight: 600;
				text-decoration: none;
				padding: ${spacing.sm} ${spacing.xl};
				border-radius: ${borderRadius.md};
				border: ${border};
				text-align: center;
				mso-padding-alt: 0;
			">
				${text}
			</a>
			<!--<![endif]-->
		</td>
	</tr>
</table>
`.trim();
}

/**
 * Creates a styled code/token display box for verification codes
 */
export function codeBox(code: string): string {
	const { colors, spacing, borderRadius, fonts } = emailTheme;

	return `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: ${spacing.lg} 0;">
	<tr>
		<td align="center">
			<div style="
				display: inline-block;
				background-color: ${colors.panelAlt};
				border: 1px solid ${colors.border};
				border-radius: ${borderRadius.md};
				padding: ${spacing.lg} ${spacing.xl};
			">
				<span style="
					font-family: ${fonts.mono};
					font-size: 32px;
					font-weight: 700;
					letter-spacing: 8px;
					color: ${colors.accent};
				">${code}</span>
			</div>
		</td>
	</tr>
</table>
`.trim();
}

/**
 * Creates a paragraph with consistent styling
 */
export function paragraph(text: string, options?: {
	align?: 'left' | 'center' | 'right';
	muted?: boolean;
}): string {
	const { align = 'left', muted = false } = options ?? {};
	const { colors, fonts, spacing } = emailTheme;

	const textColor = muted ? colors.textSecondary : colors.textPrimary;

	return `
<p style="
	margin: 0 0 ${spacing.md} 0;
	font-family: ${fonts.primary};
	font-size: 16px;
	line-height: 1.6;
	color: ${textColor};
	text-align: ${align};
">${text}</p>
`.trim();
}

/**
 * Creates a heading with consistent styling
 */
export function heading(text: string, options?: {
	level?: 1 | 2 | 3;
	align?: 'left' | 'center' | 'right';
}): string {
	const { level = 2, align = 'left' } = options ?? {};
	const { colors, fonts, spacing } = emailTheme;

	const fontSize = level === 1 ? '28px' : level === 2 ? '24px' : '20px';
	const marginBottom = level === 1 ? spacing.lg : spacing.md;

	return `
<h${level} style="
	margin: 0 0 ${marginBottom} 0;
	font-family: ${fonts.primary};
	font-size: ${fontSize};
	font-weight: 600;
	line-height: 1.3;
	color: ${colors.textPrimary};
	text-align: ${align};
">${text}</h${level}>
`.trim();
}

/**
 * Creates a divider line
 */
export function divider(): string {
	const { colors, spacing } = emailTheme;

	return `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: ${spacing.lg} 0;">
	<tr>
		<td style="border-top: 1px solid ${colors.border};"></td>
	</tr>
</table>
`.trim();
}

/**
 * Creates a spacer
 */
export function spacer(size: 'sm' | 'md' | 'lg' | 'xl' = 'md'): string {
	const { spacing } = emailTheme;
	const height = spacing[size];

	return `<div style="height: ${height};"></div>`;
}
