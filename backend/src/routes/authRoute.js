import express from "express";
import { prisma } from "../config/db.js";
import { hashPassword } from "../utils/hashPassword.js";
import jwt from "jsonwebtoken";
import { cookieOptions } from "../config/cookies.js";
import { cfg } from "../config/envConfig.js";
import * as bcrypt from "bcrypt";
import { AppError } from "../errors/AppError.js";

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    req.log.error("Missing fields in request body");
    throw new AppError("Missing required fields", 400);
  }

  const exists = await prisma.user.findUnique({
    where: { email },
  });
  if (exists) {
    req.log.error(`User with email ${email} already exists`);
    throw new AppError("User with this email already exists", 400);
  }

  const hash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hash,
    },
  });

  const token = jwt.sign({ userId: user.id }, cfg.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("accessToken", token, cookieOptions);

  req.log.info(`User registered: ${user.email}`);
  res.status(201).json({
    message: "User registered successfully",
    user,
  });
});

/**
 * @route POST /api/auth/login
 * @description Login a user
 * @access Public
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    req.log.error("Missing email or password in request body");
    throw new AppError("Missing email or password", 400);
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) {
    req.log.error(`User with email ${email} not found`);
    throw new AppError("Invalid credentials", 404);
  }

  const result = await bcrypt.compare(password, user.password);
  if (!result) {
    req.log.error(`Invalid credentials for user ${email}`);
    throw new AppError("Invalid credentials", 401);
  }

  const token = jwt.sign({ userId: user.id }, cfg.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("accessToken", token, cookieOptions);

  req.log.info(`User logged in: ${user.email}`);
  res.status(201).json({
    message: "User logged in successfully",
    user,
  });
});

/**
 * @route GET /api/auth/logout
 * @description Logout a user
 * @access Public
 */
router.get("/logout", (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) {
    req.log.error("No access token found in cookies");
    throw new AppError("No access token found", 400);
  }

  res.clearCookie("accessToken", cookieOptions);

  req.log.info("User logged out successfully");
  res.status(200).json({
    message: "User logged out successfully",
  });
});

export { router };
