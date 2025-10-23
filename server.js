// Simple local development server with API proxy
// This solves CORS issues when running locally

import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3000;

// MIME types for serving static files
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = createServer(async (req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API Proxy endpoint
    if (req.url === '/api/claude' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const requestData = JSON.parse(body);
                const { apiKey, model, max_tokens, messages } = requestData;

                if (!apiKey) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        error: {
                            type: 'authentication_error',
                            message: 'API key required'
                        }
                    }));
                    return;
                }

                // Make request to Anthropic API
                const fetch = (await import('node-fetch')).default;
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

                // Forward response
                res.writeHead(response.status, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));

                if (!response.ok) {
                    console.error('API Error:', data);
                } else {
                    console.log('✓ API call successful');
                }

            } catch (error) {
                console.error('Proxy error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: {
                        type: 'server_error',
                        message: error.message
                    }
                }));
            }
        });
        return;
    }

    // Serve static files
    let filePath = req.url === '/' ? '/index.html' : req.url;
    const ext = extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    try {
        const content = await readFile(join(__dirname, filePath));
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.writeHead(404);
            res.end('404 Not Found');
        } else {
            res.writeHead(500);
            res.end('500 Internal Server Error');
        }
    }
});

server.listen(PORT, () => {
    console.log('');
    console.log('🚀 LearnHub Development Server');
    console.log('================================');
    console.log(`✓ Server running at http://localhost:${PORT}`);
    console.log('✓ API proxy enabled at /api/claude');
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Click the Settings (⚙️) button');
    console.log('3. Enter your Claude API key');
    console.log('4. Start learning!');
    console.log('');
    console.log('Press Ctrl+C to stop');
    console.log('');
});
