# Gemini API Setup Guide

## Step 1: Get Your Gemini API Key

1. Go to **Google AI Studio**: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"** or **"Get API Key"**
4. Copy the API key (it will look like: `AIzaSy...`)

## Step 2: Add API Key to .env File

1. In the `ai-resume-analyzer` directory, create or edit the `.env` file
2. Add this line (replace `your_api_key_here` with your actual key):

```env
VITE_GEMINI_API_KEY=AIzaSy...your_actual_key_here
```

**Important Notes:**
- The variable name MUST start with `VITE_` (this is required for Vite to expose it to the frontend)
- Do NOT include quotes around the API key
- Do NOT add spaces around the `=` sign
- The `.env` file should be in the `ai-resume-analyzer` directory (same level as `package.json`)

## Step 3: Restart Dev Server

After adding/changing the `.env` file, you MUST restart your dev server:

1. Stop the server (press `Ctrl+C` in the terminal)
2. Start it again: `npm run dev`

## Step 4: Verify It's Working

1. Open the browser console (F12)
2. Look for: "Using Gemini API key: AIzaSy..."
3. If you see "API key not valid" error, check:
   - The key is correct (no typos)
   - The key hasn't been revoked
   - You've restarted the dev server

## Troubleshooting

### Error: "API key not valid"
- Double-check the API key is correct
- Make sure there are no extra spaces or quotes
- Try generating a new API key
- Make sure you've restarted the dev server

### Error: "GEMINI_API_KEY is not set"
- Check the `.env` file exists in `ai-resume-analyzer` directory
- Make sure the variable name is `VITE_GEMINI_API_KEY` (with `VITE_` prefix)
- Restart the dev server

### Still Not Working?
1. Check browser console for detailed error messages
2. Verify the `.env` file location (should be in `ai-resume-analyzer/` not in parent directory)
3. Make sure there are no syntax errors in `.env` file
4. Try creating a new API key from Google AI Studio

