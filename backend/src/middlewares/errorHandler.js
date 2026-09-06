import { AppError } from "../errors/AppError.js";

const errorHandler = (error, req, res, next) => {
  req.log.error(error.message);
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  return res.status(500).json({ message: "Internal server error" });
};

export { errorHandler };
