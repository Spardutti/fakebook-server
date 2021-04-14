const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwtAuth = require("../../auth/jwtAuth");
const postController = require("../../Controllers/postController");

const jwtProtected = passport.authenticate("jwt", { session: false });

//CREATE A NEW POST
router.post("/new", jwtProtected, postController.newPost);

//DELETE A POST
router.delete("/delete/:id", jwtProtected, postController.deletePost);

//EDIT POST
router.put("/edit/:id", jwtProtected, postController.updatePost);

//ADD A NEW COMMENT TO POST
router.put("/comment/:id", jwtProtected, postController.newPostComment);

//ADD A COMMENT TO A COMMENT
router.put("/comment/:id/reply", jwtProtected, postController.newReply);

module.exports = router;
