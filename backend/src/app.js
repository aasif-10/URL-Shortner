import express from "express";
import pinoHttp from "pino-http";
import { logger } from "./config/logger.config.js";
import { router as heatlhzRoute } from "./routes/healthz.routes.js";
import { router as urlRoute } from "./routes/url.routes.js";
import { router as authRoute } from "./routes/auth.routes.js";
import { errorHandler } from "./middlewares/error-handler.middleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === "/healthz",
    },
    redact: ["req.headers.authorization", "req.headers.cookie"],
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

app.use("/healthz", heatlhzRoute);
app.use("/api/urls", urlRoute);
app.use("/api/auth", authRoute);

app.use(errorHandler);

export { app };
