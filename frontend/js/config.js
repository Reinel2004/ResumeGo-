// config.js
class APIConfig {
    constructor() {
        this.isDevelopment = window.location.hostname === 'localhost' ||
                             window.location.hostname === '127.0.0.1' ||
                             window.location.hostname.includes('192.168') ||
                             window.location.hostname.includes('10.0');

        // Set baseURL depending on environment
        this.baseURL = this.isDevelopment 
            ? this.getDevelopmentURL()
            : 'https://api.resumego.cloud/api';
    }

    getDevelopmentURL() {
        const hostname = window.location.hostname;
        if (hostname.includes('192.168') || hostname.includes('10.0')) {
            return `http://${hostname}:3000/api`;
        }
        return 'http://localhost:3000/api';
    }

    getFullURL(endpoint) {
        return `${this.baseURL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    }
}

// Make a global instance
window.apiConfig = new APIConfig();
