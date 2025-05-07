const express = require("express");
const cors = require("cors");
const db = require("./models");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
db.sequelize.sync({ force: true }).then(() => {
    console.log("Drop and re-sync db.");
});

// Routes
require("./routes/auth.routes")(app);
require("./routes/resume.routes")(app);

// Set port and start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
}); 