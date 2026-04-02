const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User.model');
const dotenv = require('dotenv');

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id_for_dev',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret_for_dev',
    callbackURL: "/auth/google/callback",
    // Allows matching specific domains. We'll also enforce it below.
  },
  async function(accessToken, refreshToken, profile, cb) {
    try {
      // 1. Restrict domain to strictly iilm.edu
      const domain = profile._json.hd;
      if (domain !== 'iilm.edu') {
        return cb(null, false, { message: 'Unauthorized domain. You must use an @iilm.edu email.' });
      }

      // Extract details
      const email = profile.emails && profile.emails[0].value;
      if (!email) {
        return cb(null, false, { message: 'No email found in Google profile.' });
      }

      // Check if user exists
      let user = await User.findOne({ email });

      if (user) {
        // Update user's googleId if missing
        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
        return cb(null, user);
      } else {
        // Create new user defaulted to 'student'
        user = new User({
          name: profile.displayName || 'IILM Student',
          email: email,
          googleId: profile.id,
          role: 'student',
          status: 'active'
        });
        
        await user.save();
        return cb(null, user);
      }
    } catch (error) {
      return cb(error, null);
    }
  }
));

module.exports = passport;
