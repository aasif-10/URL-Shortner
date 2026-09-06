import express from "express";
import { genShortUrl } from "../utils/shortUrl.js";
import { prisma } from "../config/db.js";

const router = express.Router();

/**
 * @route POST /url
 * @description Create a short URL
 * @access Public
 */
router.post("/create", async (req, res) => {
  const { url } = req.body;

  const shortUrl = genShortUrl();

  const createdUrl = await prisma.url.create({
    data: {
      longUrl: url,
      shortUrl: shortUrl,
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

  const longUrl = url.longUrl;
  res.redirect(longUrl);
});

export { router };
