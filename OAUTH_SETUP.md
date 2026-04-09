# OAuth Setup Guide for BrightSide News

This guide will help you set up real OAuth authentication with Google and Facebook.

## Quick Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your OAuth credentials to `.env.local`

3. Restart your development server

## Google OAuth Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "BrightSide News"
4. Click "Create"

### Step 2: Enable Google Sign-In API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Sign-In API" or "Google+ API"
3. Click "Enable"

### Step 3: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: BrightSide News
   - User support email: your email
   - Developer contact: your email
   - Click "Save and Continue"
   - Skip "Scopes" and "Test users" for now
   - Click "Back to Dashboard"

4. Create OAuth Client ID:
   - Application type: Web application
   - Name: BrightSide News Web Client
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - Your production URL (when deploying)
   - Authorized redirect URIs:
     - `http://localhost:3000` (for development)
     - Your production URL (when deploying)
   - Click "Create"

5. Copy the "Client ID" (looks like: `123456789-abc123.apps.googleusercontent.com`)

6. Add to your `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here
   ```

## Facebook OAuth Setup

### Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Consumer" as the app type
4. Enter app name: "BrightSide News"
5. Enter contact email
6. Click "Create App"

### Step 2: Add Facebook Login

1. In your app dashboard, find "Facebook Login" product
2. Click "Set Up"
3. Choose "Web"
4. Enter your site URL:
   - `http://localhost:3000` (for development)
5. Click "Save" and "Continue"

### Step 3: Configure Facebook Login Settings

1. Go to "Settings" → "Basic"
2. Copy your "App ID"
3. Add your domain:
   - Development: `localhost`
   - Production: your domain
4. Go to "Facebook Login" → "Settings"
5. Add OAuth redirect URIs:
   - `http://localhost:3000` (for development)
   - Your production URL (when deploying)

6. Add to your `.env.local`:
   ```
   NEXT_PUBLIC_FACEBOOK_APP_ID=your_app_id_here
   ```

### Step 4: Make Your App Live (Optional)

1. Go to "Settings" → "Basic"
2. Flip the switch at the top to make your app "Live"
3. This allows any user to sign in (not just test users)

## Testing OAuth

1. Restart your development server after adding environment variables
2. Go to your app: `http://localhost:3000`
3. Click "Sign In" or "Register"
4. Try "Continue with Google" or "Continue with Facebook"
5. You should see the real OAuth consent screen
6. After authorizing, you'll be signed in with your real email

## Troubleshooting

### Google OAuth Issues

- **"Invalid OAuth client"**: Make sure your Client ID is correct in `.env.local`
- **"Redirect URI mismatch"**: Add your current URL to authorized redirect URIs
- **"Access blocked"**: Your app needs to be verified for production use

### Facebook OAuth Issues

- **"App not setup"**: Make sure Facebook Login is enabled in your app
- **"Invalid App ID"**: Check your App ID in `.env.local`
- **"URL Blocked"**: Add your domain to the App Domains list

## Security Notes

- Never commit `.env.local` to git
- Keep your OAuth credentials secret
- For production, use HTTPS
- Configure proper OAuth scopes
- Implement proper session management

## Need Help?

- Google OAuth Documentation: https://developers.google.com/identity/protocols/oauth2
- Facebook Login Documentation: https://developers.facebook.com/docs/facebook-login/

## Environment Variables Summary

Required for OAuth:
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
```

Optional for news (app works without these):
```
NEXT_PUBLIC_NEWS_API_KEY=your_newsapi_key
NEXT_PUBLIC_CURRENTS_API_KEY=your_currents_key
NEXT_PUBLIC_GNEWS_API_KEY=d2e74b8393208f938b7bf47d96ed1ea0
```

The app will work with mock data if news API keys are not provided. OAuth will show a setup message if credentials are missing.
