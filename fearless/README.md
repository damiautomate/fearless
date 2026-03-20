# 🔓 Fearless

A 12-week transformation system that cures fear, timidity, and low self-esteem through curated content prescriptions, daily challenges, and AI coaching.

## Quick Deploy Guide

### Step 1: Install Node.js (if you don't have it)
Download from https://nodejs.org — get the LTS version. Install it.

### Step 2: Open Terminal and Set Up the Project
```bash
cd fearless
npm install
```

### Step 3: Add Your Anthropic API Key
Open the file `.env.local` and replace `your-anthropic-api-key-here` with your actual key:
```
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

### Step 4: Test Locally
```bash
npm run dev
```
Open http://localhost:3000 in your browser. You should see the app!

### Step 5: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - Fearless app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fearless.git
git push -u origin main
```
(Replace YOUR_USERNAME with your GitHub username. Create the repo on github.com first.)

### Step 6: Deploy to Vercel
1. Go to vercel.com and sign in with GitHub
2. Click "Add New Project"
3. Import your `fearless` repository
4. In "Environment Variables", add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your actual Anthropic API key
5. Click "Deploy"
6. Wait ~2 minutes. Your app is now live!

## Project Structure
```
fearless/
├── src/
│   ├── app/
│   │   ├── layout.js          # Root layout with AuthProvider
│   │   ├── page.js            # Home (redirects)
│   │   ├── globals.css        # Global styles
│   │   ├── auth/
│   │   │   ├── login/page.js  # Login page
│   │   │   ├── signup/page.js # Signup page
│   │   │   └── reset/page.js  # Password reset
│   │   ├── dashboard/
│   │   │   └── page.js        # Main app (all tabs)
│   │   └── api/
│   │       └── coach/route.js # AI coach API endpoint
│   └── lib/
│       ├── firebase.js        # Firebase config
│       ├── firestore.js       # Database operations
│       ├── auth-context.js    # Auth state management
│       └── content.js         # Curated content database
├── package.json
├── next.config.js
├── jsconfig.json
└── .env.local                 # Your API key (not committed)
```

## Customizing Content
Edit `src/lib/content.js` to add your own curated videos, books, podcasts, and challenges. Each day has:
- **prescriptions**: Content to consume (videos, books, podcasts)
- **challenge**: A real-world mission
- **journal**: A reflection prompt
- **coach**: The daily coach note

## Tech Stack
- **Next.js** — React framework
- **Firebase Auth** — User authentication
- **Firestore** — User data, progress, journals
- **Claude API** — AI coaching
- **Vercel** — Hosting
