import jwt from "jsonwebtoken";

import User from "../models/User.js";

export async function protect(req, res, next) {
  try {
    const authorizationHeader =
      req.headers.authorization;

    if (
      !authorizationHeader ||
      !authorizationHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required.",
      });
    }

    const token =
      authorizationHeader.split(" ")[1];

    const jwtSecret =
      process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error(
        "JWT_SECRET is missing from the backend environment variables."
      );

      return res.status(500).json({
        success: false,
        message:
          "Authentication configuration error.",
      });
    }

    const decoded = jwt.verify(
      token,
      jwtSecret
    );

    const user = await User.findById(
      decoded.userId || decoded.id
    ).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "The user associated with this token no longer exists.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(
      "Authentication middleware error:",
      error
    );

    if (error.name === "TokenExpiredError") {
  return res.status(401).json({
    success: false,
    message:
      "Your login session has expired. Please log in again.",
  });
}

if (error.name === "JsonWebTokenError") {
  return res.status(401).json({
    success: false,
    message:
      "Invalid authentication token.",
  });
}

    return res.status(500).json({
      success: false,
      message:
        "Unable to authenticate this request.",
    });
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message:
        "Administrator access is required.",
    });
  }

  next();
}