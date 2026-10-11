import { Worker } from "bullmq";
import Redis from "ioredis";
import { prisma } from "../config/db.config.js";
import { cfg } from "../config/env.config.js";
import { logger } from "../config/logger.config.js";

const connection = new Redis(cfg.REDIS_URL, {
  maxRetriesPerRequest: null,
});

connection.on("error", (err) => {
  logger.error({ error: err }, "BullMQ Worker Redis connection error");
});

export const startClickWorker = () => {
  const worker = new Worker(
    "click-events",
    async (job) => {
      const { shortUrl } = job.data;

      await prisma.url.updateMany({
        where: {
          shortUrl: `${cfg.BASE_URL}/api/urls/${shortUrl}`,
        },
        data: {
          clicks: {
            increment: 1,
          },
        },
      });
    },
    {
      connection,
      concurrency: 10,
    },
  );

  worker.on("completed", (job) => {
    logger.debug(`Click recorded for URL: ${job.data.shortUrl}`);
  });

  worker.on("failed", (job, err) => {
    logger.error(
      { error: err, shortUrl: job?.data?.shortUrl },
      "Click job processing failed",
    );
  });

  logger.info("BullMQ Click Worker initialized");
  return worker;
};
