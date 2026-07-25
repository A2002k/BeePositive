import express from "express";

const router = express.Router();

router.get("/", (request, response) => {
  response.status(200).json({
    success: true,
    message: "BeePositive API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

export default router;