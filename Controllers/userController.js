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

//LOGIN USER
exports.userLogin = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      res.status(401);
      res.json("Wrong username or password");
    } else {
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

//SEND FRIEND REQUEST
exports.friendRequest = (req, res, next) => {
  //Find the user to receive de friend request
  User.findByIdAndUpdate(
    req.params.id,
    {
      //push the requesting user to the request id
      $push: {
        request: {
          $each: [{ user: req.user, username: req.username }],
          $position: 0,
        },
      },
    },
    { new: true },
    (err, result) => {
      if (err) return next(err);
      res.json(result);
    }
  );
};

// ACCEPT FRIEND REQUEST
exports.acceptFriend = (req, res, next) => {
  //GET THE CURRENT USER REQUESTs ARRAY
  User.findById(req.params.id, (err, user) => {
    if (err) return next(err);
    //SEND THE INDEX OF THE REQUEST IN THE BODY
    let userRequesting = user.request[req.body.index];
    //ADD THE USER TO THE FRIENDS ARRAY
    user.friends.unshift(userRequesting);
    User.findById(userRequesting.user, (err, otherUser) => {
      if (err) return next(err);
      otherUser.friends.unshift(user);
      //REMOVE THE REQUEST
      user.request.splice(req.body.index, 1);
      //SAVE THE USER
      otherUser.save();
      user.save();
      res.json(user);
    });
  });
};

//DECLINE FRIEND REQUEST
exports.rejectFriend = (req, res, next) => {
  //GET THE CURRENT USER
  User.findById(req.params.id, (err, user) => {
    if (err) return next(err);
    //GET THE INDEX OF THE REQUEST TO REJECT
    user.request.splice(req.body.index, 1);
    user.save();
    res.json(user);
  });
};

//DELETE FRIEND
exports.deleteFriend = (req, res, next) => {
  User.findById(req.params.id, (err, user) => {
    if (err) return next(err);
    user.friends.splice(req.body.indes, 1);
    user.save();
    res.json(user);
  });
};

//CHANGE PROFILE PIC
exports.changeProfilePic = (req, res, next) => {
  User.findByIdAndUpdate(
    req.params.id,
    { profilePic: "/images/" + req.file.filename },
    { new: true },
    (err, user) => {
      res.json(user);
    }
  );
};

//LOG OUT
exports.logout = (req, res, next) => {
  req.logout();
  res.json("loged out");
};

//GET ALL NON FRIENDS USERS
exports.getNonFriends = (req, res, next) => {
  //FIND CURRENT USER
  User.findById(req.params.id, (err, user) => {
    if (err) return next(err);
    else {
      //FIND ALL USER XEPT FOR THE CURRENT USER
      User.find({ _id: { $ne: req.params.id } }, (err, users) => {
        if (err) return next(err);
        let nonFriends = [];
        users.forEach((friend) => {
          //ThE ARRAY HAVE TO ELEMENTS _ID & USER. WE MAP THE ARRAY TO GET
          //THE USER AND SEARCH THE INDEX OF IT BY THE ID OF THE FRIEND USER
          if (user.friends.map((e) => e.user).indexOf(friend._id) === -1) {
            nonFriends.push(friend);
          }
        });
        //SPLICE THE ARRAY TO ONLY SHOW 4 FRIENDS
        if (nonFriends.length > 4) {
          nonFriends.splice(4);
        }
        res.json(nonFriends);
      });
    }
  });
};
