// LearnHub - Interactive Learning Platform
// Main Application Logic

class LearnHub {
    constructor() {
        // Configuration
        this.CLAUDE_API_KEY = localStorage.getItem('claudeApiKey') || '';
        this.CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

        // State
        this.currentModule = null;
        this.currentSection = 0;
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.isChatOpen = false;
        this.isSidebarOpen = false;
        this.speechSynthesis = window.speechSynthesis;
        this.currentUtterance = null;

        // User Progress
        this.userProgress = this.loadProgress();

        // Learning Modules
        this.modules = this.createModules();

        // Achievements
        this.achievements = this.createAchievements();

        // Initialize
        this.init();
    }

    init() {
        // Apply dark mode
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
            const darkModeToggle = document.getElementById('darkModeToggle');
            if (darkModeToggle) {
                darkModeToggle.querySelector('.icon').textContent = '☀️';
            }
        }

        // Set up event listeners
        this.setupEventListeners();

        // Update UI
        this.updateStatsDisplay();
        this.renderNavigation();
        this.renderBadges();

        // Check for API key
        this.checkApiKey();

        // Update streak
        this.updateStreak();
    }

    setupEventListeners() {
        // Dark mode toggle
        document.getElementById('darkModeToggle')?.addEventListener('click', () => this.toggleDarkMode());

        // Chat toggle
        document.getElementById('chatToggle')?.addEventListener('click', () => this.toggleChat());
        document.getElementById('closeChatBtn')?.addEventListener('click', () => this.toggleChat());

        // Mobile menu toggle
        document.getElementById('mobileMenuToggle')?.addEventListener('click', () => this.toggleSidebar());

        // Chat functionality
        document.getElementById('sendChatBtn')?.addEventListener('click', () => this.sendChatMessage());
        const chatInput = document.getElementById('chatInput');
        chatInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendChatMessage();
            }
        });

        // Auto-resize chat input
        chatInput?.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }

    // Progress Management
    loadProgress() {
        const defaultProgress = {
            xp: 0,
            level: 1,
            streak: 0,
            lastVisit: new Date().toDateString(),
            completedModules: [],
            completedSections: {},
            unlockedAchievements: [],
            quizScores: {},
            userTopics: []  // Store user-searched topics
        };

        const saved = localStorage.getItem('userProgress');
        return saved ? { ...defaultProgress, ...JSON.parse(saved) } : defaultProgress;
    }

    saveProgress() {
        localStorage.setItem('userProgress', JSON.stringify(this.userProgress));
    }

    updateStreak() {
        const today = new Date().toDateString();
        const lastVisit = this.userProgress.lastVisit;

        if (lastVisit !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastVisit === yesterday.toDateString()) {
                this.userProgress.streak += 1;
                this.showToast('🔥 Streak continued! Keep it up!', 'success');
            } else {
                this.userProgress.streak = 1;
            }

            this.userProgress.lastVisit = today;
            this.saveProgress();
            this.updateStatsDisplay();

            // Check for streak achievements
            this.checkAchievements();
        }
    }

    addXP(amount) {
        this.userProgress.xp += amount;

        // Calculate level
        const xpForNextLevel = this.getXPForLevel(this.userProgress.level + 1);

        if (this.userProgress.xp >= xpForNextLevel) {
            this.levelUp();
        }

        this.saveProgress();
        this.updateStatsDisplay();
    }

    getXPForLevel(level) {
        return Math.floor(100 * Math.pow(1.5, level - 1));
    }

    levelUp() {
        this.userProgress.level += 1;
        this.showToast(`🎉 Level Up! You're now level ${this.userProgress.level}!`, 'success');
        this.checkAchievements();
    }

    updateStatsDisplay() {
        // Update level, XP, and streak
        document.getElementById('userLevel').textContent = this.userProgress.level;
        document.getElementById('userXP').textContent = this.userProgress.xp;
        document.getElementById('userStreak').textContent = this.userProgress.streak;

        // Update XP progress bar
        const currentLevelXP = this.getXPForLevel(this.userProgress.level);
        const nextLevelXP = this.getXPForLevel(this.userProgress.level + 1);
        const xpInLevel = this.userProgress.xp - currentLevelXP;
        const xpNeeded = nextLevelXP - currentLevelXP;
        const progress = (xpInLevel / xpNeeded) * 100;

        document.getElementById('xpProgressFill').style.width = `${progress}%`;
        document.getElementById('xpText').textContent =
            `${xpInLevel} / ${xpNeeded} XP to next level`;
    }

    // Achievements System
    createAchievements() {
        return [
            {
                id: 'first_steps',
                name: 'First Steps',
                description: 'Complete your first learning module',
                icon: '🎯',
                condition: () => this.userProgress.completedModules.length >= 1
            },
            {
                id: 'knowledge_seeker',
                name: 'Knowledge Seeker',
                description: 'Complete 3 learning modules',
                icon: '📚',
                condition: () => this.userProgress.completedModules.length >= 3
            },
            {
                id: 'on_fire',
                name: 'On Fire!',
                description: 'Maintain a 3-day streak',
                icon: '🔥',
                condition: () => this.userProgress.streak >= 3
            },
            {
                id: 'dedicated',
                name: 'Dedicated Learner',
                description: 'Maintain a 7-day streak',
                icon: '⭐',
                condition: () => this.userProgress.streak >= 7
            },
            {
                id: 'level_5',
                name: 'Rising Star',
                description: 'Reach level 5',
                icon: '🌟',
                condition: () => this.userProgress.level >= 5
            },
            {
                id: 'level_10',
                name: 'Expert',
                description: 'Reach level 10',
                icon: '👑',
                condition: () => this.userProgress.level >= 10
            },
            {
                id: 'quiz_master',
                name: 'Quiz Master',
                description: 'Get a perfect score on any quiz',
                icon: '🎓',
                condition: () => Object.values(this.userProgress.quizScores).some(score => score === 100)
            },
            {
                id: 'chat_curious',
                name: 'Curious Mind',
                description: 'Ask your AI tutor a question',
                icon: '🤔',
                condition: () => this.userProgress.chatMessages > 0
            }
        ];
    }

    checkAchievements() {
        this.achievements.forEach(achievement => {
            if (!this.userProgress.unlockedAchievements.includes(achievement.id) &&
                achievement.condition()) {
                this.unlockAchievement(achievement);
            }
        });
    }

    unlockAchievement(achievement) {
        this.userProgress.unlockedAchievements.push(achievement.id);
        this.saveProgress();
        this.renderBadges();
        this.showAchievementModal(achievement);
        this.addXP(50); // Bonus XP for achievement
    }

    showAchievementModal(achievement) {
        document.getElementById('achievementIcon').textContent = achievement.icon;
        document.getElementById('achievementName').textContent = achievement.name;
        document.getElementById('achievementDescription').textContent = achievement.description;
        document.getElementById('achievementModal').classList.remove('hidden');
    }

    closeAchievementModal() {
        document.getElementById('achievementModal').classList.add('hidden');
    }

    renderBadges() {
        const container = document.getElementById('badgesContainer');
        container.innerHTML = this.achievements.map(achievement => {
            const unlocked = this.userProgress.unlockedAchievements.includes(achievement.id);
            return `
                <div class="badge-item ${unlocked ? '' : 'locked'}"
                     title="${achievement.name}: ${achievement.description}">
                    <div class="badge-icon">${achievement.icon}</div>
                    <div class="badge-name">${unlocked ? achievement.name.split(' ')[0] : '?'}</div>
                </div>
            `;
        }).join('');
    }

    // Learning Modules
    createModules() {
        return [
            {
                id: 'javascript_basics',
                title: 'JavaScript Fundamentals',
                icon: '🚀',
                subtitle: 'Master the building blocks of modern web development',
                description: 'Learn JavaScript from scratch with hands-on examples',
                duration: '45 min',
                difficulty: 'Beginner',
                sections: [
                    {
                        id: 'variables',
                        title: 'Variables & Data Types',
                        icon: '📦',
                        content: this.createVariablesSection()
                    },
                    {
                        id: 'functions',
                        title: 'Functions',
                        icon: '⚙️',
                        content: this.createFunctionsSection()
                    },
                    {
                        id: 'arrays',
                        title: 'Arrays & Objects',
                        icon: '🗂️',
                        content: this.createArraysSection()
                    }
                ]
            },
            {
                id: 'react_intro',
                title: 'React Essentials',
                icon: '⚛️',
                subtitle: 'Build interactive UIs with React',
                description: 'Learn React fundamentals and create your first component',
                duration: '60 min',
                difficulty: 'Intermediate',
                sections: [
                    {
                        id: 'components',
                        title: 'Components',
                        icon: '🧩',
                        content: this.createComponentsSection()
                    }
                ]
            },
            {
                id: 'web_design',
                title: 'Web Design Principles',
                icon: '🎨',
                subtitle: 'Create beautiful, user-friendly interfaces',
                description: 'Learn design fundamentals that make websites look amazing',
                duration: '40 min',
                difficulty: 'Beginner',
                sections: [
                    {
                        id: 'design_basics',
                        title: 'Design Basics',
                        icon: '✨',
                        content: this.createDesignSection()
                    }
                ]
            }
        ];
    }

    createVariablesSection() {
        return {
            whyCare: "Variables are like labeled boxes where you store information. Without them, your code can't remember anything! Think of them as your app's short-term memory.",

            concepts: [
                {
                    title: 'let & const',
                    preview: 'Modern ways to declare variables',
                    details: `Use <code>let</code> when the value might change, and <code>const</code> when it won't. It's like choosing between a whiteboard (let) and a permanent marker (const).<br><br>
                    <strong>Example:</strong><br>
                    <code>let score = 0; // Can change<br>
                    const playerName = "Alex"; // Can't change</code>`
                },
                {
                    title: 'Data Types',
                    preview: 'Numbers, strings, booleans, and more',
                    details: `JavaScript has several types of data:<br>
                    • <strong>Numbers:</strong> <code>42</code>, <code>3.14</code><br>
                    • <strong>Strings:</strong> <code>"Hello"</code>, <code>'World'</code><br>
                    • <strong>Booleans:</strong> <code>true</code>, <code>false</code><br>
                    • <strong>Arrays:</strong> <code>[1, 2, 3]</code><br>
                    • <strong>Objects:</strong> <code>{name: "Alex", age: 25}</code>`
                }
            ],

            examples: [
                {
                    title: 'Real-World Example: Shopping Cart',
                    code: `let cartTotal = 0;\nconst taxRate = 0.08;\nlet itemCount = 0;\n\n// Add item to cart\ncartTotal += 29.99;\nitemCount++;\n\nconsole.log(\`Total: $\${cartTotal}\`);\nconsole.log(\`Items: \${itemCount}\`);`,
                    explanation: 'This is how an online store might track your shopping cart!'
                }
            ],

            quiz: {
                question: 'You need to store a user\'s email address. Which should you use?',
                options: [
                    'let email = "user@example.com" - because emails can change',
                    'const email = "user@example.com" - because the value won\'t change during the session',
                    'var email = "user@example.com" - because that\'s the old way',
                    'Just use the email directly without storing it'
                ],
                correct: 0,
                explanation: 'Use <code>let</code> because a user might update their email. <code>const</code> is for values that never change, like <code>const MAX_LOGIN_ATTEMPTS = 3;</code>'
            },

            challenge: {
                title: 'Mini Challenge: Create a Profile',
                description: 'Create variables to store a user profile with name (can\'t change), age (can change), and isActive (boolean).',
                hint: 'Think about which values might need to be updated later!',
                solution: `const name = "Alex";\nlet age = 25;\nlet isActive = true;`
            }
        };
    }

    createFunctionsSection() {
        return {
            whyCare: "Functions are reusable blocks of code. Instead of writing the same code 100 times, you write it once and call it whenever you need it. It's like saving a recipe instead of memorizing it!",

            concepts: [
                {
                    title: 'Function Declaration',
                    preview: 'The traditional way to create functions',
                    details: `<code>function greet(name) {<br>
                    &nbsp;&nbsp;return \`Hello, \${name}!\`;<br>
                    }<br><br>
                    greet("Alex"); // "Hello, Alex!"</code>`
                },
                {
                    title: 'Arrow Functions',
                    preview: 'Modern, concise syntax',
                    details: `Arrow functions are shorter and cleaner:<br><br>
                    <code>const greet = (name) => \`Hello, \${name}!\`;</code><br><br>
                    Same result, less typing!`
                }
            ],

            examples: [
                {
                    title: 'Real-World: Calculate Discount',
                    code: `const calculateDiscount = (price, discount) => {\n  const savings = price * (discount / 100);\n  return price - savings;\n};\n\nconst finalPrice = calculateDiscount(100, 20);\nconsole.log(\`You pay: $\${finalPrice}\`); // $80`,
                    explanation: 'This is how websites calculate sale prices!'
                }
            ],

            quiz: {
                question: 'What\'s the main benefit of using functions?',
                options: [
                    'They make your code run faster',
                    'You can reuse code instead of repeating it',
                    'They make your code look fancier',
                    'Functions are required by JavaScript'
                ],
                correct: 1,
                explanation: 'Functions let you write code once and use it many times. This makes your code cleaner, easier to maintain, and reduces bugs!'
            },

            challenge: {
                title: 'Challenge: Temperature Converter',
                description: 'Write a function that converts Celsius to Fahrenheit. Formula: (C × 9/5) + 32',
                hint: 'Create a function that takes celsius as a parameter and returns fahrenheit',
                solution: `const celsiusToFahrenheit = (celsius) => {\n  return (celsius * 9/5) + 32;\n};\n\nconsole.log(celsiusToFahrenheit(0));  // 32\nconsole.log(celsiusToFahrenheit(100)); // 212`
            }
        };
    }

    createArraysSection() {
        return {
            whyCare: "Arrays let you store lists of things - like a playlist of songs, a todo list, or a shopping cart. Objects let you group related information together, like all the details about a user.",

            concepts: [
                {
                    title: 'Arrays',
                    preview: 'Lists of items',
                    details: `Arrays store multiple values in order:<br><br>
                    <code>const fruits = ["apple", "banana", "orange"];<br>
                    console.log(fruits[0]); // "apple"<br>
                    fruits.push("grape"); // Add to end</code>`
                },
                {
                    title: 'Objects',
                    preview: 'Grouped information',
                    details: `Objects store key-value pairs:<br><br>
                    <code>const user = {<br>
                    &nbsp;&nbsp;name: "Alex",<br>
                    &nbsp;&nbsp;age: 25,<br>
                    &nbsp;&nbsp;email: "alex@example.com"<br>
                    };<br><br>
                    console.log(user.name); // "Alex"</code>`
                }
            ],

            examples: [
                {
                    title: 'Real-World: Todo List App',
                    code: `const todos = [\n  { id: 1, task: "Learn JavaScript", done: false },\n  { id: 2, task: "Build a project", done: false }\n];\n\n// Mark first todo as done\ntodos[0].done = true;\n\n// Add new todo\ntodos.push({ id: 3, task: "Deploy app", done: false });`,
                    explanation: 'This is exactly how todo apps store your tasks!'
                }
            ],

            quiz: {
                question: 'When should you use an array vs an object?',
                options: [
                    'Use arrays for ordered lists, objects for related properties',
                    'Arrays are faster, always use arrays',
                    'Objects are newer, always use objects',
                    'It doesn\'t matter, they\'re the same thing'
                ],
                correct: 0,
                explanation: 'Use arrays when you need an ordered list (like [item1, item2, item3]). Use objects when you need to group related properties (like {name: "Alex", age: 25}).'
            },

            challenge: {
                title: 'Challenge: Student Records',
                description: 'Create an array of student objects. Each student should have name, grade, and age properties.',
                hint: 'Combine arrays and objects!',
                solution: `const students = [\n  { name: "Alex", grade: "A", age: 20 },\n  { name: "Sam", grade: "B", age: 19 },\n  { name: "Jordan", grade: "A", age: 21 }\n];\n\nconsole.log(students[0].name); // "Alex"`
            }
        };
    }

    createComponentsSection() {
        return {
            whyCare: "React components are like LEGO blocks - you build small, reusable pieces and combine them to create complex UIs. This makes your code organized and easier to maintain!",

            concepts: [
                {
                    title: 'What is a Component?',
                    preview: 'Reusable pieces of UI',
                    details: `A component is a JavaScript function that returns HTML-like code (JSX):<br><br>
                    <code>function Button() {<br>
                    &nbsp;&nbsp;return &lt;button&gt;Click me!&lt;/button&gt;;<br>
                    }</code>`
                },
                {
                    title: 'Props',
                    preview: 'Passing data to components',
                    details: `Props let you customize components:<br><br>
                    <code>function Greeting({ name }) {<br>
                    &nbsp;&nbsp;return &lt;h1&gt;Hello, {name}!&lt;/h1&gt;;<br>
                    }<br><br>
                    &lt;Greeting name="Alex" /&gt;</code>`
                }
            ],

            examples: [
                {
                    title: 'Real-World: User Card',
                    code: `function UserCard({ name, role, avatar }) {\n  return (\n    <div className="card">\n      <img src={avatar} alt={name} />\n      <h2>{name}</h2>\n      <p>{role}</p>\n    </div>\n  );\n}\n\n// Use it:\n<UserCard \n  name="Alex" \n  role="Developer" \n  avatar="/alex.jpg" \n/>`,
                    explanation: 'This is how social media sites display user profiles!'
                }
            ],

            quiz: {
                question: 'What\'s the main advantage of React components?',
                options: [
                    'They make websites load faster',
                    'You can reuse UI pieces throughout your app',
                    'They automatically add CSS styling',
                    'They work without JavaScript'
                ],
                correct: 1,
                explanation: 'Components let you build reusable UI pieces. Create a Button component once, use it everywhere!'
            },

            challenge: {
                title: 'Challenge: Product Card',
                description: 'Create a ProductCard component that displays product name, price, and an image.',
                hint: 'Use props to pass the product information',
                solution: `function ProductCard({ name, price, image }) {\n  return (\n    <div className="product-card">\n      <img src={image} alt={name} />\n      <h3>{name}</h3>\n      <p className="price">\${price}</p>\n      <button>Add to Cart</button>\n    </div>\n  );\n}`
            }
        };
    }

    createDesignSection() {
        return {
            whyCare: "Good design isn't just about making things pretty - it's about making them easy and enjoyable to use. People judge websites in 0.05 seconds, so design matters!",

            concepts: [
                {
                    title: 'Color Theory',
                    preview: 'Choose colors that work together',
                    details: `Use a color palette with:<br>
                    • <strong>Primary color:</strong> Your main brand color<br>
                    • <strong>Secondary color:</strong> Complements the primary<br>
                    • <strong>Accent color:</strong> For calls-to-action<br>
                    • <strong>Neutrals:</strong> Grays for text and backgrounds<br><br>
                    Pro tip: Use tools like Coolors or Adobe Color to find palettes!`
                },
                {
                    title: 'Typography',
                    preview: 'Make text readable and beautiful',
                    details: `Good typography rules:<br>
                    • Use max 2-3 font families<br>
                    • Headings: bold, larger size<br>
                    • Body text: 16px minimum<br>
                    • Line height: 1.5-1.7 for readability<br>
                    • Contrast: dark text on light backgrounds`
                },
                {
                    title: 'White Space',
                    preview: 'Give your content room to breathe',
                    details: `White space (empty space) makes designs look clean and professional. Don't cram everything together!<br><br>
                    Think of it like a nice room - you need space between furniture to move around comfortably.`
                }
            ],

            examples: [
                {
                    title: 'Before & After: Button Design',
                    code: `/* ❌ Bad */\nbutton {\n  background: red;\n  color: yellow;\n  padding: 2px;\n  font-size: 10px;\n}\n\n/* ✅ Good */\nbutton {\n  background: #6366f1;\n  color: white;\n  padding: 12px 24px;\n  font-size: 16px;\n  border-radius: 8px;\n  border: none;\n  cursor: pointer;\n}`,
                    explanation: 'The good version has better colors, spacing, and is easier to click!'
                }
            ],

            quiz: {
                question: 'Why is white space important in design?',
                options: [
                    'It makes designs load faster',
                    'It helps content breathe and improves readability',
                    'It saves on printing costs',
                    'It\'s a requirement for all websites'
                ],
                correct: 1,
                explanation: 'White space gives your content room to breathe, making it easier to read and more pleasant to look at. Cramped designs feel overwhelming!'
            },

            challenge: {
                title: 'Challenge: Design a Card',
                description: 'Write CSS for a card component with good spacing, readable typography, and a nice color scheme.',
                hint: 'Think about padding, margin, font-size, and colors!',
                solution: `.card {\n  background: white;\n  padding: 24px;\n  border-radius: 12px;\n  box-shadow: 0 2px 8px rgba(0,0,0,0.1);\n  max-width: 400px;\n}\n\n.card h2 {\n  color: #1a1a1a;\n  font-size: 24px;\n  margin-bottom: 12px;\n}\n\n.card p {\n  color: #666;\n  font-size: 16px;\n  line-height: 1.6;\n}`
            }
        };
    }

    // Navigation & UI
    renderNavigation() {
        const navList = document.getElementById('navList');
        navList.innerHTML = this.modules.map(module => {
            const completedSections = module.sections.filter(section =>
                this.userProgress.completedSections[`${module.id}_${section.id}`]
            ).length;
            const totalSections = module.sections.length;
            const isComplete = completedSections === totalSections;

            return `
                <li class="nav-item">
                    <a class="nav-link ${this.currentModule?.id === module.id ? 'active' : ''}"
                       onclick="app.loadModule('${module.id}')">
                        <span class="nav-link-icon">${module.icon}</span>
                        <div class="nav-link-content">
                            <div class="nav-link-title">${module.title}</div>
                            <div class="nav-link-subtitle">${module.difficulty} • ${module.duration}</div>
                        </div>
                        <span class="nav-link-progress">${completedSections}/${totalSections}</span>
                    </a>
                </li>
            `;
        }).join('');

        // Also render user topics
        this.renderUserTopics();
    }

    renderUserTopics() {
        const topicsList = document.getElementById('myTopicsList');
        if (!topicsList) return;

        if (this.userProgress.userTopics.length === 0) {
            topicsList.innerHTML = '<li class="nav-item"><p style="padding: 1rem; color: var(--text-tertiary); font-size: 0.875rem; text-align: center;">Search for topics above to start learning!</p></li>';
            return;
        }

        topicsList.innerHTML = this.userProgress.userTopics.map(topic => {
            return `
                <li class="nav-item">
                    <a class="nav-link ${this.currentModule?.id === topic.id ? 'active' : ''}"
                       onclick="app.loadDynamicTopic('${topic.id}')">
                        <span class="nav-link-icon">${topic.icon || '📖'}</span>
                        <div class="nav-link-content">
                            <div class="nav-link-title">${topic.title}</div>
                            <div class="nav-link-subtitle">Custom Topic</div>
                        </div>
                    </a>
                </li>
            `;
        }).join('');
    }

    // Universal Topic Search
    async searchTopic() {
        const searchInput = document.getElementById('topicSearch');
        const query = searchInput.value.trim();

        if (!query) {
            this.showToast('Please enter a topic to learn about', 'info');
            return;
        }

        // Check API key
        if (!this.CLAUDE_API_KEY) {
            this.showToast('Please set your Claude API key first', 'error');
            this.checkApiKey();
            return;
        }

        // Show loading
        searchInput.disabled = true;
        this.showToast('Creating your personalized lesson... ⏳', 'info');

        try {
            // Generate lesson with AI
            const lesson = await this.generateLessonWithAI(query);

            // Save to user topics
            this.userProgress.userTopics.push(lesson);
            this.saveProgress();

            // Load the lesson
            this.loadDynamicTopic(lesson.id);

            // Clear search
            searchInput.value = '';

            this.showToast('Lesson created! Happy learning! 🎉', 'success');

        } catch (error) {
            console.error('Topic search error:', error);
            this.showToast('Failed to create lesson. Please try again.', 'error');
        } finally {
            searchInput.disabled = false;
        }
    }

    async generateLessonWithAI(topic) {
        const response = await fetch(this.CLAUDE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 4000,
                messages: [{
                    role: 'user',
                    content: `Create an interactive learning lesson about "${topic}".

You are a friendly, enthusiastic tutor. Structure the lesson as JSON with this EXACT format:

{
  "title": "Topic Title",
  "icon": "relevant emoji",
  "subtitle": "short engaging description",
  "description": "what learner will know after",
  "sections": [
    {
      "title": "Section Name",
      "icon": "emoji",
      "whyCare": "Why this matters in real life (2-3 sentences)",
      "keyPoints": [
        "Point 1 explained conversationally",
        "Point 2 with real-world relevance",
        "Point 3 with practical examples"
      ],
      "realWorldExample": "Concrete example they can relate to",
      "practiceQuestion": {
        "question": "Scenario-based question",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 0,
        "explanation": "Why this answer is correct"
      }
    }
  ]
}

Make it:
- Conversational like explaining to a friend
- Include 2-3 sections
- Use real-world examples people care about
- Make practice questions interesting scenarios
- Be engaging and fun!

Return ONLY valid JSON, no other text.`
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.content[0].text;

        // Parse JSON from AI response
        let lessonData;
        try {
            // Try to extract JSON if there's extra text
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            lessonData = JSON.parse(jsonMatch ? jsonMatch[0] : aiResponse);
        } catch (e) {
            throw new Error('Invalid lesson format from AI');
        }

        // Create module structure
        const moduleId = `topic_${Date.now()}`;
        return {
            id: moduleId,
            title: lessonData.title,
            icon: lessonData.icon || '📖',
            subtitle: lessonData.subtitle,
            description: lessonData.description,
            duration: 'Custom',
            difficulty: 'AI-Generated',
            isDynamic: true,
            sections: lessonData.sections.map((section, idx) => ({
                id: `section_${idx}`,
                title: section.title,
                icon: section.icon || '📝',
                content: {
                    whyCare: section.whyCare,
                    concepts: section.keyPoints.map((point, i) => ({
                        title: `Key Point ${i + 1}`,
                        preview: point.substring(0, 60) + '...',
                        details: point
                    })),
                    examples: [{
                        title: 'Real-World Example',
                        code: '',
                        explanation: section.realWorldExample
                    }],
                    quiz: section.practiceQuestion
                }
            }))
        };
    }

    loadDynamicTopic(topicId) {
        // Find in user topics
        const topic = this.userProgress.userTopics.find(t => t.id === topicId);
        if (!topic) return;

        this.currentModule = topic;
        this.currentSection = 0;

        // Hide welcome screen
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('moduleContainer').classList.remove('hidden');

        // Render module
        this.renderModule();

        // Update navigation
        this.renderNavigation();

        // Close sidebar on mobile
        if (window.innerWidth <= 1024) {
            this.closeSidebar();
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    loadModule(moduleId) {
        this.currentModule = this.modules.find(m => m.id === moduleId);
        this.currentSection = 0;

        if (!this.currentModule) return;

        // Hide welcome screen
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('moduleContainer').classList.remove('hidden');

        // Render module
        this.renderModule();

        // Update navigation
        this.renderNavigation();

        // Close sidebar on mobile
        if (window.innerWidth <= 1024) {
            this.closeSidebar();
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    renderModule() {
        const container = document.getElementById('moduleContainer');
        const module = this.currentModule;
        const section = module.sections[this.currentSection];
        const content = section.content;

        container.innerHTML = `
            <div class="module-header">
                <h1 class="module-title">${module.icon} ${module.title}</h1>
                <p class="module-subtitle">${module.subtitle}</p>
                <div class="module-meta">
                    <span class="meta-item">⏱️ ${module.duration}</span>
                    <span class="meta-item">📊 ${module.difficulty}</span>
                    <span class="meta-item">📚 ${module.sections.length} sections</span>
                </div>
            </div>

            <div class="module-controls">
                <div class="module-nav">
                    ${this.currentSection > 0 ?
                        '<button class="btn btn-secondary" onclick="app.previousSection()">← Previous</button>' :
                        '<button class="btn btn-secondary" onclick="app.backToHome()">← Home</button>'}
                    ${this.currentSection < module.sections.length - 1 ?
                        '<button class="btn btn-primary" onclick="app.nextSection()">Next →</button>' :
                        '<button class="btn btn-success" onclick="app.completeModule()">Complete Module ✓</button>'}
                </div>
                <button class="btn btn-secondary" onclick="app.speakContent()" title="Read aloud">
                    🔊 Listen
                </button>
            </div>

            <!-- Section Content -->
            <div class="content-section">
                <div class="section-header">
                    <h2>${section.icon} ${section.title}</h2>
                </div>
                <div class="section-body">
                    ${this.renderSectionContent(content)}
                </div>
            </div>
        `;

        // Update progress bar
        const progress = ((this.currentSection + 1) / module.sections.length) * 100;
        document.getElementById('topProgressFill').style.width = `${progress}%`;
    }

    renderSectionContent(content) {
        let html = '';

        // Why Care section
        if (content.whyCare) {
            html += `
                <div class="why-care-box">
                    <h3>🤔 Why should I care?</h3>
                    <p>${content.whyCare}</p>
                </div>
            `;
        }

        // Concepts
        if (content.concepts) {
            html += '<h3>💡 Key Concepts</h3>';
            html += '<div class="concept-cards">';
            content.concepts.forEach((concept, idx) => {
                html += `
                    <div class="concept-card" onclick="app.toggleConcept(this)">
                        <h4>
                            <span>${concept.title}</span>
                        </h4>
                        <p class="concept-preview">${concept.preview}</p>
                        <div class="concept-details hidden">
                            <p>${concept.details}</p>
                            <button class="btn btn-primary btn-sm ask-claude-btn"
                                    onclick="event.stopPropagation(); app.askAboutConcept('${concept.title}')">
                                Ask Claude 🤖
                            </button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        // Examples
        if (content.examples) {
            content.examples.forEach(example => {
                html += `
                    <div class="example-box">
                        <h4>🔨 ${example.title}</h4>
                        <pre><code>${this.escapeHtml(example.code)}</code></pre>
                        <p>${example.explanation}</p>
                    </div>
                `;
            });
        }

        // Quiz
        if (content.quiz) {
            html += this.renderQuiz(content.quiz);
        }

        // Challenge
        if (content.challenge) {
            html += `
                <div class="scenario-box">
                    <h4>🎯 ${content.challenge.title}</h4>
                    <p>${content.challenge.description}</p>
                    <p><em>Hint: ${content.challenge.hint}</em></p>
                    <details>
                        <summary style="cursor: pointer; color: var(--primary); margin-top: 12px;">
                            Show Solution
                        </summary>
                        <pre style="margin-top: 12px;"><code>${this.escapeHtml(content.challenge.solution)}</code></pre>
                    </details>
                </div>
            `;
        }

        return html;
    }

    renderQuiz(quiz) {
        const quizId = `quiz_${Date.now()}`;
        return `
            <div class="quiz-container" id="${quizId}">
                <h3>📝 Quick Check</h3>
                <p class="quiz-question">${quiz.question}</p>
                <div class="quiz-options">
                    ${quiz.options.map((option, idx) => `
                        <div class="quiz-option" onclick="app.selectQuizOption(this, ${idx}, '${quizId}')">
                            <span class="option-letter">${String.fromCharCode(65 + idx)}</span>
                            <span>${option}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="quiz-feedback hidden"></div>
                <button class="btn btn-primary hidden" onclick="app.submitQuiz('${quizId}', ${quiz.correct})">
                    Submit Answer
                </button>
            </div>
        `;
    }

    selectQuizOption(element, idx, quizId) {
        // Deselect all options
        element.parentElement.querySelectorAll('.quiz-option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // Select this option
        element.classList.add('selected');
        element.dataset.selectedIdx = idx;

        // Show submit button
        document.querySelector(`#${quizId} button`).classList.remove('hidden');
    }

    submitQuiz(quizId, correctIdx) {
        const container = document.getElementById(quizId);
        const selected = container.querySelector('.quiz-option.selected');

        if (!selected) return;

        const selectedIdx = parseInt(selected.dataset.selectedIdx);
        const options = container.querySelectorAll('.quiz-option');
        const feedback = container.querySelector('.quiz-feedback');
        const button = container.querySelector('button');

        // Disable all options
        options.forEach(opt => opt.style.pointerEvents = 'none');
        button.classList.add('hidden');

        // Show correct/incorrect
        if (selectedIdx === correctIdx) {
            selected.classList.add('correct');
            feedback.classList.remove('hidden');
            feedback.classList.add('correct');
            feedback.innerHTML = `
                <strong>🎉 Correct!</strong><br>
                ${this.currentModule.sections[this.currentSection].content.quiz.explanation}
            `;
            this.addXP(20);
            this.showToast('✓ Correct answer! +20 XP', 'success');

            // Update quiz score
            const moduleId = this.currentModule.id;
            const sectionId = this.currentModule.sections[this.currentSection].id;
            this.userProgress.quizScores[`${moduleId}_${sectionId}`] = 100;
            this.saveProgress();
            this.checkAchievements();
        } else {
            selected.classList.add('incorrect');
            options[correctIdx].classList.add('correct');
            feedback.classList.remove('hidden');
            feedback.classList.add('incorrect');
            feedback.innerHTML = `
                <strong>Not quite!</strong><br>
                ${this.currentModule.sections[this.currentSection].content.quiz.explanation}
            `;
            this.showToast('Try reviewing the concepts again', 'info');
        }
    }

    toggleConcept(element) {
        const details = element.querySelector('.concept-details');
        details.classList.toggle('hidden');
        element.classList.toggle('revealed');
    }

    nextSection() {
        if (this.currentSection < this.currentModule.sections.length - 1) {
            this.markSectionComplete();
            this.currentSection++;
            this.renderModule();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    previousSection() {
        if (this.currentSection > 0) {
            this.currentSection--;
            this.renderModule();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    markSectionComplete() {
        const sectionKey = `${this.currentModule.id}_${this.currentModule.sections[this.currentSection].id}`;
        if (!this.userProgress.completedSections[sectionKey]) {
            this.userProgress.completedSections[sectionKey] = true;
            this.addXP(30);
            this.saveProgress();
        }
    }

    completeModule() {
        this.markSectionComplete();

        if (!this.userProgress.completedModules.includes(this.currentModule.id)) {
            this.userProgress.completedModules.push(this.currentModule.id);
            this.addXP(100);
            this.saveProgress();
            this.checkAchievements();
            this.showToast('🎉 Module completed! +100 XP', 'success');
        }

        this.renderNavigation();
        this.backToHome();
    }

    startLearning() {
        this.loadModule(this.modules[0].id);
    }

    backToHome() {
        document.getElementById('welcomeScreen').classList.remove('hidden');
        document.getElementById('moduleContainer').classList.add('hidden');
        this.currentModule = null;
        this.renderNavigation();
        document.getElementById('topProgressFill').style.width = '0%';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // AI Chat
    checkApiKey() {
        if (!this.CLAUDE_API_KEY) {
            // Prompt for API key
            setTimeout(() => {
                const key = prompt('Enter your Claude API key to enable AI tutoring:\n\n(Get one at: https://console.anthropic.com/)');
                if (key) {
                    this.CLAUDE_API_KEY = key;
                    localStorage.setItem('claudeApiKey', key);
                    this.showToast('API key saved! AI tutor is ready.', 'success');
                }
            }, 2000);
        }
    }

    toggleChat() {
        this.isChatOpen = !this.isChatOpen;
        const sidebar = document.getElementById('chatSidebar');

        if (this.isChatOpen) {
            sidebar.classList.add('open');
        } else {
            sidebar.classList.remove('open');
        }
    }

    async sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();

        if (!message) return;

        // Check API key
        if (!this.CLAUDE_API_KEY) {
            this.showToast('Please set your Claude API key first', 'error');
            this.checkApiKey();
            return;
        }

        // Clear input
        input.value = '';
        input.style.height = 'auto';

        // Add user message
        this.addChatMessage(message, 'user');

        // Track for achievement
        this.userProgress.chatMessages = (this.userProgress.chatMessages || 0) + 1;
        this.saveProgress();
        this.checkAchievements();

        // Show typing indicator
        const typingId = this.showTypingIndicator();

        try {
            // Call Claude API
            const response = await fetch(this.CLAUDE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.CLAUDE_API_KEY,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 1024,
                    messages: [{
                        role: 'user',
                        content: `You are a friendly, enthusiastic tutor helping someone learn programming. Be conversational and informal (like explaining to a friend). Keep responses concise but helpful. Use examples when possible.\n\nStudent question: ${message}\n\n${this.currentModule ? `Context: They're currently learning about "${this.currentModule.sections[this.currentSection].title}" in the "${this.currentModule.title}" module.` : ''}`
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            const reply = data.content[0].text;

            // Remove typing indicator
            this.removeTypingIndicator(typingId);

            // Add AI response
            this.addChatMessage(reply, 'bot');

        } catch (error) {
            console.error('Chat error:', error);
            this.removeTypingIndicator(typingId);
            this.addChatMessage('Oops! I had trouble connecting. Make sure your API key is valid and you have internet connection.', 'bot');
            this.showToast('Failed to get AI response', 'error');
        }
    }

    addChatMessage(text, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        messageDiv.innerHTML = `
            <div class="message-avatar">${sender === 'user' ? '👤' : '🤖'}</div>
            <div class="message-content">
                <p>${this.formatChatMessage(text)}</p>
            </div>
        `;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        const id = `typing-${Date.now()}`;
        typingDiv.id = id;
        typingDiv.className = 'chat-message bot-message';
        typingDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return id;
    }

    removeTypingIndicator(id) {
        const element = document.getElementById(id);
        if (element) element.remove();
    }

    formatChatMessage(text) {
        // Simple markdown-like formatting
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    askAboutConcept(conceptTitle) {
        // Open chat
        if (!this.isChatOpen) {
            this.toggleChat();
        }

        // Pre-fill question
        const input = document.getElementById('chatInput');
        input.value = `Can you explain ${conceptTitle} in more detail with examples?`;
        input.focus();
    }

    // Text-to-Speech
    speakContent() {
        if (this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
            this.showToast('Stopped reading', 'info');
            return;
        }

        const section = this.currentModule.sections[this.currentSection];
        const content = section.content;

        // Compile text to speak
        let textToSpeak = `${section.title}. `;

        if (content.whyCare) {
            textToSpeak += `Why should you care? ${content.whyCare} `;
        }

        if (content.concepts) {
            textToSpeak += 'Key concepts: ';
            content.concepts.forEach(concept => {
                textToSpeak += `${concept.title}. ${concept.preview}. `;
            });
        }

        // Create utterance
        this.currentUtterance = new SpeechSynthesisUtterance(textToSpeak);
        this.currentUtterance.rate = 0.9;
        this.currentUtterance.pitch = 1;

        this.currentUtterance.onend = () => {
            this.showToast('Finished reading', 'success');
        };

        this.speechSynthesis.speak(this.currentUtterance);
        this.showToast('Reading content aloud...', 'info');
    }

    // UI Helpers
    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', this.isDarkMode);

        const icon = document.getElementById('darkModeToggle').querySelector('.icon');
        icon.textContent = this.isDarkMode ? '☀️' : '🌙';
    }

    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
        document.getElementById('sidebar').classList.toggle('open');
        document.getElementById('mobileMenuToggle').classList.toggle('active');
    }

    closeSidebar() {
        this.isSidebarOpen = false;
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('mobileMenuToggle').classList.remove('active');
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ️'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
            <span class="toast-message">${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app
const app = new LearnHub();

// Make app globally available for onclick handlers
window.app = app;

// Add CSS for fadeOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(20px);
        }
    }
`;
document.head.appendChild(style);
