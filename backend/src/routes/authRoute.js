import express from "express";
import { prisma } from "../config/db.js";
import { hashValue } from "../utils/hashValue.js";
import jwt from "jsonwebtoken";
import { cookieOptions } from "../config/cookies.js";
import { cfg } from "../config/env.js";
import * as bcrypt from "bcrypt";
import { AppError } from "../errors/AppError.js";
import { isLoggedIn } from "../middlewares/auth.js";

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
    throw new AppError("User with this email already exists", 409);
  }

  const hashedPass = await hashValue(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPass,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  const accessToken = jwt.sign({ userId: user.id }, cfg.JWT_SECRET, {
    expiresIn: "5m",
  });

  const refreshToken = jwt.sign({ userId: user.id }, cfg.JWT_SECRET, {
    expiresIn: "5d",
  });
  const hashedRefToken = await hashValue(refreshToken);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefToken },
  });

  res.cookie("accessToken", accessToken, cookieOptions);

  req.log.info(`User registered: ${user.email}`);
  res.status(201).json({
    message: "User registered successfully",
    user,
    refreshToken,
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
    throw new AppError("Invalid credentials", 401);
  }

  const result = await bcrypt.compare(password, user.password);
  if (!result) {
    req.log.error(`Invalid credentials for user ${email}`);
    throw new AppError("Invalid credentials", 401);
  }

  const accessToken = jwt.sign({ userId: user.id }, cfg.JWT_SECRET, {
    expiresIn: "5m",
  });

  const refreshToken = jwt.sign({ userId: user.id }, cfg.JWT_SECRET, {
    expiresIn: "5d",
  });
  const hashedRefToken = await hashValue(refreshToken);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefToken },
  });

  res.cookie("accessToken", accessToken, cookieOptions);

  req.log.info(`User logged in: ${user.email}`);
  res.status(200).json({
    message: "User logged in successfully",
    user: { id: user.id, name: user.name, email: user.email },
    refreshToken,
  });
});

/**
 * @route GET /api/auth/logout
 * @description Logout a user
 * @access Private
 */
router.get("/logout", isLoggedIn, async (req, res) => {
  const user = req.user;

  await prisma.user.update({
    where: { id: user.userId },
    data: { refreshToken: null },
  });

  res.clearCookie("accessToken", cookieOptions);

  req.log.info("User logged out successfully");
  res.status(200).json({
    message: "User logged out successfully",
  });
});

/**
 * @route POST /api/auth/refresh
 * @description Refresh access token using refresh token
 * @access Public
 */
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new AppError("Refresh token is required", 400);
  }

  const decoded = jwt.verify(refreshToken, cfg.JWT_SECRET);
  const userId = decoded.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user || !user.refreshToken) {
    throw new AppError("Invalid refresh token", 401);
  }

  const result = await bcrypt.compare(refreshToken, user.refreshToken);
  if (!result) {
    throw new AppError("Invalid refresh token", 401);
  }

  const accessToken = jwt.sign({ userId: userId }, cfg.JWT_SECRET, {
    expiresIn: "5m",
  });
  res.cookie("accessToken", accessToken);
  res.status(200).json({ message: "Access token refreshed successfully" });
});

/**
 * @route GET /api/auth/get-me
 * @description Get the current logged-in user
 * @access Private
 */
router.get("/get-me", isLoggedIn, async (req, res) => {
  const user = req.user;

  const foundUser = await prisma.user.findUnique({
    where: { id: user.userId },
  });
  if (!foundUser) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({ user: foundUser });
});

export { router };
