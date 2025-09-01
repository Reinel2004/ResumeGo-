import { authAPI } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('forgotPasswordForm');
    const emailInput = document.getElementById('email');
    const submitBtn = document.getElementById('submitBtn');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        if (!email) {
            showError('Please enter your email address.');
            return;
        }

        if (!isValidEmail(email)) {
            showError('Please enter a valid email address.');
            return;
        }

        // Show loading state
        setLoading(true);
        hideMessages();

        try {
            const response = await authAPI.forgotPassword(email);
            
            // Show success message
            showSuccess(response.message || 'If the email exists, a password reset link has been sent.');
            
            // Clear form
            emailInput.value = '';
            
        } catch (error) {
            console.error('Forgot password error:', error);
            showError(error.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    });

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

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
});
