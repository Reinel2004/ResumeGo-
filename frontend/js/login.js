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
                // Check if it's an email verification error
                if (response.emailVerified === false) {
                    showEmailVerificationError(response.message);
                } else {
                    showError(response.message || 'Login failed');
                }
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

    function showEmailVerificationError(message) {
        errorMessage.innerHTML = `
            <div style="text-align: center;">
                <p>${message}</p>
                <div style="margin-top: 15px;">
                    <button onclick="resendVerificationEmail()" class="btn btn-primary" style="margin-right: 10px;">
                        Resend Verification Email
                    </button>
                    <button onclick="window.location.href='register.html'" class="btn btn-secondary">
                        Register Again
                    </button>
                </div>
            </div>
        `;
        errorMessage.className = 'message error-message';
        errorMessage.style.display = 'block';
    }

    // Global function for resending verification email
    window.resendVerificationEmail = async function() {
        const username = document.getElementById('username').value;
        if (!username) {
            showError('Please enter your username first');
            return;
        }

        try {
            // We need to get the email from the username, but since we don't have that info,
            // we'll show a form to enter the email
            const email = prompt('Please enter your email address to resend the verification email:');
            if (!email) return;

            const response = await fetch('http://localhost:3000/api/auth/resend-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email })
            });

            const data = await response.json();
            
            if (response.ok) {
                showError(`<div style="color: #4caf50;">${data.message}</div>`);
            } else {
                showError(data.message);
            }
        } catch (error) {
            showError('Failed to resend verification email. Please try again.');
        }
    };
}); 