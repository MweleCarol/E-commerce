import { connectDb } from "./config/db.js";
import express from "express";

import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import cors from "cors";
import "dotenv/config";
import { type } from "os";
import productRouter from "./routes/productRoutes.js";
import userRouter from "./routes/userRoutes.js";
import Product from "./models/productModel.js";
import User from "./models/userModel.js";

const app = express();

app.use(express.json());
app.use(cors());

const port = process.env.PORT;

connectDb();
//API CREATION
app.get("/", (req, res) => {
  res.send("Express App is running");
});

//IMAGE STORAGE ENGINE
const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage: storage });

//CREATING UPLOAD ENDPOINT FOR IMAGES
app.use("/images", express.static("upload/images"));

app.post("/upload", upload.single("product"), (req, res) => {
  try {
    res.json({
      success: true,
      image_url: `http://localhost:${port}/upload/images/${req.file.filename}`,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error,
    });
  }
});

//api endpoints
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);

//New collection creation
app.get("/newcollection", async (req, res) => {
  let products = await Product.find({});
  let newCollection = products.slice(-8);
  console.log("New collection fetched", newCollection);
  res.send(newCollection);
});

//creating endpoint for popular in women category
app.get("/popularinwomen", async (req, res) => {
  let products = await Product.find({
    category: "women",
  });
  let popularInWomen = products.slice(-8);
  console.log("Popular in women fetched", popularInWomen);
  res.send(popularInWomen);
});

//fetch user middleware
const fetchUser = (req, res, next) => {
  //get the user from the jwt token and add id to req object
  const token = req.header("authToken");
  if (!token) {
    res.status(401).send({ error: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate using a valid token" });
  }
};

//endpoint for cart data
app.post("/addtocart", fetchUser, async (req, res) => {
  let userData = await User.findOne({ _id: req.user.id });
  console.log("User data fetched for cart update", userData);
  userData.cartData[req.body.itemID] += 1;
  await User.findOneAndUpdate(
    { _id: req.user.id },
    { cartData: userData.cartData }
  );
  res.send({ success: true, message: "Item added to cart successfully" });
});

//endpoint for removing product from cart
app.post("/removefromcart", fetchUser, async (req, res) => {
  let userData = await User.findOne({ _id: req.user.id });
  console.log("User data fetched for cart update", userData);
  if (userData.cartData[req.body.itemID] > 0)
    userData.cartData[req.body.itemID] -= 1;

  await User.findOneAndUpdate(
    { _id: req.user.id },
    { cartData: userData.cartData }
  );
  res.send({ success: true, message: "Item removed from cart successfully" });
});

//get cartdata endpoint
app.post("/getcart", fetchUser, async (req, res) => {
  console.log("Fetch cart data request received");
  let userData = await User.findOne({ _id: req.user.id });
  console.log("User data fetched for cart retrieval", userData);
  res.json(userData.cartData);
});

app.listen(port, (error) => {
  if (!error) {
    console.log("Server running on Port " + port);
  } else {
    console.log("Error in running the server" + error);
  }
});
