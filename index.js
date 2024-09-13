const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

app.use(
  '/',
  (req, res, next) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
      console.error('Missing `url` query parameter');
      return res.status(400).send('Missing `url` query parameter.');
    }

    try {
      const target = new URL(targetUrl);
      console.log(`Proxying to target: ${target.origin}`);

      createProxyMiddleware({
        target: target.origin,
        changeOrigin: true,
        selfHandleResponse: true, // Handle the response manually
        onProxyRes: (proxyRes, req, res) => {
          let body = '';
          proxyRes.on('data', (chunk) => {
            body += chunk;
          });

          proxyRes.on('end', () => {
            if (!res.headersSent) {
              // For HTML responses, modify the content
              if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/html')) {
                body = body.replace(/(src|href)="\/(?!\/)/g, `$1="${target.origin}/"`);
              }

              // Send headers and body
              res.writeHead(proxyRes.statusCode, proxyRes.headers);
              res.end(body);
            }
          });
        },
        onError: (err, req, res) => {
          console.error('Proxy error:', err);
          if (!res.headersSent) {
            res.status(500).send('Proxy error occurred.');
          }
        },
        pathRewrite: {
          [`^/`]: '',
        },
      })(req, res, next);
    } catch (error) {
      console.error('Invalid URL:', error);
      if (!res.headersSent) {
        return res.status(400).send('Invalid `url` query parameter.');
      }
    }
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
