import express from "express";
import pinoHttp from "pino-http";
import { logger } from "./config/logger.js";
import { router as heatlhzRoute } from "./routes/healthz.js";
import { router as urlRoute } from "./routes/url.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(
  pinoHttp({
    logger,
    redact: ["req.headers.authorization", "req.headers.cookie"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/healthz", heatlhzRoute);
app.use("/api/url", urlRoute);

app.use(errorHandler);

export { app };
