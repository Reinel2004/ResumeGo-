require('dotenv').config();
const express = require("express");
const fileUpload = require('express-fileupload');
const removebgRoutes = require('./routes/removebg.routes.js');
const atsRoutes = require('./routes/ats.routes.js');
const cors = require("cors");
const path = require("path"); // ✅ Added for serving frontend
const db = require("./models");
const fetch = require('node-fetch'); // Add this near the top with other requires
const grammarRoutes = require('./routes/grammar.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const resumeRoutes = require("./routes/resume.routes");

// Use routes
app.use(fileUpload());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/resume", resumeRoutes);
app.use('/api/removebg', removebgRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api', grammarRoutes);

// AI Assistant Proxy Route
app.post('/api/ai-assistant', async (req, res) => {
    const { promptText } = req.body;
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
                    { role: 'system', content: 'You are a professional resume writer. Provide 3 different versions of the following text for a resume: 1) A professional version with impact, 2) A concise version that\'s clear and direct, 3) A detailed version with more context.' },
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


const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));


app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

// Database connection
db.sequelize.sync().then(() => {
    console.log("Database synced successfully.");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
