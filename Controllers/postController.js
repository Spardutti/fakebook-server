const Post = require("../models/Post");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const async = require("async");
const ObjectId = require("mongodb").ObjectId;

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
          username: req.user.username,
        });
      } else {
        post = new Post({
          title: req.body.title,
          body: req.body.body,
          author: req.user,
          username: req.user.username,
        });
      }
      post.save((err, post) => {
        if (err) return next(err);
        res.json(post);
      });
    }
  },
];

//LIKE POST
exports.likePost = (req, res, next) => {
  Post.findById(req.params.id, (err, post) => {
    if (err) return next(err);
    post.votes.push(req.user);
    post.save();
    res.json(post);
  });
};

//UNLIKE POST
exports.unlikePost = (req, res, next) => {
  Post.findById(req.params.id, (err, post) => {
    if (err) return next(err);
    let index = post.votes.indexOf(req.user._id);
    post.votes.splice(index, 1);
    post.save();
    res.json(post);
  });
};

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
    if (err) return next(err);
    if (req.file) {
      (post.title = req.body.title),
        (post.body = req.body.body),
        (post._id = req.params.id),
        (post.author = req.user),
        (post.image = "/images/" + req.file.filename);
    } else {
      (post.title = req.body.title),
        (post.body = req.body.body),
        (post._id = req.params.id),
        (post.author = req.user);
    }
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
              author: req.user,
              profilePic: req.user.profilePic,
              comment: req.body.body,
              username: req.user.username,
              date: new Date(Date.now()),
            },
          ],
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
  Post.updateOne(
    { _id: req.params.id },
    { $pull: { comments: { _id: req.body.id } } },
    (err, result) => {
      res.json(result);
    }
  );
  /*
  Post.findById(req.params.id, (err, post) => {
    if (err) return next(errors);
    let index = req.body.index;
    post.comments.splice(index, 1);
    post.save();
    res.json(post);
  });*/
};

//ADD A REPLY TO A COMMENT
exports.newReply = (req, res, next) => {
  Post.findById(req.params.id, (err, post) => {
    if (err) return next(err);
    let index = req.body.index;
    post.comments[index].reply.push({
      username: req.user.username,
      author: req.user,
      reply: req.body.reply,
    });
    post.save();
    res.json(post);
  });
};

//EDIT POST COMMENT
exports.editComment = (req, res, next) => {
  Post.findById(req.params.id, (err, post) => {
    if (err) return next(err);
    let index = req.body.index;
    post.comments[index].comment = req.body.comment;
    post.save();
    res.json(post.comments);
  });
};

//EDIT REPLY COMMENT
exports.editReply = (req, res, next) => {
  Post.findById(req.params.id, (err, post) => {
    if (err) return next(err);
    let commentIndex = req.body.commentIndex;
    let replyIndex = req.body.replyIndex;
    post.comments[commentIndex].reply[replyIndex].reply = req.body.reply;
    post.save();
    res.json(post.comments);
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

//GET CURRENT USER AND FRIENDS POST
exports.friendsPosts = (req, res, next) => {
  let ids = [];
  let postToShow = [];
  User.findById(req.params.id, (err, user) => {
    if (err) return next(err);
    ids.push(user._id);
    user.friends.map((friend) => {
      ids.push(friend.user);
    });
    async.forEach(
      ids,
      (post, callback) => {
        Post.find({ author: ObjectId(post) }, (err, posts) => {
          if (err) return next(err);
          if (posts.length > 0) {
            postToShow.push(posts);
          }
          callback();
        });
      },
      (err) => {
        if (err) return next(err);
        res.json(postToShow);
      }
    );
  });
};
