const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `http://localhost:5000/api/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      // User exists, check if they are an applicant
      if (user.role !== 'applicant') {
        return done(new Error('Google OAuth is only available for job seekers. Please use email registration for employer accounts.'), null);
      }
      
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = profile.id;
        await user.save();
      }
      return done(null, user);
    }
    
    // Create new user - ONLY for applicants
    const [firstName, ...lastNameParts] = profile.displayName.split(' ');
    const lastName = lastNameParts.join(' ') || '';
    
    user = new User({
      googleId: profile.id,
      email: profile.emails[0].value,
      firstName: firstName,
      lastName: lastName,
      role: 'applicant', // Force role to applicant for Google OAuth
      isVerified: true, // Google accounts are pre-verified
      profile: {
        avatar: profile.photos[0]?.value || '',
        headline: profile._json.headline || 'Job Seeker',
        summary: profile._json.summary || '',
        skills: [],
        experience: [],
        education: []
        // Note: resume field is intentionally not set - users must upload their own CV
      }
    });
    
    await user.save();
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth login
// @access  Public
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  (req, res) => {
    try {
      const user = req.user;
      const token = generateToken(user._id);
      
      // Redirect to frontend with token
      res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        fullName: user.fullName
      }))}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
  }
);

// @route   POST /api/auth/google/verify
// @desc    Verify Google OAuth token (for mobile apps)
// @access  Public
router.post('/google/verify', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ message: 'ID token is required' });
    }
    
    // Find user by Google ID or email
    const user = await User.findOne({ 
      $or: [
        { googleId: idToken },
        { email: req.body.email }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is an applicant
    if (user.role !== 'applicant') {
      return res.status(403).json({ message: 'Google OAuth is only available for job seekers' });
    }
    
    const token = generateToken(user._id);
    
    res.json({
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        fullName: user.fullName
      }
    });
  } catch (error) {
    console.error('Google OAuth verification error:', error);
    res.status(500).json({ message: 'Server error during Google authentication' });
  }
});

module.exports = router;
