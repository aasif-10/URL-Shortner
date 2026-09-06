import pino from "pino";

const logger = process.env.NODE_ENV
  ? pino({
      level: "info",
      transport: {
        target: "pino-pretty",
      },
    })
  : pino();

export { logger };
