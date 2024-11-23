// Import model Link để thao tác với cơ sở dữ liệu
const Link = require('../models/link');

// Import thư viện node-cache
const NodeCache = require('node-cache');

// Khởi tạo bộ nhớ cache với thời gian hết hạn là 1 ngày
const cache = new NodeCache({ stdTTL: 86400, checkperiod: 120 }); // TTL: 86400 giây (1 ngày)

// Endpoint để tạo link rút gọn
exports.createShortLink = async (req, res) => {
    try {
        // Import nanoid để tạo ID ngẫu nhiên
        const { nanoid } = await import('nanoid');

        // Tạo một ID ngẫu nhiên với độ dài 6 ký tự cho link rút gọn
        const id = nanoid(6);

        // Lấy URL gốc từ body của yêu cầu POST
        const { url } = req.body;

        // Kiểm tra nếu URL không có scheme, thêm scheme mặc định
        let fullUrl = url;
        if (!/^https?:\/\//i.test(url)) {
            fullUrl = `https://${url}`;
        }

        // Kiểm tra cache trước khi tạo mới
        const cachedData = cache.get(fullUrl);
        if (cachedData) {
            console.log('CREATE - Response from memory cache');
            return res.status(200).json({ shortUrl: `${req.protocol}://${req.get('host')}/short/${cachedData.id}` });
        }

        // Lưu link rút gọn vào cơ sở dữ liệu
        await Link.create({ id, url: fullUrl });

        // Thêm vào cache
        cache.set(fullUrl, { id });

        // Trả về phản hồi cho người dùng
        res.status(201).json({ shortUrl: `${req.protocol}://${req.get('host')}/short/${id}` });
    } catch (error) {
        console.error('Error creating short link:', error);
        res.status(500).json({ error: 'Error creating short link' });
    }
};

// Endpoint để truy xuất link gốc từ link rút gọn
exports.getOriginalUrl = async (req, res) => {
    try {
        // Lấy ID rút gọn từ tham số URL
        const { id } = req.params;

        // Kiểm tra cache trước khi truy vấn database
        const cachedData = cache.get(id);
        if (cachedData) {
            console.log('GET - Response from memory cache');
            return res.redirect(cachedData.url);
        }

        // Tìm link trong cơ sở dữ liệu
        const link = await Link.findOne({ where: { id } });

        if (link) {
            // Nếu tìm thấy, lưu vào cache
            cache.set(id, { url: link.url });

            // Set ETag và Cache-Control
            const etag = `"${Buffer.from(link.url).toString('base64')}"`;
            if (req.headers['if-none-match'] === etag) {
                return res.status(304).end(); // Không thay đổi
            }

            res.set('ETag', etag);
            res.set('Cache-Control', 'public, max-age=86400'); // Cache 1 ngày

            // Chuyển hướng người dùng đến URL gốc
            res.redirect(link.url);
        } else {
            res.status(404).json({ error: 'Link not found' });
        }
    } catch (error) {
        console.error('Error fetching original link:', error);
        res.status(500).json({ error: 'Error fetching original link' });
    }
};
