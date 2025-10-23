# 🚀 Quick Start Guide

## The Problem

Anthropic's API blocks direct browser calls due to CORS (Cross-Origin Resource Sharing) security.

**You cannot call the API directly from a static HTML file.**

## Solutions

### ✅ Option 1: Run Local Development Server (Easiest for Testing)

This runs a simple Node.js server with a built-in API proxy.

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open in browser
# http://localhost:3000
```

Then:
1. Click **⚙️ Settings** button
2. Enter your Claude API key
3. Click **💾 Save API Key**
4. Click **🔍 Test Connection** - Should show "✓ API connection successful!"
5. Try learning features!

**The server:**
- Serves your files at http://localhost:3000
- Provides `/api/claude` endpoint (proxy to Anthropic)
- Handles CORS properly
- Shows API request logs in the console

---

### ✅ Option 2: Deploy to Vercel (Best for Production)

Vercel provides free serverless functions (no server to manage!).

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# Follow prompts:
# - Set project name
# - Add environment variable: ANTHROPIC_API_KEY=sk-ant-...
```

Or use the web interface:
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variable:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-api03-...`
5. Deploy!

Your app will be live at: `https://your-app.vercel.app`

---

### ❌ What Doesn't Work

**Opening index.html directly (file:// protocol):**
```
❌ Double-clicking index.html
❌ file:///path/to/index.html
```

**Why?**
- No backend to proxy API calls
- CORS blocks direct Anthropic API calls
- You'll see "Failed to fetch" errors

**Simple HTTP servers without proxy:**
```bash
❌ python -m http.server 8000
❌ npx http-server
```

**Why?**
- These only serve static files
- No `/api/claude` proxy endpoint
- CORS still blocks Anthropic API

---

## Understanding the Architecture

### How It Works

```
Browser → /api/claude → Proxy Server → Anthropic API
         ✅ No CORS    ✅ API Key Safe
```

**Local Dev Server (server.js):**
```javascript
// Receives: POST /api/claude { apiKey, messages }
// Forwards to: https://api.anthropic.com/v1/messages
// Returns: AI response
```

**Vercel Serverless (api/claude.js):**
```javascript
// Same thing, but on Vercel's infrastructure
// API key stored in environment variable (secure!)
```

### Why This Is Necessary

1. **CORS Protection**: Anthropic blocks browser calls for security
2. **API Key Safety**: Keep your key on the server (not in browser)
3. **Rate Limiting**: Server can implement rate limits
4. **Usage Tracking**: Server can log/monitor API usage

---

## Troubleshooting

### "Failed to fetch" Error

**Check:**
1. Are you running `npm run dev`? (Not just opening the file)
2. Is the server running at http://localhost:3000?
3. Did you enter your API key in Settings?
4. Check browser console for errors (F12)

**Common causes:**
- Opened file directly (not via server)
- Using simple HTTP server (no proxy)
- Invalid API key
- No internet connection

### API Key Errors

**"Invalid API key"**
- Check your key starts with `sk-ant-api03-`
- Verify at https://console.anthropic.com/
- Make sure you copied the full key

**"Insufficient quota"**
- Check your credits at https://console.anthropic.com/
- Add billing if needed

### Port Already In Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Kill process on port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port:
# Edit server.js: const PORT = 3001;
```

---

## Next Steps

Once you have the app running:

1. **Explore Features:**
   - 🎲 Surprise Me (random topics)
   - ⭐ Topic of the Day
   - 🔍 Search any topic
   - 📤 Upload study materials
   - 💬 AI Chat tutor

2. **Customize:**
   - Edit `styles.css` for different colors
   - Add your own learning modules in `app.js`

3. **Deploy:**
   - Push to GitHub
   - Deploy to Vercel for free hosting
   - Share with friends!

---

## Environment Variables (Vercel Only)

When deploying to Vercel, set this environment variable:

```
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

**Why?**
- Keeps your API key secure (not in code)
- Not exposed to users
- Can be rotated without code changes

**How to set:**
1. Vercel Dashboard → Project → Settings
2. Environment Variables
3. Add: `ANTHROPIC_API_KEY` = `your-key`
4. Redeploy

---

## Summary

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| **Local Dev Server** | Easy setup, fast iteration | Requires Node.js | Development & testing |
| **Vercel** | Free hosting, secure, automatic deploys | Need to deploy changes | Production |
| **Direct file** | None | Doesn't work due to CORS | ❌ Don't use |

**Recommended Flow:**
1. Develop locally with `npm run dev`
2. Deploy to Vercel for production
3. Share your Vercel URL with others

Happy learning! 🎓
