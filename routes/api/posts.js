const express = require("express");
const router = express.Router();
const postController = require("../../Controllers/postController");

//CREATE A NEW POST
router.post("/", postController.newPost);

module.exports = router;
