const db = require("../models");
const User = db.users;
const PasswordReset = db.passwordResets;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const emailService = require("../services/emailService");

exports.signup = async (req, res) => {
    try {
        // Create user
        const user = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            fullName: req.body.fullName
        });

        res.status(201).send({ message: "User registered successfully!" });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.signin = async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                username: req.body.username
            }
        });

        if (!user) {
            return res.status(404).send({ message: "User Not found." });
        }

        const passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );

        if (!passwordIsValid) {
            return res.status(401).send({
                accessToken: null,
                message: "Invalid Password!"
            });
        }

        const token = jwt.sign({ id: user.id }, "your-secret-key", {
            expiresIn: 86400 // 24 hours
        });

        res.status(200).send({
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            accessToken: token
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.checkEmail = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).send({ message: "Email is required" });
        }

        // Check if email already exists
        const existingUser = await User.findOne({
            where: { email: email }
        });

        res.status(200).send({ 
            exists: !!existingUser,
            message: existingUser ? "Email already registered" : "Email available"
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).send({ message: "Email is required" });
        }

        // Check if user exists
        const user = await User.findOne({
            where: { email: email }
        });

        if (!user) {
            // For security, don't reveal if email exists or not
            return res.status(200).send({ 
                message: "If the email exists, a password reset link has been sent." 
            });
        }

        // Generate secure reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

        // Delete any existing reset tokens for this user
        await PasswordReset.destroy({
            where: { userId: user.id }
        });

        // Create new reset token
        await PasswordReset.create({
            userId: user.id,
            token: resetToken,
            expiresAt: expiresAt
        });

        // Send reset email
        const emailResult = await emailService.sendPasswordResetEmail(
            user.email, 
            resetToken, 
            user.fullName || user.username
        );

        if (!emailResult.success) {
            console.error('Failed to send reset email:', emailResult.error);
            return res.status(500).send({ 
                message: "Failed to send reset email. Please try again." 
            });
        }

        res.status(200).send({ 
            message: "If the email exists, a password reset link has been sent." 
        });
    } catch (err) {
        console.error('Error in forgotPassword:', err);
        res.status(500).send({ message: "Internal server error" });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            return res.status(400).send({ 
                message: "Token and new password are required" 
            });
        }

        // Find the reset token
        const resetRecord = await PasswordReset.findOne({
            where: { token: token },
            include: [{
                model: User,
                as: 'user'
            }]
        });

        if (!resetRecord) {
            return res.status(400).send({ 
                message: "Invalid or expired reset token" 
            });
        }

        // Check if token is expired
        if (new Date() > resetRecord.expiresAt) {
            // Delete expired token
            await PasswordReset.destroy({
                where: { id: resetRecord.id }
            });
            return res.status(400).send({ 
                message: "Reset token has expired. Please request a new one." 
            });
        }

        // Check if token has already been used
        if (resetRecord.used) {
            return res.status(400).send({ 
                message: "Reset token has already been used" 
            });
        }

        // Update user password
        const hashedPassword = bcrypt.hashSync(newPassword, 8);
        await User.update(
            { password: hashedPassword },
            { where: { id: resetRecord.userId } }
        );

        // Mark token as used
        await PasswordReset.update(
            { used: true },
            { where: { id: resetRecord.id } }
        );

        // Send confirmation email
        await emailService.sendPasswordResetConfirmation(
            resetRecord.user.email,
            resetRecord.user.fullName || resetRecord.user.username
        );

        res.status(200).send({ 
            message: "Password has been reset successfully" 
        });
    } catch (err) {
        console.error('Error in resetPassword:', err);
        res.status(500).send({ message: "Internal server error" });
    }
};

exports.validateResetToken = async (req, res) => {
    try {
        const { token } = req.params;
        
        if (!token) {
            return res.status(400).send({ 
                message: "Token is required" 
            });
        }

        // Find the reset token
        const resetRecord = await PasswordReset.findOne({
            where: { token: token }
        });

        if (!resetRecord) {
            return res.status(400).send({ 
                valid: false,
                message: "Invalid reset token" 
            });
        }

        // Check if token is expired
        if (new Date() > resetRecord.expiresAt) {
            return res.status(400).send({ 
                valid: false,
                message: "Reset token has expired" 
            });
        }

        // Check if token has already been used
        if (resetRecord.used) {
            return res.status(400).send({ 
                valid: false,
                message: "Reset token has already been used" 
            });
        }

        res.status(200).send({ 
            valid: true,
            message: "Token is valid" 
        });
    } catch (err) {
        console.error('Error in validateResetToken:', err);
        res.status(500).send({ message: "Internal server error" });
    }
}; 