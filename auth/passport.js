const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");
const bcrypt = require("bcryptjs");

passport.use(
  new LocalStrategy((username, password, done) => {
    //set the username to lowCase to match the database one
    let lowerCaseUsername = username.toLowerCase();
    //find the username
    User.findOne({ username: lowerCaseUsername }, (err, user) => {
      if (err) return done(err);
      if (!user) {
        return done(null, false, { message: "Wrong username" });
      }
      //compared the hashed passwords
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (isMatch) {
          //log in
          return done(null, user);
        } else {
          return done(null, false, { msg: "wrong password" });
        }
      });
    });
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err.user);
  });
});
