const express = require('express');
const sequelize = require('./models');
const linkController = require('./controllers/linkController');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware để xử lý JSON
app.use(express.json());

// Middleware Rate Limiting theo IP
const limiter = rateLimit({
    windowMs: 60 * 1000, // Thời gian cửa sổ là 15 phút
    max: 10000, // Tối đa 100 yêu cầu mỗi IP trong cửa sổ thời gian
    standardHeaders: true, // Gửi thông tin rate limit qua các header
    legacyHeaders: false,  // Tắt X-RateLimit-* headers cũ
    message: 'Too many requests from this IP, please try again later.', // Thông báo khi bị giới hạn
    keyGenerator: (req) => {
        // Phân biệt user qua địa chỉ IP
        return req.ip; // `req.ip` chứa địa chỉ IP của người dùng gửi request
    },
});

// Phục vụ file tĩnh từ thư mục public (thêm caching)
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '3d',  // Cache tệp tĩnh trong 3 ngày
    etag: true,    // Sử dụng ETag
}));

// Áp dụng Rate Limiting cho tất cả các route
app.use(limiter);

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
