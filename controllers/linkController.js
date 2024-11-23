const amqp = require('amqplib');
const Link = require('../models/link');

exports.createShortLink = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        const queue = 'short_link_queue';
        await channel.assertQueue(queue, { durable: true });

        channel.sendToQueue(queue, Buffer.from(JSON.stringify({ url })), {
            persistent: true,
        });

        console.log(`Sent to queue: ${url}`);

        res.status(202).json({ message: 'Request received, processing...' });

        setTimeout(() => {
            connection.close();
        }, 500);
    } catch (error) {
        console.error('Error creating short link:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
};

exports.getOriginalUrl = async (req, res) => {
    try {
        const { id } = req.params;
        const link = await Link.findOne({ where: { id } });

        if (link) {
            console.log('Redirecting to:', link.url);

            const etag = `"${Buffer.from(link.url).toString('base64')}"`;
            if (req.headers['if-none-match'] === etag) {
                return res.status(304).end();
            }

            res.set('ETag', etag);
            res.set('Cache-Control', 'public, max-age=259200');

            res.redirect(link.url);
        } else {
            res.status(404).json({ error: 'Link not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error fetching original link' });
    }
};

exports.checkShortLinkStatus = async (req, res) => {
    const { id } = req.params;
    try {
        const link = await Link.findOne({ where: { id } });
        if (link) {
            return res.json({ status: 'ready', shortUrl: `/short/${id}` });
        }
        res.json({ status: 'pending' });
    } catch (error) {
        res.status(500).json({ error: 'Error checking status' });
    }
};
