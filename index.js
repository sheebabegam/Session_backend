const express = require("express");
const session = require("express-session");
const app = express();
const mongoose = require("mongoose");
const userRouter = require("./userRouter");
const MongoDBStore = require("connect-mongodb-session")(session);

const morgan = require("morgan");
const cors = require("cors");

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

const MAX_AGE = 60000; // 60 sec    // 1000 * 60 *1 // 3hrs //
// const port = process.env.PORT || 5000;

//Router
app.use("/api", userRouter);

// LocalHost
app.listen(2000, () => {
  console.log("Server Started on 2000");
});

// DB server creation
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/MyUsers", (err) => {
  if (err) {
    console.log("DB is not connected");
  }
  console.log("DB connected successfully");
});

// setting up connect-mongodb-session store
const mongoDBstore = new MongoDBStore({
  uri: "mongodb://localhost:27017/MyUsers",
  collection: "mySessions",
});

app.use(
  session({
    secret: "a1s2d3f4g5h6",
    name: "session-id", // cookies name to be put in "key" field in postman
    store: mongoDBstore,
    cookie: {
      maxAge: MAX_AGE, // this is when our cookies will expired and the session will not be valid anymore (user will be log out)
      sameSite: false,
      secure: false, // to turn on just in production
    },
    resave: true,
    saveUninitialized: false,
  })
);
module.exports = app;
