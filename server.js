const express = require('express');
const rateLimit = require('express-rate-limit');
const lib = require('./utils');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút."
});

const createUrlLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    message: "Bạn đã gửi quá nhiều yêu cầu tạo URL mới, vui lòng thử lại sau 10 phút."
});

app.use(generalLimiter);

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

app.post('/create', createUrlLimiter, async (req, res) => {
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