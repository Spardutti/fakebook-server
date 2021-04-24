const express = require("express");
const router = express.Router();
const passport = require("passport");
const postController = require("../../Controllers/postController");
const jwtAuth = require("../../auth/jwtAuth");

const jwtProtected = passport.authenticate("jwt", { session: false });

//SETTING MULTER
const multer = require("multer");

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "." + file.originalname);
  },
});

const upload = multer({ storage: fileStorageEngine });

//CREATE A NEW POST
router.post(
  "/new",
  jwtProtected,
  upload.single("image"),
  postController.newPost
);
//GET CURRENT USER POSTS
router.get("/:id/posts", postController.currentUserPost);

//GET FRIENDS AND CURRENT USER POSTS
router.get("/:id/home", postController.friendsPosts);

//DELETE A POST
router.delete("/delete/:id", jwtProtected, postController.deletePost);

//EDIT POST
router.put("/edit/:id", jwtProtected, postController.updatePost);

//ADD A NEW COMMENT TO POST
router.put("/comment/:id", jwtProtected, postController.newPostComment);

//ADD A REPLY TO A COMMENT
router.put("/comment/:id/reply", jwtProtected, postController.newReply);

//DELETE A COMMENT
router.delete("/comment/:id", jwtProtected, postController.deleteComment);

//DELETE A REPLY
router.delete("/comment/:id/reply", jwtProtected, postController.deleteReply);

module.exports = router;
