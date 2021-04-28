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

//ADD LIKE TO POST
router.put("/:id/like", jwtProtected, postController.likePost);

//UNLIKE POST
router.put("/:id/unlike", jwtProtected, postController.unlikePost);

//DELETE A POST
router.delete("/:id/delete", jwtProtected, postController.deletePost);

//EDIT POST
router.put(
  "/:id/edit",
  jwtProtected,
  upload.single("image"),
  postController.updatePost
);

//ADD A NEW COMMENT TO POST
router.put("/:id/comment", jwtProtected, postController.newPostComment);

//DELETE A COMMENT
router.delete("/comment/:id", jwtProtected, postController.deleteComment);

//EDIT A COMMENT
router.put("/comment/:id", postController.editComment);

//ADD A REPLY TO A COMMENT
router.put("/:id/reply", jwtProtected, postController.newReply);

//EDIT REPLY
router.put("/:id/comment/reply", postController.editReply);

//DELETE A REPLY
router.delete("/comment/:id/reply", jwtProtected, postController.deleteReply);

module.exports = router;
