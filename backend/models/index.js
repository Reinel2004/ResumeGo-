const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.users = require("./user.model.js")(sequelize, Sequelize);
db.resumes = require("./resume.model.js")(sequelize, Sequelize);
db.passwordResets = require("./passwordReset.model.js")(sequelize, Sequelize);

// Define relationships
db.users.hasMany(db.resumes, { foreignKey: 'userId' });
db.resumes.belongsTo(db.users, { foreignKey: 'userId' });

db.users.hasMany(db.passwordResets, { foreignKey: 'userId' });
db.passwordResets.belongsTo(db.users, { foreignKey: 'userId' });

module.exports = db; 