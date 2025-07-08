require('dotenv').config();
const express = require("express");
const fileUpload = require('express-fileupload');
const removebgRoutes = require('./routes/removebg.routes.js');
const cors = require("cors");
const db = require("./models");

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

// Database connection
db.sequelize.sync().then(() => {
    console.log("Database synced successfully.");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
}); 