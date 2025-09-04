const db = require("../models");
const User = db.users;
const PasswordReset = db.passwordResets;
const EmailVerification = db.emailVerifications;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const emailService = require("../services/emailService");

exports.signup = async (req, res) => {
    try {
        // Create user with email verification disabled by default
        const user = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            fullName: req.body.fullName,
            isEmailVerified: false
        });

        // Generate secure verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        // Create email verification record
        await EmailVerification.create({
            userId: user.id,
            token: verificationToken,
            expiresAt: expiresAt
        });

        // Send verification email
        const emailResult = await emailService.sendEmailVerification(
            user.email, 
            verificationToken, 
            user.fullName || user.username
        );

        if (!emailResult.success) {
            console.error('Failed to send verification email:', emailResult.error);
            // Don't fail registration if email fails, but log the error
        }

        res.status(201).send({ 
            message: "User registered successfully! Please check your email to verify your account.",
            emailSent: emailResult.success
        });
    } catch (err) {
        console.error('Error in signup:', err);
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

        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(403).send({
                accessToken: null,
                message: "Please verify your email address before logging in. Check your inbox for a verification email.",
                emailVerified: false
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
            accessToken: token,
            emailVerified: true
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

exports.updateUser = async (req, res) => {
    try {
        const { fullName, email } = req.body;
        const userId = req.userId; // From JWT middleware
        
        if (!userId) {
            return res.status(401).send({ message: "Not authenticated" });
        }

        // Check if email is being changed and if it's already taken
        if (email) {
            const existingUser = await User.findOne({
                where: { 
                    email: email,
                    id: { [db.Sequelize.Op.ne]: userId } // Exclude current user
                }
            });

            if (existingUser) {
                return res.status(400).send({ 
                    message: "Email is already registered by another user" 
                });
            }
        }

        // Update user data
        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (email) updateData.email = email;

        await User.update(updateData, {
            where: { id: userId }
        });

        // Get updated user data
        const updatedUser = await User.findByPk(userId, {
            attributes: ['id', 'username', 'email', 'fullName', 'createdAt', 'updatedAt']
        });

        res.status(200).send({
            message: "User updated successfully",
            user: updatedUser
        });
    } catch (err) {
        console.error('Error updating user:', err);
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

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        
        if (!token) {
            return res.status(400).send({ 
                message: "Verification token is required" 
            });
        }

        // Find the verification token
        const verificationRecord = await EmailVerification.findOne({
            where: { token: token }
        });

        if (!verificationRecord) {
            return res.status(400).send({ 
                message: "Invalid verification token" 
            });
        }

        // Check if token is expired
        if (new Date() > verificationRecord.expiresAt) {
            // Delete expired token
            await EmailVerification.destroy({
                where: { id: verificationRecord.id }
            });
            return res.status(400).send({ 
                message: "Verification token has expired. Please request a new verification email." 
            });
        }

        // Check if token has already been used
        if (verificationRecord.used) {
            return res.status(400).send({ 
                message: "This verification token has already been used" 
            });
        }

        // Get the user to check verification status
        const user = await User.findByPk(verificationRecord.userId);
        if (!user) {
            return res.status(400).send({ 
                message: "User not found" 
            });
        }

        // Check if user is already verified
        if (user.isEmailVerified) {
            return res.status(400).send({ 
                message: "Email address is already verified" 
            });
        }

        // Update user verification status
        await User.update(
            { 
                isEmailVerified: true,
                emailVerifiedAt: new Date()
            },
            { where: { id: verificationRecord.userId } }
        );

        // Mark token as used
        await EmailVerification.update(
            { used: true },
            { where: { id: verificationRecord.id } }
        );

        // Send confirmation email
        await emailService.sendEmailVerificationConfirmation(
            user.email,
            user.fullName || user.username
        );

        res.status(200).send({ 
            message: "Email verified successfully! You can now log in to your account.",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName
            }
        });
    } catch (err) {
        console.error('Error in verifyEmail:', err);
        res.status(500).send({ message: "Internal server error" });
    }
};

exports.resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).send({ 
                message: "Email is required" 
            });
        }

        // Find user by email
        const user = await User.findOne({
            where: { email: email }
        });

        if (!user) {
            // For security, don't reveal if email exists or not
            return res.status(200).send({ 
                message: "If the email exists and is not verified, a verification email has been sent." 
            });
        }

        // Check if user is already verified
        if (user.isEmailVerified) {
            return res.status(400).send({ 
                message: "Email address is already verified" 
            });
        }

        // Delete any existing verification tokens for this user
        await EmailVerification.destroy({
            where: { userId: user.id }
        });

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        // Create new verification token
        await EmailVerification.create({
            userId: user.id,
            token: verificationToken,
            expiresAt: expiresAt
        });

        // Send verification email
        const emailResult = await emailService.sendEmailVerification(
            user.email, 
            verificationToken, 
            user.fullName || user.username
        );

        if (!emailResult.success) {
            console.error('Failed to send verification email:', emailResult.error);
            return res.status(500).send({ 
                message: "Failed to send verification email. Please try again." 
            });
        }

        res.status(200).send({ 
            message: "If the email exists and is not verified, a verification email has been sent." 
        });
    } catch (err) {
        console.error('Error in resendVerificationEmail:', err);
        res.status(500).send({ message: "Internal server error" });
    }
}; 