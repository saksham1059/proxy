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
          // Fix the URL of JavaScript files and other assets if needed
          if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/html')) {
            let body = '';
            proxyRes.on('data', chunk => body += chunk);
            proxyRes.on('end', () => {
              body = body.replace(/(src|href)="\/(?!\/)/g, `$1="${target.origin}/`);
              res.send(body);
            });
          } else {
            res.send(proxyRes);
          }
        },
        pathRewrite: {
          [`^/`]: '',
        },
      })(req, res, next);
    } catch (error) {
      return res.status(400).send('Invalid `url` query parameter.');
    }
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
