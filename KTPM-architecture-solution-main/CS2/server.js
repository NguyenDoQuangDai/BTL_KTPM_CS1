const express = require('express');
const { initializeDatabase } = require('./models');
const lib = require('./utils');

const app = express();
const port = 3000;

// Middleware để phân tích dữ liệu JSON
app.use(express.json());

// Phục vụ các file tĩnh trong thư mục 'public'
app.use(express.static('public'));

// Khởi tạo cơ sở dữ liệu
initializeDatabase();

// Chuyển hướng đến URL gốc khi người dùng truy cập đường dẫn rút gọn
app.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const url = await lib.findOrigin(id);
        if (!url) {
            res.status(404).send("<h1>404 - Not Found</h1>");
        } else {
            res.redirect(url);  // Redirect đến URL gốc
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Tạo URL rút gọn mới
app.post('/create', async (req, res) => {
    try {
        const { url, expiry } = req.body; // Lấy URL và thời gian hết hạn từ body của request
        const newID = await lib.shortUrl(url, expiry);
        res.json({ id: newID }); // Trả về ID rút gọn
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
