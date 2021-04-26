const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, required: true },
  body: { type: String },
  image: { type: String },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  username: String,
  date: { type: Date, default: new Date(Date.now()) },
  votes: [{ type: Schema.Types.ObjectId, res: "User" }],
  link: String,
  comments: [
    {
      author: { type: Schema.Types.ObjectId, ref: "User" },
      profilePic: String,
      username: { type: String },
      comment: { type: String },
      date: { type: Date, default: Date.now() },
      reply: [
        {
          author: { type: Schema.Types.ObjectId, ref: "User" },
          username: String,
          reply: String,
          date: { type: Date, default: Date.now() },
        },
      ],
    },
  ],
});

module.exports = mongoose.model("Post", PostSchema);
