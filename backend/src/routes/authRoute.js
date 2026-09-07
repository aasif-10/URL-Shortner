import express from "express";
import { prisma } from "../config/db.js";
import { hashPassword } from "../utils/hashPassword.js";
import jwt from "jsonwebtoken";
import { cookieOptions } from "../config/cookies.js";
import { cfg } from "../config/envConfig.js";
import * as bcrypt from "bcrypt";

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

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

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  const result = await bcrypt.compare(password, user.password);
  if (!result) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign({ userId: user.id }, cfg.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("accessToken", token, cookieOptions);

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
  res.clearCookie("accessToken", cookieOptions);
  res.status(200).json({
    message: "User logged out successfully",
  });
});

export { router };
