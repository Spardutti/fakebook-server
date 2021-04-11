var express = require("express");
var router = express.Router();
const passport = require("passport");
const jwtAuth = require("../../auth/jwtAuth");
const userController = require("../../Controllers/userController");

//VAR FOR PROTECTED ROUTES
const jwtProtected = passport.authenticate("jwt", { session: false });

//////////////////////////////////////////////// USER ROUTES ///////////////////////

//CREATE A NEW USER
router.post("/users", userController.createUser);

//LOG IN USER
router.post("/users/login", userController.userLogin);

module.exports = router;
