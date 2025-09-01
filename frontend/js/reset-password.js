import { authAPI } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('resetPasswordForm');
    const tokenError = document.getElementById('tokenError');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const submitBtn = document.getElementById('submitBtn');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    // Get token from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        showTokenError();
        return;
    }

    // Validate token on page load
    validateToken();

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        // Validate passwords
        if (!newPassword) {
            showError('Please enter a new password.');
            return;
        }

        if (newPassword.length < 6) {
            showError('Password must be at least 6 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            showError('Passwords do not match.');
            return;
        }

        // Show loading state
        setLoading(true);
        hideMessages();

        try {
            const response = await authAPI.resetPassword(token, newPassword);
            
            // Show success message
            showSuccess(response.message || 'Password has been reset successfully!');
            
            // Clear form
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
            
        } catch (error) {
            console.error('Reset password error:', error);
            showError(error.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    });

    async function validateToken() {
        try {
            const response = await authAPI.validateResetToken(token);
            
            if (response.valid) {
                // Token is valid, show the form
                form.classList.remove('hidden');
                tokenError.classList.add('hidden');
            } else {
                showTokenError();
            }
        } catch (error) {
            console.error('Token validation error:', error);
            showTokenError();
        }
    }

    function showTokenError() {
        tokenError.classList.remove('hidden');
        form.classList.add('hidden');
    }

    function setLoading(isLoading) {
        const submitText = document.getElementById('submitText');
        const loading = document.getElementById('loading');
        
        submitBtn.disabled = isLoading;
        if (isLoading) {
            submitText.classList.add('hidden');
            loading.classList.remove('hidden');
        } else {
            submitText.classList.remove('hidden');
            loading.classList.add('hidden');
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        successMessage.classList.add('hidden');
    }

    function showSuccess(message) {
        successMessage.textContent = message;
        successMessage.classList.remove('hidden');
        errorMessage.classList.add('hidden');
    }

    function hideMessages() {
        errorMessage.classList.add('hidden');
        successMessage.classList.add('hidden');
    }
});
