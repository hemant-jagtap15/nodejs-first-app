import express from "express";
import path from "path";
import mongoose from "mongoose"; //import mongoose
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { log } from "console";
//connecting mongoDb after that create schema
mongoose
  .connect("mongodb://127.0.0.1:27017", {
    dbName: "backend", //our db name
  })
  .then(() => console.log("Database Connected"))
  .catch((e) => console.log(e));

//Creating Schema for db
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const User = mongoose.model("User", userSchema);

const app = express(); //server created

const users = [];

//Using Middlewares
app.use(express.static(path.join(path.resolve(), "public"))); //to attach differnt folders we write like this here attaching static public
app.use(express.urlencoded({ extended: true })); //using this we can access data from the form
//console.log(path.join(path.resolve(), "public"));//print path
app.use(cookieParser());

//setting up view engine
app.set("view engine", "ejs");

const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const decoded = jwt.verify(token, "sghfagszgahskgsjgvaf");

    req.user = await User.findById(decoded._id);

    // console.log(decoded);
    next();
  } else {
    res.render("login");
  }
};

app.get("/", isAuthenticated, (req, res) => {
  res.render("logout", { name: req.user.name });
});
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/login", async (req, res) => {
  const { name, email } = req.body;

  let user = await User.findOne({ email });
  if (!user) {
    return res.redirect("/register");
  }
  user = await User.create({
    name,
    email,
  });

  const token = jwt.sign({ _id: user._id }, "sghfagszgahskgsjgvaf");

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});

app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

app.listen(5000, () => {
  console.log("Server is working");
});
