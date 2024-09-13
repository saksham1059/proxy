const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const dns = require('dns');

// Force DNS to use Cloudflare (1.1.1.1)
dns.setServers(['1.1.1.1', '1.0.0.1']);

const app = express();

// Proxy middleware to route requests to the target site
app.use('/proxy', createProxyMiddleware({
    target: 'https://autoembed.cc', // Replace with the site you want to proxy
    changeOrigin: true,
    secure: false,
    onProxyRes(proxyRes, req, res) {
        // Bypass X-Frame-Options to allow embedding (if needed)
        proxyRes.headers['X-Frame-Options'] = '';
    }
}));

// Root route to serve an HTML page that embeds the proxied site
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
            <iframe src="/proxy" width="100%" height="800" style="border:none;">
                Your browser does not support iframes.
            </iframe>
        </body>
        </html>
    `);
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Proxy server listening on port ${port}`);
});
