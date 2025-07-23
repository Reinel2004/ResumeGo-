// Validate required environment variables
function validateEnvVars() {
    const required = [
        'REMOVEBG_API_KEY',
        'JWT_SECRET',
        'EMAILJS_PUBLIC_KEY',
        'TOGETHER_API_KEY'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        console.warn('⚠️  WARNING: Missing environment variables:', missing.join(', '));
        console.warn('Please check your .env file');
        console.warn('Some features may not work properly without these variables.');
    }
    
    // Check for empty values
    const empty = required.filter(key => process.env[key] === '');
    if (empty.length > 0) {
        console.warn('⚠️  WARNING: Empty environment variables:', empty.join(', '));
        console.warn('These should be set to valid values in your .env file');
    }
}

// Run validation
validateEnvVars();

// Configuration validation function
function validateConfig() {
    const config = {
        emailjs: {
            publicKey: process.env.EMAILJS_PUBLIC_KEY || '',
            serviceId: process.env.EMAILJS_SERVICE_ID || '',
            templateId: process.env.EMAILJS_TEMPLATE_ID || ''
        },
        removebg: {
            apiKey: process.env.REMOVEBG_API_KEY || ''
        },
        jwt: {
            secret: process.env.JWT_SECRET || ''
        },
        together: {
            apiKey: process.env.TOGETHER_API_KEY || ''
        },
        database: {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            name: process.env.DB_NAME || 'resume_generator'
        },
        server: {
            port: process.env.PORT || 3000,
            nodeEnv: process.env.NODE_ENV || 'development'
        }
    };

    // Validate critical configurations
    if (!config.jwt.secret) {
        console.error('❌ ERROR: JWT_SECRET is required for authentication');
    }
    
    if (!config.removebg.apiKey) {
        console.warn('⚠️  WARNING: RemoveBG API key not set - background removal feature disabled');
    }
    
    if (!config.emailjs.publicKey) {
        console.warn('⚠️  WARNING: EmailJS public key not set - email verification feature disabled');
    }
    
    if (!config.emailjs.serviceId || !config.emailjs.templateId) {
        console.warn('⚠️  WARNING: EmailJS service ID or template ID not set - email verification may fail');
    }

    return config;
}

module.exports = validateConfig(); 