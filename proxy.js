require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const apiKey = Buffer.from(process.env.COHERE_API_KEY_ENCODED, 'base64').toString('ascii');

app.get('/api/github/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).json({ success: false, error: 'Code not provided' });
    }

    try {
        console.log("GitHub OAuth Code:", code);
        res.json({ success: true, message: 'GitHub authentication successful.' });

    } catch (error) {
        console.error("GitHub OAuth Error:", error);
        res.status(500).json({ success: false, error: 'Failed to authenticate with GitHub' });
    }
});

app.post('/api/generate', async (req, res) => {
    try {
        const cohereResponse = await fetch('https://api.cohere.ai/v1/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                prompt: req.body.prompt,
                model: 'command-xlarge-nightly',
                max_tokens: 50,
                temperature: 0.7,
            })
        });

        if (!cohereResponse.ok) {
            throw new Error(`Cohere API error: ${cohereResponse.status}`);
        }

        const data = await cohereResponse.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing the request' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
