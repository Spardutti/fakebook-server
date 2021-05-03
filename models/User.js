const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String },
  username: { type: String },
  password: { type: String },
  googleId: String,
  friends: [
    { user: { type: Schema.Types.ObjectId, ref: "User" }, username: String },
  ],
  request: [
    { user: { type: Schema.Types.ObjectId, ref: "User" }, username: String },
  ],
  profilePic: { type: String, default: "/images/Fakebook.png" },
});

module.exports = mongoose.model("User", UserSchema);
