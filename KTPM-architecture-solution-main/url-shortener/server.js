const express = require('express');
const sequelize = require('./models');
const linkController = require('./controllers/linkController');
const path = require('path');

const app = express();

// Middleware để xử lý JSON và phục vụ file tĩnh
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Định tuyến cho trang chính (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Định tuyến tạo link rút gọn
app.post('/create', linkController.createShortLink);

// Định tuyến để truy cập link rút gọn
app.get('/short/:id', linkController.getOriginalUrl);

// Xử lý trang 404 cho các trang không tồn tại
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

const PORT = process.env.PORT || 3000; // Đặt port cho server

// Đồng bộ hóa database và khởi động server
sequelize.sync({ force: false }) // Không xóa dữ liệu nếu bảng đã tồn tại
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => console.error('Error syncing database:', err)); // Xử lý lỗi đồng bộ

