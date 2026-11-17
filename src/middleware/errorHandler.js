const env = require("../config/env");

function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error";
  let details = error.details;

  if (error.code === "P2002") {
    statusCode = 409;
    message = "A record with this unique value already exists.";
  } else if (error.code === "P2025") {
    statusCode = 404;
    message = "Requested record was not found.";
  } else if (error.code === "P2003") {
    statusCode = 400;
    message = "Related record does not exist.";
  }

  if (statusCode >= 500) {
    console.error(error);
    if (env.NODE_ENV === "production") message = "Internal server error";
  }

  res.status(statusCode).json({
    success: false,
    error: { message, ...(details ? { details } : {}) }
  });
}

module.exports = { notFound, errorHandler };
