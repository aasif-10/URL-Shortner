import pino from "pino";

const logger =
  process.env.NODE_ENV === "development"
    ? pino({
        level: "info",
        transport: {
          target: "pino-pretty",
        },
      })
    : pino({
        level: "info",
        redact: [
          "req.headers.authorization",
          "req.headers.cookie",
          "req.headers['x-api-key']",
        ],
      });

export { logger };
