import Redis from "ioredis";
import { cfg } from "./env.config.js";

const redis = new Redis(cfg.REDIS_URL);

export { redis };
