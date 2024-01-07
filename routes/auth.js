// routes/auth.js

const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Adjust the path as per your project structure
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const error_obj = {
      status: false,
      errors: [],
    };

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      error_obj.errors.push({
        param: "email",
        message: "User with this email address already exists.",
        code: "RESOURCE_EXISTS",
      });
    }
    // Check if email and password are valid
    if (name.length < 2) {
      error_obj.errors.push({
        param: "name",
        message: "Name should be at least 2 characters.",
        code: "INVALID_INPUT",
      });
    }
    if (password.length < 2) {
      error_obj.errors.push({
        param: "password",
        message: "Password should be at least 2 characters.",
        code: "INVALID_INPUT",
      });
    }
    if (error_obj.errors.length > 0) {
      return res.status(400).json(error_obj);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    console.log("hashed pw");
    await newUser.save();

    // Create a cookie with the user ID (you can customize the cookie options)
    res.cookie("user", newUser.id, { httpOnly: true });

    // Return the desired response
    res.status(201).json({
      status: true,
      content: {
        data: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          created_at: newUser.createdAt.toISOString(), // Convert to ISO format
        },
        meta: {
          access_token:
            "This app uses cookies for auth! No need for an access token :)", // Replace with the actual cookie value
        },
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error registering user");
  }
});

// Signin
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: false,
        errors: [
          {
            param: "email",
            message: "Please provide a valid email address.",
            code: "INVALID_INPUT",
          },
        ],
      });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        status: false,
        errors: [
          {
            param: "password",
            message: "The credentials you provided are invalid.",
            code: "INVALID_CREDENTIALS",
          },
        ],
      });
    }
    // Set a cookie (you can customize the cookie options)
    res.cookie("user", user.id, { httpOnly: true });

    // Return the desired success response
    res.status(200).json({
      status: true,
      content: {
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.createdAt.toISOString(), // Convert to ISO format
        },
        meta: {
          access_token:
            "This app uses cookies for auth! No need for an access token :)", // Replace with the actual cookie value
        },
      },
    });
  } catch (error) {
    res.status(500).send("Error logging in");
  }
});

// Get user details
router.get("/me", async (req, res) => {
  // Retrieve user details from the cookie (you can use middleware for this)
  const userId = req.cookies.user;
  console.log(userId, "user id in the cookie");

  if (!userId) {
    return res.status(401).json({
      status: false,
      errors: [
        {
          message: "You need to sign in to proceed.",
          code: "NOT_SIGNEDIN",
        },
      ],
    });
  }
  let user = null;
  try {
    user = await User.findOne({ id: userId });
  } catch (error) {
    console.log(error);
  }
  const userOutput = {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.createdAt.toISOString(),
  };

  res.status(200).json({
    status: true,
    content: {
      data: userOutput,
    },
  });
});

module.exports = router;
