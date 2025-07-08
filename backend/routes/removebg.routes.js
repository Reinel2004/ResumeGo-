const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const FormData = require('form-data');

router.post('/removebg', async (req, res) => {
    try {
        const apiKey = process.env.REMOVEBG_API_KEY;
        console.log('Remove.bg API Key:', apiKey, apiKey && apiKey.length);
        if (!req.files || !req.files.image_file) {
            return res.status(400).json({ error: 'No image file provided' });
        }
        const imageFile = req.files.image_file;

        const formData = new FormData();
        formData.append('image_file', req.files.image_file.data, {
            filename: req.files.image_file.name,
            contentType: req.files.image_file.mimetype
        });

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': apiKey,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.text();
            return res.status(500).json({ error });
        }

        // Pipe the image back to the frontend
        res.set('Content-Type', response.headers.get('content-type'));
        response.body.pipe(res);
    } catch (error) {
        console.error('Remove.bg error:', error);
        res.status(500).json({ error: 'Background removal failed' });
    }
});

module.exports = router;