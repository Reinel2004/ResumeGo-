const db = require("../models");
const User = db.users;
const bcrypt = require("bcryptjs");

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        console.log('Getting profile for user ID:', req.userId);
        
        const user = await User.findByPk(req.userId, {
            attributes: ['id', 'username', 'email', 'fullName', 'createdAt']
        });

        if (!user) {
            console.log('User not found');
            return res.status(404).send({ message: "User not found." });
        }

        console.log('User found:', user);
        res.status(200).send(user);
    } catch (err) {
        console.error('Error in getProfile:', err);
        res.status(500).send({ message: err.message });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        console.log('Updating profile for user ID:', req.userId);
        console.log('Update data:', req.body);
        
        const user = await User.findByPk(req.userId);

        if (!user) {
            console.log('User not found');
            return res.status(404).send({ message: "User not found." });
        }

        // Update user data
        await user.update({
            fullName: req.body.fullName,
            email: req.body.email
        });

        console.log('Profile updated successfully');
        res.status(200).send({
            message: "Profile updated successfully!",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        console.error('Error in updateProfile:', err);
        res.status(500).send({ message: err.message });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        console.log('Changing password for user ID:', req.userId);
        
        const user = await User.findByPk(req.userId);
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        // Verify current password
        const passwordIsValid = bcrypt.compareSync(
            req.body.currentPassword,
            user.password
        );

        if (!passwordIsValid) {
            return res.status(401).send({ message: "Current password is incorrect!" });
        }

        // Update password
        await user.update({
            password: bcrypt.hashSync(req.body.newPassword, 8)
        });

        console.log('Password changed successfully');
        res.status(200).send({ message: "Password changed successfully!" });
    } catch (err) {
        console.error('Error in changePassword:', err);
        res.status(500).send({ message: err.message });
    }
}; 