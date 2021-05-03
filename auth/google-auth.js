const GoogleStrategy = require("passport-google-oauth2").Strategy;
const passport = require("passport");
const User = require("../models/User");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/users/auth/google/redirect",
    },
    (accessToken, refreshToken, profile, done) => {
      //CHECK IF USER EXIST
      User.findOne({ googleId: profile.id }, (err, user) => {
        if (user) {
          console.log("exist");
          done(null, user);
        } else {
          new User({
            username: profile.displayName,
            googleId: profile.id,
          }).save((err, newUser) => {
            console.log("new user");
            done(null, newUser);
          });
        }
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(user.id);
  });
});
