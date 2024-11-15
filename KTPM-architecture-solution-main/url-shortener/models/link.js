const { DataTypes } = require('sequelize'); // Import DataTypes từ Sequelize
const sequelize = require('./index'); // Import đối tượng kết nối Sequelize

// Định nghĩa model Link với hai trường: id và url
const Link = sequelize.define('Link', {
    id: {
        type: DataTypes.STRING(10), // Kiểu dữ liệu chuỗi với độ dài tối đa 10
        primaryKey: true, // Đặt làm khóa chính
        allowNull: false // Không cho phép để trống
    },
    url: {
        type: DataTypes.STRING, // Kiểu dữ liệu chuỗi
        allowNull: false // Không cho phép để trống
    }
}, {
    tableName: 'links', // Đặt tên bảng là 'links'
    timestamps: false, // Không sử dụng cột timestamps (createdAt, updatedAt)
});

module.exports = Link; // Xuất model Link để sử dụng trong controller
