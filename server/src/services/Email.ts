import { Resend } from 'resend';
import { Secrets } from './Secrets';

/**
 * Email sending options interface
 */
export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

/**
 * Email sending result interface
 */
export interface SendEmailResult {
  id: string;
  success: boolean;
}

/**
 * Custom error class for email-related errors
 */
export class EmailServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'EmailServiceError';
  }
}

/**
 * Email service for sending transactional emails using Resend API
 */
export class EmailService {
  public readonly resendApiKey: string;
  private readonly resend: Resend;
  private defaultFrom: string;

  private constructor(args: { resendApiKey: string; defaultFrom: string }) {
    this.resendApiKey = args.resendApiKey;
    this.defaultFrom = args.defaultFrom;
    this.resend = new Resend(args.resendApiKey);
  }

  /**
   * Initialize the email service with the Resend API key
   * @throws {EmailServiceError} If initialization fails
   */
  static async initialize(): Promise<EmailService> {
    try {
      const secrets = new Secrets();

      return new EmailService({
        resendApiKey: await secrets.getResendApiKey(),
        defaultFrom: 'onboarding@resend.dev',
      });
    } catch (error) {
      if (error instanceof EmailServiceError) {
        throw error;
      }

      throw new EmailServiceError(
        'Failed to initialize email service',
        'INITIALIZATION_FAILED',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Set the default "from" address for emails
   */
  public setDefaultFrom(from: string): void {
    this.defaultFrom = from;
  }

  /**
   * Send an email using Resend
   * @param to - Recipient email address(es)
   * @param subject - Email subject line
   * @param html - HTML content of the email
   * @param text - Optional plain text version of the email
   * @returns SendEmailResult with the email ID and success status
   * @throws {EmailServiceError} If sending fails
   */
  public async sendEmail(
    to: string | string[],
    subject: string,
    html: string,
    text?: string
  ): Promise<SendEmailResult> {
    return this.send({
      to,
      subject,
      html,
      text,
    });
  }

  /**
   * Send an email with full options
   * @param options - Email sending options
   * @returns SendEmailResult with the email ID and success status
   * @throws {EmailServiceError} If sending fails
   */
  public async send(options: SendEmailOptions): Promise<SendEmailResult> {
    // Validate required fields
    if (!options.to || (Array.isArray(options.to) && options.to.length === 0)) {
      throw new EmailServiceError('Recipient email address is required', 'INVALID_RECIPIENT');
    }

    if (!options.subject || options.subject.trim() === '') {
      throw new EmailServiceError('Email subject is required', 'INVALID_SUBJECT');
    }

    if (!options.html || options.html.trim() === '') {
      throw new EmailServiceError('Email HTML content is required', 'INVALID_CONTENT');
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: options.from || this.defaultFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
      });

      if (error) {
        // eslint-disable-next-line no-console
        console.error('Resend API error:', error);
        throw new EmailServiceError(error.message || 'Failed to send email', 'RESEND_API_ERROR');
      }

      if (!data?.id) {
        throw new EmailServiceError('No email ID returned from Resend', 'NO_EMAIL_ID');
      }

      // eslint-disable-next-line no-console
      console.log(`Email sent successfully. ID: ${data.id}`);

      return {
        id: data.id,
        success: true,
      };
    } catch (error) {
      if (error instanceof EmailServiceError) {
        throw error;
      }

      // eslint-disable-next-line no-console
      console.error('Failed to send email:', error);
      throw new EmailServiceError(
        'Failed to send email',
        'SEND_FAILED',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }
}
