module.exports = (sequelize, Sequelize) => {
    const EmailVerification = sequelize.define("emailVerification", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        token: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        expiresAt: {
            type: Sequelize.DATE,
            allowNull: false
        },
        used: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        createdAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        updatedAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    });

    return EmailVerification;
};
