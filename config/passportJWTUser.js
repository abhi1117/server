const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');
const passport = require('passport');

// Extract JWT from cookies
const cookieExtractor = function (req) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['jwt'];
  }
  return token;
};

// Configure Passport to use JWT strategy
const opts = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
    'jwt-user',
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id);
      console.log('user:',user);
      if (user) {
        return done(null, user); // Attach user to the request
      }
      return done(null, false); // No user found
    } catch (err) {
      return done(err, false);
    }
  })
);

module.exports = passport;
