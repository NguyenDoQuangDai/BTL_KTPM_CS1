const { URL } = require('./models');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 600 }); // Cache với thời gian sống là 10 phút

function makeID(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let counter = 0; counter < length; counter++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// Tìm URL gốc bằng ID
async function findOrigin(id) {
    // Kiểm tra cache trước
    const cachedUrl = cache.get(id);
    if (cachedUrl) {
        return cachedUrl;
    }

    const urlEntry = await URL.findOne({ where: { id } });
    if (urlEntry) {
        cache.set(id, urlEntry.url); // Lưu vào cache
        return urlEntry.url;
    }
    return null;
}

// Tạo bản ghi mới trong cơ sở dữ liệu
async function create(id, url, expiry) {
    await URL.create({ id, url, expiry });
}

// Hàm rút gọn URL
async function shortUrl(url, expiry) {
    // Kiểm tra xem URL có phần tiền tố "http://" hoặc "https://" không
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url; // Thêm "http://" nếu thiếu
    }

    while (true) {
        const newID = makeID(5);
        const originUrl = await findOrigin(newID);
        if (!originUrl) {
            await create(newID, url, expiry);
            return newID;
        }
    }
}


module.exports = {
    findOrigin,
    shortUrl,
};