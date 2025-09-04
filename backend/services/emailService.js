const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // Create transporter for Gmail
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            // Suppress punycode deprecation warning
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    async sendPasswordResetEmail(email, resetToken, userName) {
        try {
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password.html?token=${resetToken}`;
            
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Password Reset Request - ResumeGo',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2563eb;">Password Reset Request</h2>
                        <p>Hello ${userName || 'User'},</p>
                        <p>We received a request to reset your password for your ResumeGo account.</p>
                        <p>Click the button below to reset your password:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" 
                               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                                Reset Password
                            </a>
                        </div>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
                        <p><strong>This link will expire in 1 hour.</strong></p>
                        <p>If you didn't request this password reset, please ignore this email.</p>
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
                        <p style="color: #64748b; font-size: 14px;">
                            This email was sent from ResumeGo. If you have any questions, please contact our support team.
                        </p>
                    </div>
                `
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Password reset email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Error sending password reset email:', error);
            return { success: false, error: error.message };
        }
    }

    async sendPasswordResetConfirmation(email, userName) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER || 'your-email@gmail.com',
                to: email,
                subject: 'Password Reset Successful - ResumeGo',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #059669;">Password Reset Successful</h2>
                        <p>Hello ${userName || 'User'},</p>
                        <p>Your password has been successfully reset for your ResumeGo account.</p>
                        <p>If you did not make this change, please contact our support team immediately.</p>
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
                        <p style="color: #64748b; font-size: 14px;">
                            This email was sent from ResumeGo. If you have any questions, please contact our support team.
                        </p>
                    </div>
                `
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Password reset confirmation email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Error sending password reset confirmation email:', error);
            return { success: false, error: error.message };
        }
    }

    async sendEmailVerification(email, verificationToken, userName) {
        try {
            const verificationUrl = `${process.env.FRONTEND_URL}/verify-email.html?token=${verificationToken}`;
            
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Verify Your Email - ResumeGo',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2563eb;">Welcome to ResumeGo!</h2>
                        <p>Hello ${userName || 'User'},</p>
                        <p>Thank you for signing up for ResumeGo! To complete your registration and start building your professional resume, please verify your email address.</p>
                        <p>Click the button below to verify your account:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationUrl}" 
                               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                                Verify Account
                            </a>
                        </div>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #2563eb;">${verificationUrl}</p>
                        <p><strong>This verification link will expire in 24 hours.</strong></p>
                        <p>If you didn't create an account with ResumeGo, please ignore this email.</p>
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
                        <p style="color: #64748b; font-size: 14px;">
                            This email was sent from ResumeGo. If you have any questions, please contact our support team.
                        </p>
                    </div>
                `
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email verification sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Error sending email verification:', error);
            return { success: false, error: error.message };
        }
    }

    async sendEmailVerificationConfirmation(email, userName) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Email Verified Successfully - ResumeGo',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #059669;">Email Verified Successfully!</h2>
                        <p>Hello ${userName || 'User'},</p>
                        <p>Congratulations! Your email has been successfully verified for your ResumeGo account.</p>
                        <p>You can now log in and start building your professional resume.</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL}/login.html" 
                               style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                                Login to ResumeGo
                            </a>
                        </div>
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
                        <p style="color: #64748b; font-size: 14px;">
                            This email was sent from ResumeGo. If you have any questions, please contact our support team.
                        </p>
                    </div>
                `
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email verification confirmation sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Error sending email verification confirmation:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new EmailService();
