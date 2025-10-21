import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

//this is  a function to protect routes using Jwt authentication
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];

    //console.log("Extracted Token: "+token);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        //console.log("User not found");
        return res
          .status(401)
          .json({ success: false, error: "User not found" });
      }

      next();
    } catch (error) {
      console.error("Token Verification Error:", error.message);

      return res.json({
        success: false,
        error: "Not authorized, token failed",
      });
    }
  }

  if (!token) {
    //console.log('No token provided in headers'); // Debug log
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }
});
