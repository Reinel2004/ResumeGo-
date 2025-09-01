module.exports = (sequelize, Sequelize) => {
    const PasswordReset = sequelize.define("passwordReset", {
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
        }
    });

    return PasswordReset;
};
