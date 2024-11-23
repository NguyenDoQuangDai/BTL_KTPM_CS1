const amqp = require('amqplib');
const Link = require('./models/link');

(async () => {
    try {
        const { nanoid } = await import('nanoid'); // Dynamic import
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        const queue = 'short_link_queue';

        await channel.assertQueue(queue, { durable: true });

        console.log('Worker is waiting for messages...');

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const { url } = JSON.parse(msg.content.toString());

                try {
                    const id = nanoid(6);
                    const fullUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
                    await Link.create({ id, url: fullUrl });

                    console.log(`Processed: ${url} -> /short/${id}`);
                } catch (error) {
                    console.error('Error processing message:', error);
                }

                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error('Worker error:', error);
    }
})();
