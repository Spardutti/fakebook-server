//EXPRES GENERATOR DEFAULTS
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cookieSession = require("cookie-session");

//REQUIREDS
require("dotenv").config();
require("./auth/passport");
require("./auth/google-auth");
const cors = require("cors");
const passport = require("passport");

//MONGODB
const mongoose = require("mongoose");
const mongoDB = process.env.MONGO_URI;
const db = mongoose.connection;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
db.on("error", console.error.bind(console, "MongoDB connection error"));

const userRoutes = require("./routes/api/users");
const postRoutes = require("./routes/api/posts");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(passport.initialize());
app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/users/", userRoutes);
app.use("/posts/", postRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(err.message);
});

module.exports = app;
