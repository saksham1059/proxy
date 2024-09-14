const express = require('express');
const axios = require('axios');
const app = express();

app.get('/embed', async (req, res) => {
    try {
        const response = await axios.get('https://watch.autoembed.cc');
        res.send(response.data);
    } catch (error) {
        res.status(500).send('Error fetching the content');
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
