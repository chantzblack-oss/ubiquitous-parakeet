// Vercel Serverless Function - Claude API Proxy
// This function acts as a secure proxy between the frontend and Anthropic's Claude API
// It keeps your API key secure on the server and handles CORS

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get API key from environment variable (most secure) or from request (fallback)
        const apiKey = process.env.ANTHROPIC_API_KEY || req.body.apiKey;

        if (!apiKey) {
            console.error('No API key provided');
            return res.status(400).json({
                error: {
                    type: 'authentication_error',
                    message: 'API key required. Either set ANTHROPIC_API_KEY environment variable or provide apiKey in request.'
                }
            });
        }

        // Get request body from frontend
        const { model, max_tokens, messages } = req.body;

        // Validate request
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                error: {
                    type: 'invalid_request',
                    message: 'Messages array is required'
                }
            });
        }

        // Make request to Anthropic API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: model || 'claude-3-5-sonnet-20241022',
                max_tokens: max_tokens || 4000,
                messages
            })
        });

        const data = await response.json();

        // Forward the response (including errors) to the frontend
        if (!response.ok) {
            console.error('Anthropic API error:', data);
            return res.status(response.status).json(data);
        }

        // Success - return the AI response
        res.status(200).json(data);

    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({
            error: {
                type: 'server_error',
                message: error.message || 'Internal server error'
            }
        });
    }
}
