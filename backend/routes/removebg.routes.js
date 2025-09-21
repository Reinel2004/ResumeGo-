const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const FormData = require('form-data');
const apiConfig = require('../config/api.config');

router.post('/removebg', async (req, res) => {
    try {
        if (!req.files || !req.files.image_file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const imageFile = req.files.image_file;
        const formData = new FormData();
        formData.append('image_file', imageFile.data, {
            filename: imageFile.name,
            contentType: imageFile.mimetype
        });

        let lastError = null;

        // Try each API key until one succeeds
        for (const apiKey of apiConfig.removebg.apiKeys) {
            try {
                const response = await fetch('https://api.remove.bg/v1.0/removebg', {
                    method: 'POST',
                    headers: { 'X-Api-Key': apiKey },
                    body: formData,
                });

                if (response.ok) {
                    res.set('Content-Type', response.headers.get('content-type'));
                    return response.body.pipe(res);
                } else {
                    const errorText = await response.text();
                    // If limit/quota error, continue to next key
                    if (errorText.toLowerCase().includes('quota') || errorText.toLowerCase().includes('limit')) {
                        lastError = new Error(`API key limit reached, trying next key...`);
                        console.warn(lastError.message);
                        continue;
                    } else {
                        // Other errors are terminal
                        return res.status(response.status).json({ error: errorText });
                    }
                }
            } catch (err) {
                lastError = err;
                console.warn('API request failed, trying next key...', err.message);
            }
        }

        // If all keys fail
        return res.status(500).json({ error: 'All API keys failed', details: lastError?.message });

    } catch (err) {
        console.error('Remove.bg fallback error:', err);
        res.status(500).json({ error: 'Background removal failed' });
    }
});

module.exports = router;
