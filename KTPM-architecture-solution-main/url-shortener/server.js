const express = require('express');
const sequelize = require('./models');
const linkController = require('./controllers/linkController');
const path = require('path');
const Queue = require('bull'); // Import Bull for queue management
const redis = require('ioredis'); // Redis client
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware to handle JSON
app.use(express.json());

// Middleware Rate Limiting theo IP
const limiter = rateLimit({
    windowMs: 10 * 1000, // Thời gian cửa sổ là 15 phút
    max: 10000, // Tối đa 100 yêu cầu mỗi IP trong cửa sổ thời gian
    standardHeaders: true, // Gửi thông tin rate limit qua các header
    legacyHeaders: false,  // Tắt X-RateLimit-* headers cũ
    message: 'Too many requests from this IP, please try again later.', // Thông báo khi bị giới hạn
    keyGenerator: (req) => {
        // Phân biệt user qua địa chỉ IP
        return req.ip; // `req.ip` chứa địa chỉ IP của người dùng gửi request
    },
});

// Áp dụng Rate Limiting cho tất cả các route
app.use(limiter);

// Serve static files from the public folder (with caching)
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '3d', // Cache static files for 3 days
    etag: true,   // Use ETag
}));

// Route for the main page (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Bull queue for URL shortening
const urlShorteningQueue = new Queue('urlShortening', {
    redis: { host: '127.0.0.1', port: 6379 },
});

// Bull queue for original URL retrieval
const urlRetrievalQueue = new Queue('urlRetrieval', {
    redis: { host: '127.0.0.1', port: 6379 },
});

const pendingResponses = new Map(); // Store jobId => res mappings

// Middleware to add a job to the shortening queue
app.post('/create', async (req, res) => {
    try {
        const { url } = req.body;

        // Add the job to the queue
        const job = await urlShorteningQueue.add({ url });

        // Store the response object for later use
        pendingResponses.set(job.id, res);

        console.log('Job added to shortening queue:', job.id);
    } catch (error) {
        console.error('Error adding to queue:', error);
        res.status(500).json({ error: 'Failed to queue the request' });
    }
});

// Middleware to add a job to the retrieval queue
app.get('/short/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Add the job to the queue
        const job = await urlRetrievalQueue.add({ id });

        // Store the response object for later use
        pendingResponses.set(job.id, res);

        console.log('Job added to retrieval queue:', job.id);
    } catch (error) {
        console.error('Error adding to queue:', error);
        res.status(500).json({ error: 'Failed to queue the request' });
    }
});

// Handle 404 for non-existent routes
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

const PORT = process.env.PORT || 3000;

// Sync the database and start the server
sequelize.sync({ force: false })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => console.error('Error syncing database:', err));

// Process shortening queue
urlShorteningQueue.process(async (job) => {
    console.log('Processing shortening job:', job.id);

    try {
        // Use linkController logic to generate the short URL
        const { createShortLinkFromQueue } = require('./controllers/linkController');
        const id = await createShortLinkFromQueue(job.data.url);

        // Get the stored response object
        const res = pendingResponses.get(job.id);

        if (res) {
            // Respond to the frontend
            res.status(201).json({ shortUrl: `http://localhost:3000/short/${id}` });

            // Remove the response from the map
            pendingResponses.delete(job.id);
        }
    } catch (error) {
        console.error('Error processing shortening job:', error);

        const res = pendingResponses.get(job.id);
        if (res) {
            res.status(500).json({ error: 'Failed to process the request' });
            pendingResponses.delete(job.id);
        }
    }
});

// Process retrieval queue
urlRetrievalQueue.process(async (job) => {
    console.log('Processing retrieval job:', job.id);

    try {
        const { getOriginalUrlFromQueue } = require('./controllers/linkController');
        const originalUrl = await getOriginalUrlFromQueue(job.data.id);

        // Get the stored response object
        const res = pendingResponses.get(job.id);

        if (res) {
            if (originalUrl) {
                //Cache-Control cho GET
                res.set('Cache-Control', 'public, max-age=86400'); // Cache 1 ngày
                res.redirect(originalUrl);
            } else {
                res.status(404).json({ error: 'Link not found' });
            }

            // Remove the response from the map
            pendingResponses.delete(job.id);
        }
    } catch (error) {
        console.error('Error processing retrieval job:', error);

        const res = pendingResponses.get(job.id);
        if (res) {
            res.status(500).json({ error: 'Failed to retrieve the original link' });
            pendingResponses.delete(job.id);
        }
    }
});

// Queue status logging (optional)
setInterval(async () => {
    try {
        const shorteningStats = {
            waiting: await urlShorteningQueue.getWaitingCount(),
            active: await urlShorteningQueue.getActiveCount(),
            completed: await urlShorteningQueue.getCompletedCount(),
            failed: await urlShorteningQueue.getFailedCount(),
        };

        const retrievalStats = {
            waiting: await urlRetrievalQueue.getWaitingCount(),
            active: await urlRetrievalQueue.getActiveCount(),
            completed: await urlRetrievalQueue.getCompletedCount(),
            failed: await urlRetrievalQueue.getFailedCount(),
        };

        //console.clear();
        console.log('Queue Status:');
        console.log('Shortening Queue:', shorteningStats);
        console.log('Retrieval Queue:', retrievalStats);
    } catch (error) {
        console.error('Error fetching queue status:', error);
    }
}, 5000);

