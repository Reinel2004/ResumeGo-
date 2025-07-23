module.exports = {
    secret: process.env.JWT_SECRETE || "",
    jwtExpiration: 86400, // 24 hours
    jwtRefreshExpiration: 604800, // 7 days
}; 