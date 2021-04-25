const Post = require("../models/Post");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const async = require("async");

//CREATE A NEW POST
exports.newPost = [
  body("title").notEmpty().withMessage("Title requierd"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
    } else {
      let post;
      if (req.file) {
        post = new Post({
          title: req.body.title,
          body: req.body.body,
          author: req.user,
          image: "/images/" + req.file.filename,
        });
      } else {
        post = new Post({
          title: req.body.title,
          body: req.body.body,
          author: req.user,
        });
      }
      post.save((err, post) => {
        if (err) return next(err);
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
      (post.image = req.body.image),
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
exports.deleteComment = (req, res, next) => {
  Post.findById(req.params.id, (err, post) => {
    if (err) return next(errors);
    let index = req.body.index;
    post.comments.splice(index, 1);
    post.save();
    res.json(post);
  });
};

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

//DELETE REPLY
exports.deleteReply = (req, res, next) => {
  Post.findById(req.params.id, (err, post) => {
    if (err) return next(err);
    const commentIndex = req.body.commentIndex;
    const replyIndex = req.body.replyIndex;
    //get the reply to delete
    post.comments[commentIndex].reply.splice(replyIndex, 1);
    post.save();
    res.json(post);
  });
};

//GET CURRENT USER POST
exports.currentUserPost = (req, res, next) => {
  Post.find({ author: req.params.id }, (err, posts) => {
    if (err) return next(err);
    res.json(posts);
  });
};

//GET FRIENDS AND CURRENT USER POST
exports.friendsPosts = (req, res, next) => {
  let friendPosts = [];
  User.findById(req.params.id, (err, user) => {
    if (err) return next(err);
    async.forEach(
      user.friends,
      (friend, callback) => {
        Post.find(
          //this will find an array of matches
          { author: { $in: [req.params.id, friend.user] } },
          (err, post) => {
            if (err) return next(err);
            friendPosts.push(post);
            callback();
          }
        );
      },
      (err) => {
        if (err) return next(err);
        //return [0] to avoid duplicates
        res.json(friendPosts[0]);
      }
    );
  });
};
