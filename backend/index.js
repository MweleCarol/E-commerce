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

app.listen(port, (error) => {
  if (!error) {
    console.log("Server running on Port " + port);
  } else {
    console.log("Error in running the server" + error);
  }
});
