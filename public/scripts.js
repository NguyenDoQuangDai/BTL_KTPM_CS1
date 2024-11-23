document.getElementById('createBtn').addEventListener('click', async () => {
    const url = document.getElementById('originalUrl').value;
    if (!url) {
        alert('Please enter a URL!');
        return;
    }

    const response = await fetch('/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
    });
    const data = await response.json();

    if (response.ok && data.requestId) {
        const requestId = data.requestId;
        document.getElementById('shortUrlDisplay').textContent = 'Processing...';

        // Polling to check status
        const checkStatus = async () => {
            const statusResponse = await fetch(`/status/${requestId}`);
            const statusData = await statusResponse.json();

            if (statusData.status === 'ready') {
                const shortUrl = statusData.shortUrl;
                document.getElementById('shortUrlDisplay').textContent = `Short URL: ${shortUrl}`;

                // Enable "Copy" button
                const copyBtn = document.getElementById('copyBtn');
                copyBtn.style.display = 'inline-block';
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(shortUrl).then(() => {
                        const copyMessage = document.getElementById('copyMessage');
                        copyMessage.style.display = 'block';
                        setTimeout(() => (copyMessage.style.display = 'none'), 2500);
                    });
                });
            } else {
                setTimeout(checkStatus, 2000); // Kiểm tra lại sau 2 giây
            }
        };
        checkStatus();
    } else {
        alert('Failed to create request');
    }
});
