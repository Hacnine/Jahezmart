# OAuth2 Setup Guide for Jahezmart

## Overview
This application now supports OAuth2 authentication with Google and GitHub, in addition to traditional email/password login.

## Prerequisites
- Google Cloud Console account
- GitHub account with developer access

---

## 1. Google OAuth Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services > Credentials**

### Step 2: Configure OAuth Consent Screen
1. Navigate to **APIs & Services > OAuth consent screen**
2. Choose **External** user type
3. Fill in required fields:
   - App name: `Jahezmart`
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes: `email`, `profile`
5. Save and continue

### Step 3: Create OAuth Credentials
1. Navigate to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. Choose **Web application**
4. Configure:
   - Name: `Jahezmart Web Client`
   - Authorized JavaScript origins: 
     - `http://localhost:3000`
     - `http://localhost:8000`
   - Authorized redirect URIs: 
     - `http://localhost:8000/api/auth/google/callback`
5. Click **Create**
6. Copy your **Client ID** and **Client Secret**

---

## 2. GitHub OAuth Setup

### Step 1: Create GitHub OAuth App
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in app details:
   - Application name: `Jahezmart`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:8000/api/auth/github/callback`
4. Click **Register application**

### Step 2: Get Credentials
1. After creating, you'll see your **Client ID**
2. Click **Generate a new client secret**
3. Copy both **Client ID** and **Client Secret** (secret shown only once!)

---

## 3. Environment Configuration

Update `backend/.env` file with your OAuth credentials:

```env
# OAuth2 Configuration
# Get Google credentials from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback

# Get GitHub credentials from: https://github.com/settings/developers
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:8000/api/auth/github/callback

# Frontend URL for OAuth redirects
FRONTEND_URL=http://localhost:3000
```

**Frontend**: Optionally set `NEXT_PUBLIC_API_URL` in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 4. Testing OAuth Login

### Local Development
1. Start backend: `cd backend && npm run start:dev`
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to `http://localhost:3000/signin`
4. Click **Google** or **GitHub** button
5. Authorize the app on provider's site
6. You'll be redirected to `/account` upon success

### Troubleshooting
- **Redirect URI mismatch**: Ensure callback URLs match exactly in provider settings
- **Invalid credentials**: Double-check Client ID and Secret in `.env`
- **Token not found**: Check browser console and backend logs
- **CORS errors**: Backend CORS is configured for localhost:3000

---

## 5. Production Deployment

### Update OAuth Provider Settings
1. **Google**: Add production domain to authorized origins and redirect URIs
   - Origin: `https://api.yourdomain.com`
   - Redirect: `https://api.yourdomain.com/api/auth/google/callback`

2. **GitHub**: Add production URLs
   - Homepage: `https://yourdomain.com`
   - Callback: `https://api.yourdomain.com/api/auth/github/callback`

### Update Environment Variables
```env
FRONTEND_URL=https://yourdomain.com
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback
GITHUB_CALLBACK_URL=https://api.yourdomain.com/api/auth/github/callback
```

Frontend:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## 6. OAuth Flow Architecture

```
User clicks "Sign in with Google/GitHub"
         ↓
Frontend redirects to: http://localhost:8000/api/auth/{provider}
         ↓
Backend redirects to OAuth provider (Google/GitHub)
         ↓
User authorizes on provider's site
         ↓
Provider redirects to: http://localhost:8000/api/auth/{provider}/callback
         ↓
Backend validates, creates/finds user, generates JWT
         ↓
Backend redirects to: http://localhost:3000/auth/callback?token={jwt}
         ↓
Frontend extracts token, stores in Redux, redirects to /account
```

---

## 7. Features

### What Works
✅ Sign in with Google  
✅ Sign in with GitHub  
✅ Traditional email/password login  
✅ User registration  
✅ Automatic account creation for OAuth users  
✅ JWT token generation and storage  
✅ Session persistence via Redux  
✅ Cart/wishlist/order history sync  

### Security Features
- JWT tokens with configurable expiration
- Passport.js strategy validation
- CORS protection
- Secure OAuth flow with state validation
- Backend-only credential storage

---

## Support
For issues or questions, check:
- [Passport.js Google OAuth2](http://www.passportjs.org/packages/passport-google-oauth20/)
- [Passport.js GitHub OAuth2](http://www.passportjs.org/packages/passport-github2/)
- [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Docs](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
