const { Sequelize } = require('sequelize'); // Import Sequelize ORM

// Kết nối tới database PostgreSQL với thông tin đăng nhập
const sequelize = new Sequelize('short_url_db', 'postgres', '123456789', {
    host: 'localhost', // Địa chỉ của database
    dialect: 'postgres', // Chọn loại database là PostgreSQL
    logging: false, // Tắt log SQL query để dễ đọc log hơn
});

// Kiểm tra kết nối đến database
sequelize.authenticate()
    .then(() => console.log('Database connected...')) // Kết nối thành công
    .catch(err => console.error('Connection error:', err)); // Xử lý lỗi kết nối

module.exports = sequelize; // Xuất đối tượng sequelize để dùng trong các file khác
