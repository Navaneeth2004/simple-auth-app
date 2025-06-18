# Simple Social Auth with Node.js & React

A simple authentication system with **Google OAuth on the backend** (using Grant) and **Facebook OAuth on the frontend** (using Facebook SDK).

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
   - Add `https://localhost:3000` to Valid OAuth Redirect URIs (HTTPS required)
   - Add `localhost` to App Domains
   - **Note**: Facebook SDK implementation follows the [Facebook Login for the Web Guide](https://developers.facebook.com/docs/facebook-login/web)

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

# Create .env file with Facebook App ID
echo "REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id" > .env

# Create public/index.html
mkdir public
echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Social Auth Demo</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>' > public/index.html

# Start the frontend with HTTPS (required for Facebook)
HTTPS=true npm start
```

## Usage

1. Start the backend server (runs on port 5000)
2. Start the frontend with HTTPS enabled: `HTTPS=true npm start` (runs on port 3000)
3. Open https://localhost:3000 (HTTPS is required for Facebook login)
4. Click "Login with Google" (redirects to backend) or "Login with Facebook" (handled on frontend)
5. Complete the OAuth flow
6. View user information on the page

## Important Notes

### HTTPS Requirement for Facebook
Facebook Login SDK requires HTTPS for all API calls including `FB.getLoginStatus()`. The application will:
- Detect if running on HTTP and show appropriate error messages
- Disable Facebook login functionality when not using HTTPS
- Provide clear instructions to users about using HTTPS

To run with HTTPS in development:
```bash
# For Create React App
HTTPS=true npm start

# Or create a .env file with:
HTTPS=true
```

## How it works

### Google Authentication (Backend)
- **Flow**: Frontend → Backend → Google → Backend → Frontend
- Uses Grant middleware to handle OAuth flow
- User data is passed back to frontend via URL parameters
- Session managed on backend

### Facebook Authentication (Frontend)
- **Flow**: Frontend → Facebook → Frontend
- Uses Facebook JavaScript SDK loaded dynamically
- Implementation based on [Facebook's official Web SDK documentation](https://developers.facebook.com/docs/facebook-login/web)
- OAuth flow handled entirely in the browser
- User data stored in React state
- **Requires HTTPS** for all API calls

### Benefits of Mixed Approach
- **Google**: More secure with client secret on backend, better for production
- **Facebook**: Simpler implementation, no backend session needed, follows official SDK patterns
- **Flexibility**: Choose the best approach for each provider

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
├── tsconfig.json
└── .env
```

## Environment Variables

### Backend (.env)
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Frontend (.env)
```
REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id
HTTPS=true
```

## Security Notes

- Google client secret is safely stored on backend
- Facebook login uses public App ID (no secret needed for frontend)
- **HTTPS is mandatory** for Facebook SDK functionality
- CORS is configured to only allow requests from localhost:3000
- Sessions are used for Google authentication state
- Facebook implementation follows official security guidelines from their documentation

## Available Routes (Backend)

- `GET /connect/google` - Initiate Google OAuth
- `GET /auth/google/callback` - Google OAuth callback
- `GET /user` - Get current user session
- `GET /logout` - Logout user
- `GET /health` - Health check

## Troubleshooting

### Facebook Login Issues
- **Error**: "The method FB.getLoginStatus can no longer be called from http pages"
  - **Solution**: Use HTTPS by running `HTTPS=true npm start`
  - Ensure your Facebook app settings include `https://localhost:3000` in Valid OAuth Redirect URIs

### Development Setup
- Always use `https://localhost:3000` for development when testing Facebook login
- Update your Facebook app's Valid OAuth Redirect URIs to include the HTTPS URL
- The frontend will automatically detect HTTP vs HTTPS and show appropriate warnings

## References

- [Facebook Login for the Web Documentation](https://developers.facebook.com/docs/facebook-login/web) - Official implementation guide used for the Facebook SDK integration
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Grant.js Documentation](https://github.com/simov/grant) - OAuth middleware used for backend Google authentication

That's it! A mixed approach social authentication system combining the best of both backend and frontend OAuth implementations, with proper HTTPS support for Facebook's requirements.
