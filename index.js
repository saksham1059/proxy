1const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// Add basic logging to track requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

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
      return res.status(400).send('Invalid `url` query parameter.');
    }
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
