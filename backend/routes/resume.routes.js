const { authJwt } = require("../middleware");
const controller = require("../controllers/resume.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // Create a new resume
    app.post("/api/resumes", [authJwt.verifyToken], controller.create);

    // Get all resumes for a user
    app.get("/api/resumes", [authJwt.verifyToken], controller.findAll);

    // Get a single resume
    app.get("/api/resumes/:id", [authJwt.verifyToken], controller.findOne);

    // Update a resume
    app.put("/api/resumes/:id", [authJwt.verifyToken], controller.update);

    // Delete a resume
    app.delete("/api/resumes/:id", [authJwt.verifyToken], controller.delete);
}; 