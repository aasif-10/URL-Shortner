import { AppError } from "../errors/app.error.js";

const errorHandler = (error, req, res, next) => {
  req.log.error(error.message);
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      ...(error.details ? { errors: error.details } : {}),
    });
  }

  return res.status(500).json({ message: "Internal server error" });
};

export { errorHandler };
