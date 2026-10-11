class AppError extends Error {
  statusCode;
  details;

  constructor(message, statusCode, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export { AppError };
