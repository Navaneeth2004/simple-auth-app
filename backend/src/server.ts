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

// Grant configuration
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
  },
  facebook: {
    key: process.env.FACEBOOK_APP_ID || 'your-facebook-app-id',
    secret: process.env.FACEBOOK_APP_SECRET || 'your-facebook-app-secret',
    scope: ['email'],
    callback: '/auth/facebook/callback'
  }
};

// Initialize Grant
app.use(grant.express(grantConfig));

// Routes
app.get('/auth/google/callback', (req, res) => {
  const user = req.session.grant?.response;
  if (user) {
    res.redirect(`http://localhost:3000?user=${encodeURIComponent(JSON.stringify(user))}`);
  } else {
    res.redirect('http://localhost:3000?error=auth_failed');
  }
});

app.get('/auth/facebook/callback', (req, res) => {
  const user = req.session.grant?.response;
  if (user) {
    res.redirect(`http://localhost:3000?user=${encodeURIComponent(JSON.stringify(user))}`);
  } else {
    res.redirect('http://localhost:3000?error=auth_failed');
  }
});

app.get('/user', (req, res) => {
  const user = req.session.grant?.response;
  res.json({ user: user || null });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});