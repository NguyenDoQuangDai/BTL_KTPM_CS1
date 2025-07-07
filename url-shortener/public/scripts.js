import { openDB } from 'https://cdn.jsdelivr.net/npm/idb@7.1.1/build/index.min.js';


// Khởi tạo hoặc kết nối đến IndexedDB
const initDB = async () => {
    return openDB('ShortURLDB', 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('urls')) {
                db.createObjectStore('urls', { keyPath: 'originalUrl' }); // Key là URL gốc
            }
        },
    });
};

// Lưu response vào IndexedDB
const saveToCache = async (originalUrl, shortUrl) => {
    const db = await initDB();
    await db.put('urls', { originalUrl, shortUrl, timestamp: Date.now() });
};

// Lấy dữ liệu từ IndexedDB
const getFromCache = async (originalUrl) => {
    const db = await initDB();
    const cachedData = await db.get('urls', originalUrl);

    if (!cachedData) {
        return null;  // Không có dữ liệu
    }

    const expiryTime = 1 * 24 * 60 * 60 * 1000;  // 24 giờ tính bằng mili giây
    const currentTime = Date.now();

    if (currentTime - cachedData.timestamp > expiryTime) {
        await db.delete('urls', originalUrl);  // Xóa dữ liệu hết hạn
        return null;
    }

    return cachedData;  // Dữ liệu hợp lệ
};


// Xử lý sự kiện khi nhấn nút Shorten URL
document.getElementById('createBtn').addEventListener('click', async () => {
    const urlInput = document.getElementById('originalUrl');
    const url = urlInput.value.trim();

    if (!url) {
        alert('Please enter a URL!');
        return;
    }

    try {
        // Kiểm tra xem URL đã tồn tại trong IndexedDB chưa
        const cachedData = await getFromCache(url);
        if (cachedData) {
            console.log('Response from IndexedDB');
            displayShortUrl(cachedData.shortUrl); // Hiển thị từ cache
            return;
        }

        // Nếu chưa có trong cache, gửi request POST đến server
        const response = await fetch('/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            throw new Error('Failed to shorten the URL');
        }

        const data = await response.json();
        const shortUrl = data.shortUrl;

        // Hiển thị short URL và lưu vào IndexedDB
        displayShortUrl(shortUrl);
        await saveToCache(url, shortUrl);
    } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong. Please try again.');
    }
});

// Hiển thị short URL và thiết lập nút copy
const displayShortUrl = (shortUrl) => {
    const shortUrlDisplay = document.getElementById('shortUrlDisplay');
    const copyBtn = document.getElementById('copyBtn');
    const copyMessage = document.getElementById('copyMessage');

    shortUrlDisplay.textContent = `Short URL: ${shortUrl}`;
    copyBtn.style.display = 'inline-block';

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(shortUrl).then(() => {
            copyMessage.style.display = 'block';
            setTimeout(() => {
                copyMessage.style.display = 'none';
            }, 2500); // Ẩn thông báo sau 2.5 giây
        });
    });
};
