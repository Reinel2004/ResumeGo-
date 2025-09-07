require('dotenv').config();
const express = require("express");
const fileUpload = require('express-fileupload');
const removebgRoutes = require('./routes/removebg.routes.js');
const atsRoutes = require('./routes/ats.routes.js');
const feedbackRoutes = require('./routes/feedback.routes.js');
const cors = require("cors");
const path = require("path"); // ✅ Added for serving frontend
const db = require("./models");
const fetch = require('node-fetch'); // Add this near the top with other requires
const grammarRoutes = require('./routes/grammar.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Import routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const resumeRoutes = require("./routes/resume.routes");

// Use routes
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    abortOnLimit: true
}));
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/resume", resumeRoutes);
app.use('/api/removebg', removebgRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api', grammarRoutes);

// AI Assistant Proxy Route
app.post('/api/ai-assistant', async (req, res) => {
    const { promptText, category } = req.body;
    const systemPrompt = `You are a professional resume writer for the ${category || 'relevant'} field. Provide 3 different versions of the following text for a resume: 1) A professional version with impact, 2) A concise version that's clear and direct, 3) A detailed version with more context.`;
    try {
        const response = await fetch('https://api.together.xyz/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: promptText }
                ],
                temperature: 0.7
            })
        });

        // If Together API returns non-JSON, handle gracefully
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            return res.status(502).json({ error: 'Invalid response from Together API', raw: text });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'AI request failed', details: err.message });
    }
});

// Import API config
const apiConfig = require('./config/api.config');

// Serve EmailJS public key securely
app.get("/api/config/emailjs", (req, res) => {
    res.json({ 
        publicKey: apiConfig.emailjs.publicKey,
        serviceId: apiConfig.emailjs.serviceId,
        templateId: apiConfig.emailjs.templateId
    });
});

// Serve API configuration (for debugging - remove in production)
app.get("/api/config/status", (req, res) => {
    res.json({ 
        emailjs: {
            hasPublicKey: !!apiConfig.emailjs.publicKey,
            hasServiceId: !!apiConfig.emailjs.serviceId,
            publicKeyLength: apiConfig.emailjs.publicKey ? apiConfig.emailjs.publicKey.length : 0
        },
        removebg: {
            hasApiKey: !!apiConfig.removebg.apiKey,
            apiKeyLength: apiConfig.removebg.apiKey ? apiConfig.removebg.apiKey.length : 0
        },
        server: {
            port: apiConfig.server.port,
            environment: apiConfig.server.nodeEnv
        }
    });
});


// Serve frontend files
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// Serve assets from root directory
const assetsPath = path.join(__dirname, "../assets");
app.use("/assets", express.static(assetsPath));

// Serve uploads directory
const uploadsPath = path.join(__dirname, "../uploads");
app.use("/uploads", express.static(uploadsPath));

// Catch-all handler: send back React's index.html file for any non-API routes
app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

// Database connection
db.sequelize.sync().then(() => {
    console.log("Database synced successfully.");
});

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all network interface

app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
    console.log(`Local access: http://localhost:${PORT}`);
    console.log(`Network access: http://[YOUR_IP]:${PORT}`);
    console.log(`To find your IP: ipconfig (Windows) or ifconfig (Mac/Linux)`);
});
