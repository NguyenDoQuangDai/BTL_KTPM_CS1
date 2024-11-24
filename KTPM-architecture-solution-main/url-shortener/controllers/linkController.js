const Link = require('../models/link');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 86400, checkperiod: 120 });

// Hàm logic chung để tạo link rút gọn
async function createShortLinkLogic(url) {
    try {
        // Kiểm tra nếu URL không có scheme, thêm scheme mặc định
        let fullUrl = url;
        if (!/^https?:\/\//i.test(url)) {
            fullUrl = `https://${url}`;
        }

        // Kiểm tra cache trước khi tạo mới
        const cachedData = cache.get(fullUrl);
        if (cachedData) {
            console.log('CREATE - Cache hit:', fullUrl, '|', cachedData.id);
            return cachedData.id;
        }  
        
        const existingLink = await Link.findOne({ where: { url: fullUrl } });
        
        if (existingLink) {
            console.log('CREATE - URL already exists:', fullUrl, '|', existingLink.id);
            cache.set(fullUrl, { id: existingLink.id });
            return existingLink.id;
        }
        
        const { nanoid } = await import('nanoid');
        
        // Tạo một ID ngẫu nhiên cho link rút gọn
        const id = nanoid(5);

        // Lưu link rút gọn vào cơ sở dữ liệu
        await Link.create({ id, url: fullUrl });

        // Thêm vào cache
        cache.set(fullUrl, { id });
        console.log('CREATE - New short URL created:', fullUrl, '|', id);

        return id;
    } catch (error) {
        console.error('Error in createShortLinkLogic:', error);
        throw error;
    }
}

// Hàm dùng trong queue để tạo link rút gọn (asynchronous job)
exports.createShortLinkFromQueue = async (url) => {
    try {
        return await createShortLinkLogic(url);
    } catch (error) {
        console.error('Error in createShortLinkFromQueue:', error);
        throw error;
    }
};


// Function to fetch original URL from the queue
exports.getOriginalUrlFromQueue = async (id) => {
    try {
        // Check cache first
        const cachedData = cache.get(id);
        if (cachedData) {
            console.log('GET - Cache hit:', id);
            return cachedData.url;
        }

        // Fetch from the database
        const link = await Link.findOne({ where: { id } });
        if (link) {
            cache.set(id, { url: link.url });
            console.log('GET - URL fetched from database:', id);
            return link.url;
        } else {
            console.log('GET - URL not found:', id);
            return null;
        }
    } catch (error) {
        console.error('Error in getOriginalUrlFromQueue:', error);
        throw error;
    }
};
