import jwt from "jsonwebtoken";
import { cfg } from "../config/envConfig.js";
import { AppError } from "../errors/AppError.js";

const isLoggedIn = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    req.log.error("No access token found in cookies");
    throw new AppError("Unauthorized", 401);
  }

  try {
    const decoded = jwt.verify(token, cfg.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    req.log.error("Invalid access token");
    throw new AppError("Unauthorized", 401);
  }

  req.log.info(`User ${decoded.userId} is authenticated`);
  next();
};

export { isLoggedIn };
