document.getElementById('createBtn').addEventListener('click', async () => {
    const url = document.getElementById('originalUrl').value;
    if (!url) {
        alert('Please enter a URL!');
        return;
    }
    const response = await fetch('/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
    });
    const data = await response.json();
    const shortUrl = `${window.location.href}${data.id}`;
    document.getElementById('shortUrlDisplay').textContent = `Short URL: ${shortUrl}`;
    
    // Hiển thị nút copy
    const copyBtn = document.getElementById('copyBtn');
    copyBtn.style.display = 'inline-block';
    copyBtn.addEventListener('click', () => {
        // Copy URL vào clipboard
        navigator.clipboard.writeText(shortUrl).then(() => {
            // Hiển thị thông báo đã copy thành công
            const copyMessage = document.getElementById('copyMessage');
            copyMessage.style.display = 'block';
            setTimeout(() => {
                copyMessage.style.display = 'none';
            }, 2000); // Thông báo biến mất sau 2 giây
        });
    });
});
