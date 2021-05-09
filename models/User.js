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
  profilePic: {
    type: String,
    default:
      "https://fakebook-app.s3.us-east-2.amazonaws.com/038cfaa10c21903f06ef470d8f620550",
  },
});

module.exports = mongoose.model("User", UserSchema);
