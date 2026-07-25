import jwt from "jsonwebtoken";

export function generateToken(userId) {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error(
      "JWT_SECRET is missing from the backend environment variables."
    );
  }

  return jwt.sign(
    {
      userId: userId.toString(),
    },
    jwtSecret,
    {
      expiresIn: "7d",
    }
  );
}