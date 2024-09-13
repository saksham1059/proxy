const express = require('express');
const request = require('request');
const dns = require('dns');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Serve HTML content directly
const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Browser</title>
</head>
<body>
    <h1>Simple Browser</h1>
    <form action="/fetch" method="post">
        <label for="url">Enter URL:</label>
        <input type="text" id="url" name="url" placeholder="http://example.com" required>
        <button type="submit">Go</button>
    </form>
</body>
</html>
`;

// Serve the form
app.get('/', (req, res) => {
    res.send(indexHtml);
});

// Handle form submission and proxy request
app.post('/fetch', (req, res) => {
    const url = req.body.url;

    if (!url) {
        return res.status(400).send('URL is required');
    }

    const parsedUrl = new URL(url, `http://${req.headers.host}`);
    const domain = parsedUrl.hostname;

    // Resolve DNS using Cloudflare's 1.1.1.1
    dns.setServers(['1.1.1.1']);
    dns.resolve4(domain, (err, addresses) => {
        if (err) return res.status(500).send('DNS resolution failed');

        const ip = addresses[0];
        const targetUrl = `http://${ip}${parsedUrl.pathname}`;

        request(targetUrl).on('error', (err) => {
            res.status(500).send('Request failed');
        }).pipe(res);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
