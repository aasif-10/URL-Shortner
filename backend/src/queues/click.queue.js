import { Queue } from "bullmq";
import Redis from "ioredis";
import { cfg } from "../config/env.config.js";
import { logger } from "../config/logger.config.js";

const connection = new Redis(cfg.REDIS_URL, {
  maxRetriesPerRequest: null,
});

connection.on("error", (err) => {
  logger.error({ error: err }, "BullMQ Queue Redis connection error");
});

export const clickQueue = new Queue("click-events", {
  connection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 100,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});

export const addClickJob = (shortUrl) => {
  return clickQueue.add("increment-click", { shortUrl });
};
