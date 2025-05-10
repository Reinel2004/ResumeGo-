const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.users;

verifyToken = (req, res, next) => {
    console.log('Verifying token...');
    console.log('Headers:', req.headers);
    
    let token = req.headers["x-access-token"] || req.headers["authorization"];

    if (!token) {
        console.log('No token provided');
        return res.status(403).send({
            message: "No token provided!"
        });
    }

    // Remove 'Bearer ' from token if present
    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    console.log('Verifying token:', token);

    jwt.verify(token, "your-secret-key", (err, decoded) => {
        if (err) {
            console.log('Token verification failed:', err.message);
            return res.status(401).send({
                message: "Unauthorized!"
            });
        }
        console.log('Token verified successfully. User ID:', decoded.id);
        req.userId = decoded.id;
        next();
    });
};

const authJwt = {
    verifyToken
};

module.exports = authJwt; 