const Post = require("../models/Post");
const { body, validationResult } = require("express-validator");

//CREATE A NEW POST
exports.newPost = [
  body("title").isLength({ min: 1 }).withMessage("Please specify a title"),
  body("body")
    .isLength({ min: 4 })
    .withMessage("Please enter a brief description"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
    } else {
      let post = new Post({
        title: req.body.title,
        body: req.body.title,
        image: req.body.image,
        author: req.user,
      }).save((err, post) => {
        if (err) return next(errors);
        res.json(Post);
      });
    }
  },
];
