const express = require('express');
const request = require('request');
const app = express();

app.use((req, res) => {
    const targetUrl = req.originalUrl.slice(1); // Remove leading slash

    // Ensure targetUrl is a valid URL
    try {
        new URL(targetUrl);
    } catch (e) {
        return res.status(400).send('Invalid URL');
    }

    request(targetUrl, {timeout: 5000}, (error, response, body) => {
        if (error) {
            return res.status(500).send('Error fetching the URL');
        }
        res.setHeader('Content-Type', response.headers['content-type']);
        res.send(body);
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Proxy server running on port ${port}`);
});
