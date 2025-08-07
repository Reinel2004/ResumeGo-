import { authAPI } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Basic validation
        if (!username || !password) {
            showError('Please fill in all fields');
            return;
        }

        try {
            const response = await authAPI.signin({ username, password });
            
            if (response.accessToken) {
                // Store the token and user data
                localStorage.setItem('token', response.accessToken);
                localStorage.setItem('user', JSON.stringify({
                    id: response.id,
                    username: response.username,
                    email: response.email,
                    fullName: response.fullName
                }));

                // Redirect to dashboard or home page
                window.location.href = 'dashboard.html';
            } else {
                showError(response.message || 'Login failed');
            }
        } catch (error) {
            showError(error.message || 'An error occurred during login');
            console.error('Login error:', error);
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.className = 'message error-message';
        errorMessage.style.display = 'block';
    }
}); 