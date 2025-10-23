# 🚀 LearnHub - Interactive Learning Platform

An engaging, mobile-first web app for interactive learning with AI tutoring, gamification, and progress tracking. Learn ANY topic by searching or uploading your own study materials!

## ✨ Features

### Core Learning Experience
- **Interactive Learning Modules** - Conversational, friend-to-friend style content (no boring textbooks!)
- **Expandable Concept Cards** - Click to reveal detailed explanations
- **Real-World Examples** - Practical applications you can use immediately
- **Interactive Quizzes** - Scenario-based challenges with instant feedback
- **Mini-Challenges** - Apply what you learned with hands-on exercises

### AI-Powered Tutoring
- **Built-in AI Chat** - Ask questions in real-time using Claude API
- **Context-Aware** - AI knows what you're learning and provides relevant help
- **Conversational Style** - Feels like chatting with a knowledgeable friend
- **"Ask Claude" Buttons** - Quick access to AI help on any concept

### Universal Learning
- **Search ANY Topic** - Type any subject and AI generates a complete lesson
- **Upload Study Materials** - Drop PDFs, TXT files, DOC files, or images
- **AI Content Extraction** - AI analyzes your files and creates interactive lessons
- **Learning History** - All your searched topics and uploaded files saved

### Gamification
- **XP System** - Earn experience points for learning activities
- **Levels** - Progress through levels as you learn
- **Achievement Badges** - Unlock achievements for milestones
- **Streak Tracking** - Maintain daily learning streaks
- **Progress Visualization** - See your growth with progress bars

### User Experience
- **Dark Mode** - Easy on the eyes, switch anytime
- **Text-to-Speech** - Listen to content instead of reading
- **Offline Support** - Works offline after first load (except AI chat)
- **Progress Saving** - All progress saved locally
- **Mobile-First Design** - Perfect on phones, tablets, and desktops
- **Smooth Animations** - Delightful transitions and feedback

## 🚀 Quick Start

### Option 1: Deploy to Vercel (Recommended)

The easiest way to use LearnHub is to deploy it to Vercel with the built-in serverless API proxy:

1. **Fork or Clone** this repository
2. **Sign up** at [https://vercel.com](https://vercel.com) (free)
3. **Click "New Project"** and import your repository
4. **Add Environment Variable:**
   - Key: `ANTHROPIC_API_KEY`
   - Value: Your Claude API key (get from [https://console.anthropic.com/](https://console.anthropic.com/))
5. **Deploy** - Vercel will build and deploy automatically
6. **Done!** Your app is live at `your-app.vercel.app`

**Why Vercel?**
- ✅ Keeps your API key secure on the server (never exposed to browsers)
- ✅ No CORS issues
- ✅ Free SSL certificate
- ✅ Automatic deployments from git
- ✅ Serverless functions included

### Option 2: Deploy to Netlify

1. **Sign up** at [https://netlify.com](https://netlify.com)
2. **Drag and drop** your folder or connect your repository
3. **Add Environment Variable:**
   - Key: `ANTHROPIC_API_KEY`
   - Value: Your Claude API key
4. **Deploy**

### Option 3: Local Development

For testing locally:

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally with serverless functions
vercel dev

# Or set environment variable first
export ANTHROPIC_API_KEY=sk-ant-api03-...
vercel dev
```

Then open: `http://localhost:3000`

**Alternative (without serverless functions):**
You can still run locally and enter your API key in the app's Settings:

```bash
# Any local server works:
python -m http.server 8000
# Or
npx http-server
```

Then open `http://localhost:8000` and configure your API key in Settings (⚙️ button)

## 🎮 How to Use

### First Time Setup

1. **Open the app** - You'll see a welcome screen
2. **Click "Start Learning"** - Jump into your first module
3. **API Key Prompt** - Enter your Claude API key when prompted (or skip for now)

### Learning Features

- **🔍 Search Topics** - Type any subject to learn about (e.g., "Ancient Rome", "Quantum Physics")
- **📤 Upload Files** - Drag & drop PDFs, TXT, DOC, or image files to create lessons
- **📚 Navigate Modules** - Click on modules in the sidebar (My Topics or Featured Paths)
- **💡 Reveal Concepts** - Click on concept cards to expand details
- **🤖 Ask Questions** - Use the chat icon to talk to your AI tutor
- **📝 Take Quizzes** - Test your knowledge with interactive quizzes
- **🔊 Listen** - Click "Listen" button for text-to-speech
- **🌙 Toggle Dark Mode** - Click the moon/sun icon

### File Upload Supported Formats

- **Text Files (.txt)** - Direct text extraction
- **PDF Files (.pdf)** - Manual content input (paste key text from PDF)
- **Word Documents (.doc, .docx)** - Text extraction attempt
- **Images (.jpg, .png)** - For future OCR support (currently note-only)

### Earning Progress

- **+20 XP** - Correct quiz answer
- **+30 XP** - Complete a section
- **+100 XP** - Complete a full module
- **+50 XP** - Unlock an achievement
- **Level Up** - When you earn enough XP
- **Achievements** - Complete specific challenges

### Mobile Usage

- **Menu Button** - Bottom-left floating button on mobile
- **Swipe** - Natural touch interactions
- **Responsive** - Everything adapts to your screen size

## 📱 Browser Compatibility

Works on all modern browsers:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🎨 Customization

### Change Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --primary: #6366f1;    /* Main color */
    --secondary: #ec4899;  /* Accent color */
    /* ... more colors */
}
```

### Add Your Own Learning Content

In `app.js`, find the `createModules()` method and add your own modules:

```javascript
{
    id: 'my_module',
    title: 'My Cool Topic',
    icon: '🎯',
    subtitle: 'Learn something awesome',
    description: 'A detailed description',
    duration: '30 min',
    difficulty: 'Beginner',
    sections: [
        // Your sections here
    ]
}
```

### Create Custom Sections

Follow the pattern in methods like `createVariablesSection()`:

```javascript
createMySection() {
    return {
        whyCare: "Why this topic matters...",
        concepts: [
            {
                title: 'Concept Name',
                preview: 'Short description',
                details: 'Detailed explanation'
            }
        ],
        examples: [ /* ... */ ],
        quiz: { /* ... */ },
        challenge: { /* ... */ }
    };
}
```

## 🔒 Privacy & Data

- **All data stored locally** - Nothing sent to external servers (except AI chat)
- **Your API key** - Stored in browser localStorage
- **Progress data** - Saved in localStorage
- **No tracking** - No analytics or tracking scripts
- **No account needed** - Use immediately, no signup required

## 🛠 Technical Details

### Built With
- Pure HTML5, CSS3, and vanilla JavaScript
- No framework dependencies
- Modern ES6+ features
- Responsive CSS Grid and Flexbox
- LocalStorage API for persistence
- Web Speech API for text-to-speech
- Fetch API for Claude integration

### File Structure
```
learnhub/
├── index.html       # Main HTML structure
├── styles.css       # All styling (mobile-first)
├── app.js          # Application logic
├── api/
│   └── claude.js   # Serverless function (API proxy)
├── vercel.json     # Vercel configuration
└── README.md       # This file
```

### API Integration

The app uses Claude 3.5 Sonnet for AI tutoring via a secure proxy:
- **Frontend:** Calls `/api/claude` (serverless function)
- **Backend Proxy:** Forwards to `https://api.anthropic.com/v1/messages`
- **Model:** `claude-3-5-sonnet-20241022`
- **Max tokens:** 1024-4000 per response
- **Security:** API key stored as environment variable on server
- **Context:** Includes current learning module info

**How it works:**
1. Frontend makes request to `/api/claude`
2. Serverless function validates and proxies to Anthropic API
3. Response sent back to frontend
4. API key never exposed to browser

## 📖 Available Learning Modules

### 1. JavaScript Fundamentals 🚀
- Variables & Data Types
- Functions
- Arrays & Objects
- **Duration:** 45 min | **Difficulty:** Beginner

### 2. React Essentials ⚛️
- Components
- Props
- **Duration:** 60 min | **Difficulty:** Intermediate

### 3. Web Design Principles 🎨
- Color Theory
- Typography
- White Space
- **Duration:** 40 min | **Difficulty:** Beginner

## 🏆 Achievements

Unlock these achievements as you learn:
- 🎯 **First Steps** - Complete your first module
- 📚 **Knowledge Seeker** - Complete 3 modules
- 🔥 **On Fire!** - 3-day streak
- ⭐ **Dedicated Learner** - 7-day streak
- 🌟 **Rising Star** - Reach level 5
- 👑 **Expert** - Reach level 10
- 🎓 **Quiz Master** - Perfect quiz score
- 🤔 **Curious Mind** - Ask AI tutor a question

## 🎯 Learning Tips

1. **Take Your Time** - No rush, learn at your own pace
2. **Use the AI Tutor** - Don't hesitate to ask questions
3. **Try the Challenges** - Best way to solidify learning
4. **Daily Streaks** - Even 10 minutes a day helps!
5. **Click Everything** - Explore all the interactive elements
6. **Listen Mode** - Great for reviewing while multitasking

## 🐛 Troubleshooting

### AI Chat Not Working

**On Vercel/Netlify:**
- Check `ANTHROPIC_API_KEY` environment variable is set
- Verify environment variable was saved and redeployed
- Check function logs in Vercel/Netlify dashboard
- Ensure you have API credits at console.anthropic.com

**Local Development:**
- If using `vercel dev`, set environment variable
- Or configure API key in app Settings (⚙️ button)
- Ensure you have internet connection
- Check browser console for errors

**Common Errors:**
- "API key required" → Set env variable or configure in Settings
- "authentication_error" → Invalid API key, check the key is correct
- "CORS error" → Deploy to Vercel or use proxy endpoint

### Text-to-Speech Not Working
- Make sure your browser supports Web Speech API
- Check system volume is not muted
- Try Chrome/Edge for best compatibility

### Progress Not Saving
- Check browser allows localStorage
- Not in private/incognito mode
- Clear cache and try again

### Animations Not Smooth
- Enable hardware acceleration in browser
- Close other tabs to free resources
- Check "Reduce Motion" accessibility setting isn't enabled

## 🚀 Future Enhancements

Ideas for expanding the app:
- [ ] More learning modules (Python, Data Science, etc.)
- [ ] Code playground for live coding practice
- [ ] Peer comparison leaderboard
- [ ] Export progress/certificates
- [ ] Video integration
- [ ] Spaced repetition system
- [ ] Custom learning paths
- [ ] Collaborative features

## 📄 License

This project is open source and available for personal and educational use.

## 🤝 Contributing

Want to add features or content?
1. Fork the repository
2. Add your improvements
3. Test thoroughly
4. Submit a pull request

## 💬 Support

Need help?
- Check this README
- Review code comments in `app.js`
- Test in browser developer console
- Check Claude API documentation

## 🎉 Have Fun Learning!

Remember: Learning should be enjoyable, not a chore. Take breaks, celebrate small wins, and don't be afraid to ask questions!

---

Built with ❤️ for learners everywhere
