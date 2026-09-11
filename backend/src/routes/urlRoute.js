import express from "express";
import { genShortUrl } from "../utils/genShortUrl.js";
import { prisma } from "../config/db.js";
import { AppError } from "../errors/AppError.js";
import { validateUrl } from "../utils/validateUrl.js";
import { isLoggedIn } from "../middlewares/auth.js";
import { cfg } from "../config/env.js";

const router = express.Router();

/**
 * @route POST /api/urls/create
 * @description Create a short URL
 * @access Public
 */
router.post("/create", async (req, res) => {
  const { url } = req.body;
  if (!validateUrl(url)) {
    req.log.error("URL is invalid or missing");
    throw new AppError("Invalid URL", 400);
  }

  const shortUrl = genShortUrl();

  const createdUrl = await prisma.url.create({
    data: {
      longUrl: url,
      shortUrl: `${cfg.BASE_URL}/api/urls/${shortUrl}`,
      userId: "185f4c21-d7ed-4e42-ba5f-4a9eb15bad97", // Replace with actual user ID from authentication
    },
  });

  req.log.info("short url created");
  res.status(201).json({
    createdUrl,
  });
});

/**
 * @route GET /api/urls
 * @description Get all URLs for a user
 * @access Private
 */
router.get("/", async (req, res) => {
  const userId = "185f4c21-d7ed-4e42-ba5f-4a9eb15bad97";

  const urls = await prisma.url.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!urls) {
    return res.status(200).json({
      urls: [],
    });
  }

  req.log.info(`Retrieved URLs for user: ${userId}`);
  res.status(200).json({
    urls,
  });
});

/**
 * @route GET /api/urls/stats
 * @description Get total clicks and total records for a user
 * @access Private
 */
router.get("/stats", async (req, res) => {
  const userId = "185f4c21-d7ed-4e42-ba5f-4a9eb15bad97";

  const totalClicks = await prisma.url.aggregate({
    _sum: {
      clicks: true,
    },
    where: {
      userId: userId,
    },
  });

  const totalRecords = await prisma.url.count({
    where: {
      userId: userId,
    },
  });

  req.log.info(`Retrieved stats for user: ${userId}`);
  res.status(200).json({
    totalClicks: totalClicks._sum.clicks || 0,
    totalLinks: totalRecords,
  });
});

/**
 * @route GET /api/urls/:shortUrl
 * @description Get the long URL for a given short URL
 * @access Public
 */
router.get("/:shortUrl", async (req, res) => {
  const { shortUrl } = req.params;

  const url = await prisma.url.findUnique({
    where: {
      shortUrl: `${cfg.BASE_URL}/api/urls/${shortUrl}`,
    },
  });

  if (!url) {
    req.log.error("Short URL not found in database");
    throw new AppError("Invalid URL", 400);
  }

  const longUrl = url.longUrl;

  await prisma.url.update({
    where: { id: url.id },
    data: { clicks: { increment: 1 } },
  });

  req.log.info(`Redirecting to long URL: ${longUrl}`);
  res.redirect(longUrl);
});

export { router };
