const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  friends: [{ user: { type: Schema.Types.ObjectId, ref: "User" } }],
  request: [{ user: { type: Schema.Types.ObjectId, ref: "User" } }],
});

module.exports = mongoose.model("User", UserSchema);
