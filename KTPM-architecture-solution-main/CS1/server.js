const express = require('express');
const lib = require('./utils');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

// Chuyển hướng đến URL gốc khi người dùng truy cập đường dẫn rút gọn
app.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const url = await lib.findOrigin(id);
        if (!url) {
            res.status(404).send("<h1>404 - Not Found</h1>");
        } else {
            res.redirect(url);
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Tạo URL rút gọn mới
app.post('/create', async (req, res) => {
    try {
        const { url, expiry } = req.body;
        const newID = await lib.shortUrl(url, expiry);
        res.json({ id: newID });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
