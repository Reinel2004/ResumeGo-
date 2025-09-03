import { authAPI } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');
    const emailInput = document.getElementById('email');
    const emailValidation = document.getElementById('emailValidation');
    const emailSpinner = document.getElementById('emailSpinner');
    
    let emailValidationTimeout;
    let isEmailValid = false;

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const firstName = document.getElementById('firstName').value.trim();
        const middleName = document.getElementById('middleName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();

        
        const fullName = [firstName, middleName, lastName].filter(name => name.trim()).join(' ');

        // Validation
        if (!username || !email || !password || !confirmPassword || !firstName || !lastName) {
            showError('Please fill in all required fields (First Name, Last Name, Username, Email, Password, and Confirm Password)');
            return;
        }

        // Additional validation for empty strings after trimming
        if (username === '' || email === '' || firstName === '' || lastName === '') {
            showError('Please fill in all required fields (First Name, Last Name, Username, Email, Password, and Confirm Password)');
            return;
        }

        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            showError('Password must be at least 6 characters long');
            return;
        }

        if (!isValidEmail(email)) {
            showError('Please enter a valid email address');
            return;
        }

        // Check if email is available
        if (!isEmailValid) {
            showError('Please enter a valid and available email address');
            return;
        }

        try {
            console.log('Attempting to register with:', { username, email, fullName });
            const response = await authAPI.signup({
                username,
                email,
                password,
                fullName
            });

            console.log('Registration response:', response);

            if (response.message === 'User registered successfully!') {
                // Show success message
                showSuccess('Registration successful! Redirecting to login...');
                
                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showError(response.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Detailed registration error:', error);
            showError(`Registration failed: ${error.message || 'Unknown error'}`);
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.className = 'message error-message show';
    }

    function showSuccess(message) {
        errorMessage.textContent = message;
        errorMessage.className = 'message success-message show';
    }

    // Email validation function
    async function validateEmail(email) {
        if (!email || !isValidEmail(email)) {
            hideEmailValidation();
            return false;
        }

        showEmailValidating();
        
        try {
            // Step 1: Check if email exists in your database
            const dbResponse = await fetch('http://localhost:3000/api/auth/check-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email })
            });
            
            const dbResult = await dbResponse.json();
            
            if (dbResult.exists) {
                showEmailUnavailable();
                return false;
            }

            // Step 2: Skip email verification for now (optional feature)
            // Email verification via sending test emails is unreliable and can cause false negatives
            // The email format validation above is sufficient for registration
            console.log('Email format is valid and not already registered');
            showEmailAvailable();
            return true;
            
        } catch (error) {
            console.error('Email validation error:', error);
            // Fallback: assume email is available if validation fails
            showEmailAvailable();
            return true;
        }
    }

    // Email validation event listener
    emailInput.addEventListener('input', (e) => {
        const email = e.target.value.trim();
        
        // Clear previous timeout
        if (emailValidationTimeout) {
            clearTimeout(emailValidationTimeout);
        }
        
        // Hide validation if email is empty
        if (!email) {
            hideEmailValidation();
            return;
        }
        
        // Validate email format first
        if (!isValidEmail(email)) {
            showEmailInvalid();
            return;
        }
        
        // Debounce email validation (wait 500ms after user stops typing)
        emailValidationTimeout = setTimeout(() => {
            validateEmail(email);
        }, 500);
    });

    // Email validation display functions
    function showEmailValidating() {
        emailSpinner.classList.add('show');
        emailValidation.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking email availability...';
        emailValidation.className = 'email-validation validating';
        isEmailValid = false;
    }

    function showEmailAvailable() {
        emailSpinner.classList.remove('show');
        emailValidation.innerHTML = '<i class="fas fa-check"></i> Email is available';
        emailValidation.className = 'email-validation available';
        isEmailValid = true;
    }

    function showEmailUnavailable() {
        emailSpinner.classList.remove('show');
        emailValidation.innerHTML = '<i class="fas fa-times"></i> Email is already registered';
        emailValidation.className = 'email-validation unavailable';
        isEmailValid = false;
    }

    function showEmailInvalid() {
        emailSpinner.classList.remove('show');
        emailValidation.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Please enter a valid email address';
        emailValidation.className = 'email-validation unavailable';
        isEmailValid = false;
    }

    function showEmailWarning(message) {
        emailSpinner.classList.remove('show');
        emailValidation.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ' + message;
        emailValidation.className = 'email-validation warning';
        isEmailValid = true; // Still allow registration
    }

    function hideEmailValidation() {
        emailSpinner.classList.remove('show');
        emailValidation.innerHTML = '';
        emailValidation.className = 'email-validation';
        isEmailValid = false;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}); 