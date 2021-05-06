const GoogleStrategy = require("passport-google-oauth2").Strategy;
const passport = require("passport");
const User = require("../models/User");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "https://glacial-wildwood-15974.herokuapp.com/users/sucess",
    },
    (accessToken, refreshToken, profile, done) => {
      //CHECK IF USER EXIST
      User.findOne({ googleId: profile.id }, (err, user) => {
        if (user) {
          done(null, user);
        } else {
          let splitName = profile.displayName.split(" ");
          if (splitName.length > 1) {
            new User({
              username: splitName[0],
              googleId: profile.id,
            }).save((err, newUser) => {
              done(null, newUser);
            });
          } else {
            new User({
              username: profile.displayName,
              googleId: profile.id,
            }).save((err, newUser) => {
              done(null, newUser);
            });
          }
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
    done(err, user.id);
  });
});
