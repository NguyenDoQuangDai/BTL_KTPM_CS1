const { Sequelize, DataTypes } = require('sequelize');

// Kết nối đến cơ sở dữ liệu SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db/app.db'
});

// Định nghĩa mô hình URL
const URL = sequelize.define('URL', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    expiry: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    timestamps: false,
});

// Khởi tạo cơ sở dữ liệu
async function initializeDatabase() {
    await sequelize.sync();
    console.log("Database initialized");
}

module.exports = {
    URL,
    initializeDatabase,
};