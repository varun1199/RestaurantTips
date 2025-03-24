// This file serves as a bridge for API routes in Vercel environment
const express = require('express');
const serverless = require('serverless-http');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Create an Express application for serverless function
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup basic session management (simplified for serverless)
app.use(session({
  secret: process.env.SESSION_SECRET || 'test-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Mock user database for authentication
const mockUsers = [
  { id: 1, username: 'admin', password: 'admin', role: 'admin' }
];

// Setup Passport Local Strategy
passport.use(new LocalStrategy(
  (username, password, done) => {
    const user = mockUsers.find(u => u.username === username);
    if (!user) return done(null, false, { message: 'Incorrect username' });
    if (user.password !== password) return done(null, false, { message: 'Incorrect password' });
    return done(null, user);
  }
));

// Serialize and deserialize user for session management
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = mockUsers.find(u => u.id === id);
  done(null, user);
});

// Login endpoint
app.post('/api/login', passport.authenticate('local'), (req, res) => {
  res.json({ 
    success: true, 
    user: { 
      id: req.user.id, 
      username: req.user.username, 
      role: req.user.role 
    }
  });
});

// User info endpoint
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ 
      authenticated: true, 
      user: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.logout(function(err) {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

// Base API endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Yeti Tips & Till API is running',
    version: '1.0.0',
    status: 'ok',
    serverless: true
  });
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Export the serverless function
module.exports = serverless(app);