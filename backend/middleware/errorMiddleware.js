export function errorMiddleware(error, request, response, next) {
  const statusCode =
    response.statusCode && response.statusCode !== 200
      ? response.statusCode
      : 500;

  response.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error",
    stack:
      process.env.NODE_ENV === "development"
        ? error.stack
        : undefined,
  });
}