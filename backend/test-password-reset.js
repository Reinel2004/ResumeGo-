// Test script to verify password reset functionality
const db = require("./models");
const User = db.users;
const PasswordReset = db.passwordResets;

async function testPasswordResetModel() {
    try {
        console.log('Testing password reset model...');
        
        // Test database connection
        await db.sequelize.authenticate();
        console.log('✓ Database connection established successfully.');
        
        // Test model creation
        const testReset = await PasswordReset.create({
            userId: 1, // Assuming user with ID 1 exists
            token: 'test-token-123',
            expiresAt: new Date(Date.now() + 3600000) // 1 hour from now
        });
        
        console.log('✓ Password reset record created:', testReset.id);
        
        // Test model retrieval
        const foundReset = await PasswordReset.findOne({
            where: { token: 'test-token-123' }
        });
        
        if (foundReset) {
            console.log('✓ Password reset record found:', foundReset.id);
        } else {
            console.log('✗ Password reset record not found');
        }
        
        // Clean up test data
        await PasswordReset.destroy({
            where: { token: 'test-token-123' }
        });
        
        console.log('✓ Test data cleaned up');
        console.log('Password reset model test completed successfully!');
        
    } catch (error) {
        console.error('Test failed:', error.message);
    } finally {
        await db.sequelize.close();
    }
}

// Run the test
testPasswordResetModel();
