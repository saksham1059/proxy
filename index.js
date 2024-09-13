const express = require('express');
const request = require('request');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to check if the request is for player.autoembed.cc
app.use((req, res, next) => {
    const allowedHost = 'player.autoembed.cc';
    const requestedUrl = req.originalUrl;
    if (requestedUrl.startsWith('/proxy/')) {
        const imdbId = requestedUrl.replace('/proxy/', '');
        const targetUrl = `https://${allowedHost}/embed/movie/${imdbId}`;
        req.pipe(request(targetUrl)).pipe(res);
    } else {
        res.status(403).send('Forbidden');
    }
});

app.listen(port, () => {
    console.log(`Proxy server running on port ${port}`);
});
