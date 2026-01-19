/**
 * Email theme configuration
 * Mirrors the frontend design system for consistent branding
 */

export const emailTheme = {
	// Colors - matching frontend theme
	colors: {
		// Primary accent colors
		accent: '#E91E63',
		accentAlt: '#FF4D8D',
		accentLight: '#FCE4EC',
		
		// Background colors
		background: '#F5F5FA',
		panel: '#FFFFFF',
		panelAlt: '#EAEAF0',
		
		// Text colors
		textPrimary: '#1A1A1A',
		textSecondary: '#555555',
		textMuted: '#888888',
		
		// Utility colors
		border: '#E0E0E0',
		success: '#4CAF50',
		warning: '#FF9800',
		error: '#F44336',
	},
	
	// Typography - safe email fonts matching frontend
	fonts: {
		primary: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
		mono: "Monaco, Consolas, 'Courier New', monospace",
	},
	
	// Spacing
	spacing: {
		xs: '8px',
		sm: '12px',
		md: '16px',
		lg: '24px',
		xl: '32px',
		xxl: '48px',
	},
	
	// Border radius
	borderRadius: {
		sm: '4px',
		md: '8px',
		lg: '12px',
	},
} as const;

export type EmailTheme = typeof emailTheme;
