// Import model Link để sử dụng các phương thức thao tác với bảng "links" trong cơ sở dữ liệu
const Link = require('../models/link');

// Endpoint để tạo link rút gọn
exports.createShortLink = async (req, res) => {
    try {
        // nanoid - một thư viện tạo ID ngẫu nhiên có độ dài tùy chỉnh để tạo ID rút gọn duy nhất
        const { nanoid } = await import('nanoid');
        
        // Tạo một ID ngẫu nhiên với độ dài 6 ký tự cho link rút gọn
        const id = nanoid(6);
        
        // Lấy URL gốc từ yêu cầu của người dùng (nằm trong phần body của yêu cầu POST)
        const { url } = req.body;

        // Kiểm tra nếu URL không có scheme, thêm scheme mặc định
        let fullUrl = url;
        if (!/^https?:\/\//i.test(url)) {
            fullUrl = `https://${url}`; // Nếu không có http/https thì tự động thêm https://
        }

        // Lưu link rút gọn vào cơ sở dữ liệu, trong đó:
        await Link.create({ id, url: fullUrl });
        
        // Trả về phản hồi cho người dùng:
        // - shortUrl là URL đầy đủ bao gồm protocol (http hoặc https), host, và ID rút gọn
        res.status(201).json({ shortUrl: `${req.protocol}://${req.get('host')}/short/${id}` });
    } catch (error) {
        res.status(500).json({ error: 'Error creating short link' });
    }
};

// Endpoint để truy xuất link gốc từ link rút gọn
exports.getOriginalUrl = async (req, res) => {
    try {
        // Lấy ID rút gọn từ các tham số URL (req.params) của yêu cầu GET
        const { id } = req.params;

        // Tìm link trong cơ sở dữ liệu theo ID rút gọn (cột "id" trong bảng "links")
        const link = await Link.findOne({ where: { id } });

        if (link) {
            console.log('Redirecting to:', link.url); // Debug
            
            // Tạo ETag từ URL gốc
            const etag = `"${Buffer.from(link.url).toString('base64')}"`;
            if (req.headers['if-none-match'] === etag) {
                return res.status(304).end(); // Không thay đổi
            }

            // Set ETag header
            res.set('ETag', etag);
            res.set('Cache-Control', 'public, max-age=259200'); // Cache 3 ngày

            // Nếu tìm thấy link, chuyển hướng người dùng đến URL gốc đã được lưu trong cơ sở dữ liệu
            res.redirect(link.url);
        } else {
            res.status(404).json({ error: 'Link not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error fetching original link' });
    }
};



