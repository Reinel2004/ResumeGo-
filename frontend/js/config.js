// API Configuration for different environments
class APIConfig {
    constructor() {
        this.isDevelopment = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname.includes('192.168') ||
                           window.location.hostname.includes('10.0');
        
        this.baseURL = this.getBaseURL();
    }

    getBaseURL() {
        if (this.isDevelopment) {
            // Check if we're on mobile/network access
            const hostname = window.location.hostname;
            
            // If accessing from mobile device on same network
            if (hostname.includes('192.168') || hostname.includes('10.0')) {
                // Use the same IP as the frontend but with port 3000
                return `http://${hostname}:3000/api`;
            }
            
            // Default to localhost for desktop development
            return 'http://localhost:3000/api';
        }
        
        // Production URL (update this when you deploy)
        return 'https://your-production-domain.com/api';
    }

    getFullURL(endpoint) {
        return `${this.baseURL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    }
}

// Create global instance
window.apiConfig = new APIConfig();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIConfig;
}
