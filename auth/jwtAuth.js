const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const passport = require("passport");
require("dotenv").config();
const User = require("../models/User");

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    (jwtpayload, done) => {
      User.findById(jwtpayload._id, (err, user) => {
        if (err) return done(err);
        return done(null, user);
      });
    }
  )
);
