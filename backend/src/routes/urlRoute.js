import express from "express";
import { genShortUrl } from "../utils/genShortUrl.js";
import { prisma } from "../config/db.js";
import { AppError } from "../errors/AppError.js";
import { validateUrl } from "../utils/validateUrl.js";
import { isLoggedIn } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @route POST /url
 * @description Create a short URL
 * @access Public
 */
router.post("/create", isLoggedIn, async (req, res) => {
  const { url } = req.body;
  if (!validateUrl(url)) {
    req.log.error("URL is invalid or missing");
    throw new AppError("Invalid URL", 400);
  }

  const shortUrl = genShortUrl();

  const createdUrl = await prisma.url.create({
    data: {
      longUrl: url,
      shortUrl: shortUrl,
      userId: req.user.userId,
    },
  });

  res.status(201).json({
    createdUrl,
  });

  req.log.info("short url created");
});

/**
 * @route GET /url/:url
 * @description Get the long URL for a given short URL
 * @access Public
 */
router.get("/:shortUrl", async (req, res) => {
  const { shortUrl } = req.params;

  const url = await prisma.url.findUnique({
    where: {
      shortUrl: shortUrl,
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

  res.redirect(longUrl);
});

export { router };
