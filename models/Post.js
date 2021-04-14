const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  image: { type: String },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now() },
  votes: { type: Number, default: 0 },
  link: String,
  comments: [
    {
      author: { type: String },
      comment: { type: String },
      date: { type: Date, default: Date.now() },
      reply: [
        {
          author: String,
          reply: String,
          date: { type: Date, default: Date.now() },
        },
      ],
    },
  ],
});

module.exports = mongoose.model("Post", PostSchema);
