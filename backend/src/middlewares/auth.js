import jwt from "jsonwebtoken";
import { cfg } from "../config/envConfig.js";
import { AppError } from "../errors/AppError.js";

const isLoggedIn = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    throw new AppError("Unauthorized", 401);
  }
  const decoded = jwt.verify(token, cfg.JWT_SECRET);
  req.user = decoded;
  next();
};

export { isLoggedIn };
