import jwt from "jsonwebtoken";

export function extractDataFromToken(token) {
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return verified;
  } catch (error) {
    console.log(error);
  }
}
