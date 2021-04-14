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
        res.json(post);
      });
    }
  },
];

//DELETE POST
exports.deletePost = (req, res, next) => {
  Post.findByIdAndRemove(req.params.id, (err, result) => {
    if (err) return next(err);
    res.json({ msg: "post deleted", post: result });
  });
};

//EDIT POST
exports.updatePost = (req, res, next) => {
  Post.findById(req.params.id, (err, post) => {
    (post.title = req.body.title),
      (post.body = req.body.body),
      (post.link = req.body.link);
    post.save((err) => {
      if (err) return next(err);
      else {
        res.json(post);
      }
    });
  });
};

//ADD POST COMMENT
exports.newPostComment = (req, res, next) => {
  Post.findByIdAndUpdate(
    req.params.id,
    {
      $push: {
        comments: {
          $each: [
            {
              author: req.user.username,
              comment: req.body.body,
              date: Date.now(),
            },
          ],
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

//DELETE COMMENT

//ADD A REPLY TO A COMMENT
exports.newReply = (req, res, next) => {
  Post.findById(req.params.id, (err, post) => {
    if (err) return next(err);
    let index = req.body.index;
    post.comments[index].reply.push({
      author: req.user.username,
      reply: req.body.reply,
    });
    post.save();
    res.json(post);
  });
};
