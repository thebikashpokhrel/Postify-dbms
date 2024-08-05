import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const SignUpController = async function (req, res) {
  try {
    const { firstname, lastname, username, email, password } = req.body;

    const existingUserWithUsername = await User.findOne({ username });
    if (existingUserWithUsername) {
      return res.status(400).json({
        error: "Username already exists",
      });
    }

    const existingUserWithEmail = await User.findOne({ email });
    if (existingUserWithEmail) {
      return res.status(400).json({
        error: "Account already exists for the given email",
      });
    }

    const newUser = new User(firstname, lastname, username, email, password);

    const savedUser = await newUser.save();

    if (!savedUser) {
      return res.status(500).json({
        error: "Error while signing up",
      });
    }
    return res.status(201).json({
      user: newUser,
      message: "Signed Up Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const SignInController = async function (req, res) {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({
        error: "User with given email doesn't exist",
      });
    }

    const user = await User.findByEmailAndPassword(email, password);

    if (!user) {
      return res.status(400).json({
        error: "Invalid credentials",
      });
    }

    const payload = {
      userId: existingUser.id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "2d",
    });

    res.cookie("postify_token", token, {
      maxAge: 10 * 24 * 60 * 60 * 1000, //Miliseconds
      httpOnly: true,
    });
    return res.status(200).json({
      user: existingUser,
      message: "Signed in Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const SignOutController = async function (req, res) {
  try {
    res.cookie("postify_token", "", {
      maxAge: 0,
    });

    return res.status(200).json({
      message: "Signed Out Successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Internal Server Error",
    });
  }
};
