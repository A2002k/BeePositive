export function notFoundMiddleware(request, response, next) {
  const error = new Error(
    `Route not found: ${request.method} ${request.originalUrl}`,
  );

  response.status(404);
  next(error);
}