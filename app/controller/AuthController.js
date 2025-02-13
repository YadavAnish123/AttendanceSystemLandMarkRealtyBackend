const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
 
const User = require('../model/UserModel'); // Import the Mongoose User model
require('dotenv').config();
const registration = async (req, res) => {
  let { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({
      status: false,
      message: "All fields are required",
      data: []
    });
  }
  try {
    // Check if the user already exists based on email
    const userExists = await User.findOne({ email:email });
    
    if (userExists) {
      // If user exists, send a message indicating that the email already exists
      return res.status(400).json({
        status: false,
        message: "Email already exists",
        data: []
      });
    }

    // Hash the password before storing
    const hashPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = new User({
      name,
      email,
      password: hashPassword,
      phone
    });

    // Save the user to the database
    await newUser.save();

    // Generate JWT Token
    const token = jwt.sign(
      { email: newUser.email },  // Use the email as the payload
      process.env.JWT_SECRET_KEY,  // Your JWT secret key
      { expiresIn: "1h" }          // Optional: Set expiration time for the token
    );

    res.status(201).json({
      status: true,
      message: "User created successfully",
      data: {
        user: {
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone
        },
        token: token,  // Send the generated JWT token
      },
    });
  } catch (e) {
    console.error("Database error:", e.message);  // Log error for debugging

    res.status(500).json({
      status: false,
      message: e.message,
      data: [],
    });
  }
};

const login = async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: false,
      message: "Email and password are required",
      data: [],
    });
  }

  try {
    // Check if the user exists based on email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "Invalid credentials",
        data: [],
      });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        status: false,
        message: "Invalid credentials",
        data: [],
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { email: user.email },  // Use the email as the payload
      process.env.JWT_SECRET_KEY,  // Your JWT secret key
      { expiresIn: "1h" }          // Optional: Set expiration time for the token
    );

    res.status(200).json({
      status: true,
      message: "Login successful",
      data: {
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
        token: token,  // Send the generated JWT token
      },
    });
  } catch (e) {
    console.error("Login error:", e.message);

    res.status(500).json({
      status: false,
      message: e.message,
      data: [],
    });
  }
};


module.exports = { registration,login };
