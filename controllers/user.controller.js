import User from "../models/User.model.js";

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
