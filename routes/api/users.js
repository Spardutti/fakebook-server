var express = require("express");
var router = express.Router();
const passport = require("passport");
const jwtAuth = require("../../auth/jwtAuth");
const userController = require("../../Controllers/userController");

//SETTING MULTER
const multer = require("multer");

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "." + file.originalname);
  },
});

const upload = multer({ storage: fileStorageEngine });
/////////////////

//VAR FOR PROTECTED ROUTES
const jwtProtected = passport.authenticate("jwt", { session: false });

//////////////////////////////////////////////// USER ROUTES ///////////////////////

//CREATE A NEW USER
router.post("/", userController.createUser);

//LOG IN USER
router.post("/login", userController.userLogin);

//SEND FRIEND REQUEST
router.put("/:id/request", jwtProtected, userController.friendRequest);

//ACCEPT FRIEND REQUEST
router.put("/:id/accept", userController.acceptFriend);

//DECLINE FRIEND REQUEST
router.put("/:id/reject", userController.rejectFriend);

//DELETE FRIEND
router.put("/:id/delete", userController.deleteFriend);

//CHANGE PROFLE PIC
router.post(
  "/:id/profile",
  upload.single("profilePic"),
  userController.changeProfilePic
);

module.exports = router;
