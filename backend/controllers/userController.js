import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import validator from "validator";
import bcrypt from "bcrypt";
//helper Create JWt
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

//REGISTER USER CONTROLLER function
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  //validate input
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, error: "Please fill all fields" });
  }

  if (!validator.isEmail(email)) {
    return res
      .status(400)
      .json({ success: false, error: "Please enter a valid email" });
  }

  try {
    //check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: "User already exists" });
    }

    //create new user
    //bcrypt hashes the password to be stored in the db
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    //create token
    const token = createToken(user._id);

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
    });
  }
};


//login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Create token
    const token = createToken(user._id);

    res.status(200).json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};  



export { registerUser, loginUser };


