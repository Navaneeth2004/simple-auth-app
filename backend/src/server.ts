import express from 'express';
import session from 'express-session';
import grant from 'grant';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Type extension for session
declare module 'express-session' {
  interface SessionData {
    grant?: {
      response?: any;
      [key: string]: any;
    };
  }
}

const app = express();
const PORT = 5000;

// Session configuration
app.use(session({
  secret: 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: true
}));

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Grant configuration - Only Google now
const grantConfig = {
  defaults: {
    origin: 'http://localhost:5000',
    transport: 'session',
    state: true
  },
  google: {
    key: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
    secret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
    scope: ['profile', 'email'],
    callback: '/auth/google/callback'
  }
};

// Initialize Grant
app.use(grant.express(grantConfig));

// Routes - Only Google callback needed
app.get('/auth/google/callback', (req, res) => {
  const user = req.session.grant?.response;
  if (user) {
    res.redirect(`http://localhost:3000?user=${encodeURIComponent(JSON.stringify(user))}`);
  } else {
    res.redirect('http://localhost:3000?error=auth_failed');
  }
});

// Get current user session
app.get('/user', (req, res) => {
  const user = req.session.grant?.response;
  res.json({ user: user || null });
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out' });
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log('- GET /connect/google - Initiate Google OAuth');
  console.log('- GET /auth/google/callback - Google OAuth callback');
  console.log('- GET /user - Get current user session');
  console.log('- GET /logout - Logout user');
  console.log('- GET /health - Health check');
});