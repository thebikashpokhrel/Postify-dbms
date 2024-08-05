import { extractDataFromToken } from "../utils/extractDataFromToken.js";
import User from "../models/user.model.js";

export const authenticate = async function (request, response, next) {
  try {
    const token = request.cookies.postify_token;
    console.log(token);
    if (!token) {
      return response.status(400).json({
        error: "Unauthorized request - Token not available",
      });
    }

    const tokenPayload = extractDataFromToken(token);

    if (!tokenPayload) {
      return response.status(400).json({
        error: "Unauthorized request - Token is invalid",
      });
    }

    const userId = tokenPayload.userId;

    const user = await User.findById(userId);
    if (!user) {
      return response.status(400).json({
        error: "User not found",
      });
    }

    request.userId = user.id;
    next();
  } catch (error) {
    return response.status(500).json({
      error: "Internal server error",
    });
  }
};
