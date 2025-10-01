// Authentication utility functions
const Auth = {
    // Check if user is authenticated
    isAuthenticated: function() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        return !!(token && user);
    },

    // Get current user data
    getCurrentUser: function() {
        return JSON.parse(localStorage.getItem('user'));
    },

    // Check authentication and redirect if not authenticated
    requireAuth: function() {
        if (!this.isAuthenticated()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    },

    // Logout user
    logout: function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    },

    // Update user menu display
    updateUserMenu: function() {
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');

        if (this.isAuthenticated()) {
            const user = this.getCurrentUser();
            if (authButtons) authButtons.style.display = 'none';
            if (userMenu) userMenu.style.display = 'block';
            if (userName) userName.textContent = user.fullName || user.username;
            if (userAvatar) userAvatar.textContent = (user.fullName || user.username).charAt(0).toUpperCase();
        } else {
            if (authButtons) authButtons.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
        }
    },

    // Initialize user menu functionality
    initUserMenu: function() {
        const userMenuButton = document.getElementById('userMenuButton');
        const userDropdown = document.getElementById('userDropdown');
        const logoutButton = document.getElementById('logoutButton');

        if (userMenuButton && userDropdown) {
            // Toggle dropdown
            userMenuButton.addEventListener('click', () => {
                userDropdown.classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userMenuButton.contains(e.target) && !userDropdown.contains(e.target)) {
                    userDropdown.classList.remove('active');
                }
            });
        }

        if (logoutButton) {
            // Logout functionality
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }
}; 

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("index.html") && Auth.isAuthenticated()) {
        window.location.href = "dashboard.html";
        return;
    }

    if (window.location.pathname.includes("dashboard.html")) {
        Auth.requireAuth();
    }

    Auth.updateUserMenu();
});
