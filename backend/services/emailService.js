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
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password.html?token=${resetToken}`;
            
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
}

module.exports = new EmailService();
