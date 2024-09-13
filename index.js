const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

app.use(
  '/',
  (req, res, next) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
      return res.status(400).send('Missing `url` query parameter.');
    }

    try {
      const target = new URL(targetUrl);
      createProxyMiddleware({
        target: target.origin,
        changeOrigin: true,
        onProxyRes: (proxyRes, req, res) => {
          // Handle only HTML responses to adjust paths if needed
          if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/html')) {
            let body = '';
            proxyRes.on('data', chunk => body += chunk);
            proxyRes.on('end', () => {
              body = body.replace(/(src|href)="\/(?!\/)/g, `$1="${target.origin}/`);
              if (!res.headersSent) {
                res.send(body);
              }
            });
          } else {
            // For other types of responses, let the proxy handle them directly
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
          }
        },
        onError: (err, req, res) => {
          console.error('Proxy error:', err);
          if (!res.headersSent) {
            res.status(500).send('Proxy error');
          }
        },
        pathRewrite: {
          [`^/`]: '',
        },
      })(req, res, next);
    } catch (error) {
      console.error('URL error:', error);
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
