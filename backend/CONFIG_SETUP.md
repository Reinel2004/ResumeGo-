# Configuration Setup Guide

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

### Required Variables
```env
# JWT Authentication (REQUIRED)
JWT_SECRET=your_super_secure_jwt_secret_key_here

# EmailJS Configuration (REQUIRED for email verification)
EMAILJS_PUBLIC_KEY=your_emailjs_public_key_here
EMAILJS_SERVICE_ID=service_pmhrkn5
EMAILJS_TEMPLATE_ID=template_whdyqef

# RemoveBG API (REQUIRED for background removal)
REMOVEBG_API_KEY=your_removebg_api_key_here
```

### Optional Variables
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=resumego_db

# Server Configuration
PORT=3000
NODE_ENV=development
```

## Security Best Practices

### ✅ DO:
- Store all sensitive keys in environment variables
- Use strong, unique JWT secrets
- Keep your `.env` file in `.gitignore`
- Regularly rotate API keys
- Use different keys for development and production

### ❌ DON'T:
- Hardcode API keys in source code
- Commit `.env` files to version control
- Share API keys publicly
- Use weak JWT secrets
- Use the same keys across environments

## Configuration Validation

The `api.config.js` file automatically validates your configuration on startup:

- **Missing variables**: Shows warnings but allows startup
- **Empty variables**: Shows warnings for empty values
- **Critical errors**: Shows errors for required JWT secret

## Feature Dependencies

| Feature | Required Variables | Status |
|---------|-------------------|---------|
| Authentication | `JWT_SECRET` | ✅ Required |
| Email Verification | `EMAILJS_PUBLIC_KEY` | ⚠️ Optional |
| Background Removal | `REMOVEBG_API_KEY` | ⚠️ Optional |
| Database | `DB_*` variables | ⚠️ Optional |

## Troubleshooting

### "JWT_SECRET is required for authentication"
- Add `JWT_SECRET=your_secret_key` to your `.env` file

### "EmailJS public key not set"
- Add `EMAILJS_PUBLIC_KEY=your_key` to your `.env` file
- Email verification will be disabled but app will work

### "RemoveBG API key not set"
- Add `REMOVEBG_API_KEY=your_key` to your `.env` file
- Background removal will be disabled but app will work

## Getting API Keys

### EmailJS
1. Go to [EmailJS](https://www.emailjs.com/)
2. Create account and verify email
3. Get your Public Key from Account > API Keys
4. Create email service (Gmail, etc.)
5. Create email template

### RemoveBG
1. Go to [RemoveBG](https://www.remove.bg/api)
2. Create account
3. Get API key from API section
4. Test with sample image

### JWT Secret
- Generate a strong random string (32+ characters)
- Use online generators or: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` 