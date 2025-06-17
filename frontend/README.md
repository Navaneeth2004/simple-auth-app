# Simple Social Auth with Node.js & React

A super simple Google and Facebook authentication system using Grant (no Passport) and React.

## Prerequisites

1. **Google OAuth Setup:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add `http://localhost:5000/connect/google/callback` to authorized redirect URIs

2. **Facebook OAuth Setup:**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create a new app
   - Add Facebook Login product
   - Add `http://localhost:5000/connect/facebook/callback` to Valid OAuth Redirect URIs

## Setup

### Backend Setup
```bash
# Create backend directory
mkdir auth-backend
cd auth-backend

# Copy the package.json and install dependencies
npm install

# Create src directory and copy server.ts
mkdir src
# Copy server.ts to src/server.ts
# Copy tsconfig.json to root

# Create .env file with your credentials
echo "GOOGLE_CLIENT_ID=your_google_client_id" > .env
echo "GOOGLE_CLIENT_SECRET=your_google_client_secret" >> .env
echo "FACEBOOK_APP_ID=your_facebook_app_id" >> .env
echo "FACEBOOK_APP_SECRET=your_facebook_app_secret" >> .env

# Start the backend
npm run dev
```

### Frontend Setup
```bash
# Create frontend directory
mkdir auth-frontend
cd auth-frontend

# Copy package.json and install dependencies
npm install

# Create src directory and copy files
mkdir src
# Copy App.tsx, App.css, index.tsx to src/
# Copy tsconfig.json to root

# Create public/index.html
mkdir public
echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Social Auth Demo</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>' > public/index.html

# Start the frontend
npm start
```

## Usage

1. Start the backend server (runs on port 5000)
2. Start the frontend (runs on port 3000)
3. Open http://localhost:3000
4. Click "Login with Google" or "Login with Facebook"
5. Complete the OAuth flow
6. View user information on the page

## How it works

- **Backend**: Uses Grant to handle OAuth flows with Google and Facebook
- **Frontend**: Simple React app that redirects to backend for auth and displays user info
- **No Database**: User data is only stored in session and displayed on frontend
- **Super Simple**: Minimal code, no unnecessary complexity

## Project Structure

```
auth-backend/
├── src/
│   └── server.ts
├── package.json
├── tsconfig.json
└── .env

auth-frontend/
├── src/
│   ├── App.tsx
│   ├── App.css
│   └── index.tsx
├── public/
│   └── index.html
├── package.json
└── tsconfig.json
```

That's it! Super simple social authentication system.