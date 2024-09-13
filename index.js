const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use('/proxy', createProxyMiddleware({
    target: 'https://example.com', // Replace with the actual site
    changeOrigin: true,
    secure: false,
    onProxyRes(proxyRes, req, res) {
        proxyRes.headers['X-Frame-Options'] = ''; // Adjust headers if needed
    }
}));

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Embed Proxied Site</title>
        </head>
        <body>
            <h1>Website Embedded via Proxy with Cloudflare DNS</h1>
            <iframe src="/proxy" width="100%" height="800" style="border:none;"></iframe>
        </body>
        </html>
    `);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Proxy server listening on port ${port}`);
});
