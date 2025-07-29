module.exports = {
    secret: process.env.JWT_SECRET || "",
    jwtExpiration: 86400, // 24 hours
    jwtRefreshExpiration: 604800, // 7 days
}; 