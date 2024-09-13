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
        pathRewrite: {
          [`^/`]: '',
        },
        onProxyReq: (proxyReq, req, res) => {
          // Modify headers or request here if needed
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
