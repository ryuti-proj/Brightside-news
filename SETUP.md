# BrightSide News Setup Guide

## 🔧 Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

### Required for OAuth Authentication

\`\`\`env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id_here
\`\`\`

### Optional for Real News APIs

\`\`\`env
NEXT_PUBLIC_NEWS_API_KEY=your_newsapi_key_here
NEXT_PUBLIC_CURRENTS_API_KEY=your_currents_api_key_here
NEXT_PUBLIC_GNEWS_API_KEY=d2e74b8393208f938b7bf47d96ed1ea0
\`\`\`

## 🔑 Getting OAuth Credentials

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production domain
7. Copy the Client ID to your `.env.local` file

### Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select existing one
3. Add "Facebook Login" product
4. In Facebook Login settings, add valid OAuth redirect URIs:
   - `http://localhost:3000` (for development)
   - Your production domain
5. Copy the App ID to your `.env.local` file

## 📰 Getting News API Keys (Optional)

### NewsAPI
1. Visit [NewsAPI.org](https://newsapi.org/)
2. Sign up for a free account
3. Copy your API key

### Currents API
1. Visit [Currents API](https://currentsapi.services/)
2. Sign up for a free account
3. Copy your API key

### GNews API
1. Visit [GNews.io](https://gnews.io/)
2. Sign up for a free account
3. Copy your API key

## 🚀 Running the Application

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Create your `.env.local` file with the required variables

3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## ✅ Features

- ✅ Real-time OAuth with Google & Facebook
- ✅ Live news streaming from multiple sources
- ✅ Positive news filtering
- ✅ User authentication & profiles
- ✅ Admin dashboard
- ✅ Donation system
- ✅ Mobile responsive design

## 🔒 Security Notes

- Never commit your `.env.local` file to version control
- Use strong passwords for admin accounts
- Regularly rotate API keys
- Enable HTTPS in production
