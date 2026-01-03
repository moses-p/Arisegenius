import nodemailer from 'nodemailer';
import { prisma } from '../lib/prisma';

// Email templates
const EMAIL_TEMPLATES = {
  verification: {
    subject: 'Verify Your Arisegenius Account',
    html: (token: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Account</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #090101; color: #d78a00; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; background: #d78a00; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ARISEGENIUS</h1>
            <p>Leading African Tire Innovation</p>
          </div>
          <div class="content">
            <h2>Welcome to Arisegenius!</h2>
            <p>Thank you for registering with Arisegenius. To complete your account setup, please verify your email address by clicking the button below:</p>
            <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}" class="button">Verify Email Address</a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p>${process.env.FRONTEND_URL}/verify-email?token=${token}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account with Arisegenius, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Arisegenius. All rights reserved.</p>
            <p>Leading African Tire Innovation</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  passwordReset: {
    subject: 'Reset Your Arisegenius Password',
    html: (token: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #090101; color: #d78a00; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; background: #d78a00; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ARISEGENIUS</h1>
            <p>Leading African Tire Innovation</p>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your password for your Arisegenius account. Click the button below to reset your password:</p>
            <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}" class="button">Reset Password</a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p>${process.env.FRONTEND_URL}/reset-password?token=${token}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Arisegenius. All rights reserved.</p>
            <p>Leading African Tire Innovation</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  orderConfirmation: {
    subject: 'Order Confirmation - Arisegenius',
    html: (order: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #090101; color: #d78a00; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .order-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-weight: bold; font-size: 18px; color: #d78a00; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ARISEGENIUS</h1>
            <p>Leading African Tire Innovation</p>
          </div>
          <div class="content">
            <h2>Order Confirmation</h2>
            <p>Thank you for your order! We've received your order and will process it shortly.</p>
            
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Status:</strong> ${order.status}</p>
              
              <h4>Items Ordered:</h4>
              ${order.items.map((item: any) => `
                <div class="item">
                  <span>${item.product.name} (${item.product.size}) x ${item.quantity}</span>
                  <span>$${item.totalPrice}</span>
                </div>
              `).join('')}
              
              <div class="item">
                <span>Subtotal:</span>
                <span>$${order.subtotal}</span>
              </div>
              <div class="item">
                <span>Shipping:</span>
                <span>$${order.shippingAmount}</span>
              </div>
              <div class="item">
                <span>Tax:</span>
                <span>$${order.taxAmount}</span>
              </div>
              <div class="item total">
                <span>Total:</span>
                <span>$${order.totalAmount}</span>
              </div>
            </div>
            
            <p>We'll send you another email when your order ships.</p>
            <p>If you have any questions, please contact our customer service team.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Arisegenius. All rights reserved.</p>
            <p>Leading African Tire Innovation</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  dealerApproval: {
    subject: 'Dealer Application Approved - Arisegenius',
    html: (dealer: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Dealer Application Approved</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #090101; color: #d78a00; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; background: #d78a00; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ARISEGENIUS</h1>
            <p>Leading African Tire Innovation</p>
          </div>
          <div class="content">
            <h2>Congratulations!</h2>
            <p>Your dealer application for <strong>${dealer.companyName}</strong> has been approved!</p>
            <p>You can now access the dealer portal and start managing your tire inventory.</p>
            <a href="${process.env.FRONTEND_URL}/dealer/login" class="button">Access Dealer Portal</a>
            <p>Your dealer ID is: <strong>${dealer.dealerId}</strong></p>
            <p>If you have any questions, please contact our dealer support team.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Arisegenius. All rights reserved.</p>
            <p>Leading African Tire Innovation</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
};

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Only create transporter if SMTP credentials are provided
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Create a mock transporter for development when SMTP is not configured
      this.transporter = nodemailer.createTransport({
        host: 'localhost',
        port: 587,
        secure: false,
        auth: {
          user: 'dev',
          pass: 'dev',
        },
        // Mock transport for development
        tls: {
          rejectUnauthorized: false,
        },
      });
    }
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    // Skip sending if SMTP is not configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`⚠️ Email sending disabled: Verification email would be sent to ${email}`);
      console.log(`   Verification token: ${token}`);
      return;
    }

    try {
      const template = EMAIL_TEMPLATES.verification;
      
      await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || process.env.SMTP_USER,
        to: email,
        subject: template.subject,
        html: template.html(token),
      });

      console.log(`✅ Verification email sent to ${email}`);
    } catch (error) {
      console.error('❌ Failed to send verification email:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`⚠️ Email sending disabled: Password reset email would be sent to ${email}`);
      console.log(`   Reset token: ${token}`);
      return;
    }

    try {
      const template = EMAIL_TEMPLATES.passwordReset;
      
      await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || process.env.SMTP_USER,
        to: email,
        subject: template.subject,
        html: template.html(token),
      });

      console.log(`✅ Password reset email sent to ${email}`);
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      throw error;
    }
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmationEmail(orderId: string): Promise<void> {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`⚠️ Email sending disabled: Order confirmation email would be sent for order ${orderId}`);
      return;
    }

    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      const template = EMAIL_TEMPLATES.orderConfirmation;
      
      await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || process.env.SMTP_USER,
        to: order.user.email,
        subject: template.subject,
        html: template.html(order),
      });

      console.log(`✅ Order confirmation email sent to ${order.user.email}`);
    } catch (error) {
      console.error('❌ Failed to send order confirmation email:', error);
      throw error;
    }
  }

  /**
   * Send dealer approval email
   */
  async sendDealerApprovalEmail(dealerId: string): Promise<void> {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`⚠️ Email sending disabled: Dealer approval email would be sent for dealer ${dealerId}`);
      return;
    }

    try {
      const dealer = await prisma.dealerProfile.findUnique({
        where: { id: dealerId },
        include: {
          user: true,
        },
      });

      if (!dealer) {
        throw new Error('Dealer not found');
      }

      const template = EMAIL_TEMPLATES.dealerApproval;
      
      await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || process.env.SMTP_USER,
        to: dealer.user.email,
        subject: template.subject,
        html: template.html(dealer),
      });

      console.log(`✅ Dealer approval email sent to ${dealer.user.email}`);
    } catch (error) {
      console.error('❌ Failed to send dealer approval email:', error);
      throw error;
    }
  }

  /**
   * Send custom email
   */
  async sendCustomEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<void> {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`⚠️ Email sending disabled: Custom email would be sent to ${to}`);
      console.log(`   Subject: ${subject}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || process.env.SMTP_USER,
        to,
        subject,
        html,
        text,
      });

      console.log(`✅ Custom email sent to ${to}`);
    } catch (error) {
      console.error('❌ Failed to send custom email:', error);
      throw error;
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(
    recipients: string[],
    subject: string,
    html: string,
    text?: string
  ): Promise<void> {
    try {
      const promises = recipients.map(email =>
        this.sendCustomEmail(email, subject, html, text)
      );

      await Promise.all(promises);
      console.log(`Bulk emails sent to ${recipients.length} recipients`);
    } catch (error) {
      console.error('Failed to send bulk emails:', error);
      throw error;
    }
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    // Skip verification if SMTP is not configured (development mode)
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('⚠️ Email service initialized but SMTP not configured (development mode)');
      console.log('   Email sending will be disabled. Configure SMTP settings in .env to enable.');
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('✅ Email service connection verified');
      return true;
    } catch (error: any) {
      console.error('❌ Email service connection failed:', error.message || error);
      console.log('   Email sending will be disabled until SMTP is properly configured.');
      return false;
    }
  }
}

// Create singleton instance
export const emailService = new EmailService();

// Initialize email service
export async function initializeEmailService() {
  try {
    const isConnected = await emailService.testConnection();
    if (isConnected) {
      console.log('✅ Email service initialized successfully');
    } else {
      console.log('⚠️ Email service initialized but connection failed');
    }
  } catch (error) {
    console.error('❌ Failed to initialize email service:', error);
    throw error;
  }
}
