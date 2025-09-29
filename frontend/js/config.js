class APIConfig {
    constructor() {
        // Detect if running locally
        this.isDevelopment = window.location.hostname === 'localhost' ||
                             window.location.hostname === '127.0.0.1' ||
                             window.location.hostname.includes('192.168') ||
                             window.location.hostname.includes('10.0');

        // Set baseURL depending on environment
        this.baseURL = this.isDevelopment
            ? this.getDevelopmentURL()
            : (window.NEXT_PUBLIC_API_URL || 'https://api.resumego.cloud/api');
    }

    getDevelopmentURL() {
        const hostname = window.location.hostname;

        // Accessing from mobile/device on same network
        if (hostname.includes('192.168') || hostname.includes('10.0')) {
            return `http://${hostname}:3000/api`;
        }

        // Default localhost for desktop
        return 'http://localhost:3000/api';
    }

    getFullURL(endpoint) {
        return `${this.baseURL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    }
}

// Make global instance
window.apiConfig = new APIConfig();

// Export for module usage (optional, for Node.js or bundlers)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIConfig;
}
