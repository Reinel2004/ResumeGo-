module.exports = {
    HOST: "localhost",
    USER: "root",
    PASSWORD: "reinel143",
    DB: "resume_generator",
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}; 