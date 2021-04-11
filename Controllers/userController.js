const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
require("dotenv").config();
const async = require("async");

//Validates and create a new user
exports.createUser = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid Email format"),

  body("username")
    .toLowerCase()
    .isLength({ min: 4 })
    .withMessage("Username must be at least 4 characters long"),

  body("password")
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters long"),

  body("confirm", "Password must match")
    .exists()
    .custom((value, { req }) => value === req.body.password),

  (req, res, next) => {
    const errors = validationResult(req);
    //SEND THE VALIDATION ERRORS
    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
    } else {
      const { username, email, password } = req.body;

      async.parallel(
        {
          email: function (callback) {
            User.findOne({ email }).exec(callback);
          },
          username: function (callback) {
            User.findOne({ username }).exec(callback);
          },
        },
        function (err, results) {
          if (err) return next(err);
          if (results.email) {
            return res.json("Email already in use");
          }
          if (results.username) {
            return res.json("Username already in use");
          } else {
            bcrypt.hash(password, 10, (err, hash) => {
              if (err) return next(err);
              //create new user
              const user = new User({
                email,
                username,
                password: hash,
              }).save((err, user) => {
                if (err) return next(err);
                res.json({
                  msg: "User created",
                  user,
                });
              });
            });
          }
        }
      );
    }
  },
];

exports.userLogin = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) res.json("user not found");
    else {
      req.login(user, { session: false }, (err) => {
        if (err) return next(err);
        const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
          expiresIn: "24h",
        });
        res.json({
          msg: "logged in successfuly",
          user: req.user,
          token,
        });
      });
    }
  })(req, res, next);
};
